import sys
import os

# Add project root to sys.path so imports from 'agent' work
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.main import app

# Vercel expects 'app' to be the ASGI/WSGI handler
