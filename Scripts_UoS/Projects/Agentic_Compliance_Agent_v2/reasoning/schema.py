from pydantic import BaseModel, Field
from typing import List, Literal
from datetime import datetime
from typing import Optional, Union, Any

class ReasoningNode(BaseModel):
    fact: str = Field(..., description="Verbatim fact from user input")
    legal_meaning: str = Field(..., description="Interpretation of the fact in legal terms")
    regulation: Literal["GDPR", "CCPA", "FDA", "IRS", "Other"] # Added 'Other' for fallback
    article: str = Field(..., description="Exact article or section reference")
    justification: str = Field(..., description="Why this fact maps to this article")
    regulation_version: Optional[str] = None
    effective_date: Optional[Union[str, Any]] = None
class AnalysisOutput(BaseModel):
    reasoning_map: List[ReasoningNode]
    risk_level: Literal["Low", "Medium", "High"]
    confidence: float = Field(..., ge=0.0, le=1.0)
    summary: str
