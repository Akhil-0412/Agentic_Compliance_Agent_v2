import os
from dotenv import load_dotenv
load_dotenv()
import time
import logging
import sys
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager

from agent.analyst import analyze
from reasoning.schema import AnalysisOutput

# 1. Structured Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger("agentic-compliance")

# 2. Rate Limiter Strategy
limiter = Limiter(key_func=get_remote_address)

# 3. Pydantic Models for Documentation
class ComplianceResponse(BaseModel):
    analysis: AnalysisOutput = Field(..., description="Details from analysis engine")
    decision: str = Field(..., description="Final decision: AUTO_APPROVED / REVIEW_REQUIRED / BLOCKED")

class QueryRequest(BaseModel):
    query: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up Agentic Compliance Agent v2...")
    # Lazy load models if possible here
    yield
    logger.info("Shutting down...")

app = FastAPI(
    title="Agentic Compliance Agent v2",
    version="2.0",
    lifespan=lifespan
)

# 4. Global Exception Handler (Masking)
# @app.exception_handler(Exception)
# async def global_exception_handler(request: Request, exc: Exception):
#     logger.error(f"Global error: {str(exc)}", exc_info=True)
#     return {
#         "detail": "Internal Server Error. Please contact support."
#     }

# Rate Limiter Exception Handler
# app.state.limiter = limiter
# app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 5. CORS Hardening
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        FRONTEND_URL,
        "https://agentic-compliance.vercel.app",
        "https://*.vercel.app" # Allow all Vercel previews
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 6. Lightweight Health Check (No ML load)
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "compliance-agent"}

@app.get("/metrics")
def metrics():
    return {
        "status": "running",
        "version": "v2.0",
    }

@app.get("/")
def root():
    return {"message": "Agentic Compliance API v2.0 - Active"}

@app.post("/analyze", response_model=ComplianceResponse)
# @limiter.limit("10/minute")
def run_analysis(request: QueryRequest, request_obj: Request):
    start_time = time.time()
    try:
        logger.info(f"Received query: {request.query[:100]}...")
        
        # Core Analysis
        result = analyze(request.query)
        
        elapsed = round(time.time() - start_time, 2)
        logger.info(f"Analysis complete. Decision: {result.get('decision')} | Time: {elapsed}s")
        
        return result

    except Exception as e:
        logger.error(f"Analysis Failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing compliance request")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
