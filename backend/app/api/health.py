from fastapi import APIRouter
import os

router = APIRouter()


@router.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "JanSaathi AI Backend",
        "version": "1.0.0",
        "ai_configured": bool(os.getenv("GROQ_API_KEY")),
    }
