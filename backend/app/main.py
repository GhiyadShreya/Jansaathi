"""
JanSaathi AI - FastAPI Backend
Handles: AI chat, scheme matching, document verification, notifications, profile management
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.api import chat, schemes, notifications, profile, health, verify

from dotenv import load_dotenv
load_dotenv()

app = FastAPI(
    title="JanSaathi AI Backend",
    description="Government scheme guidance and AI assistant for Indian citizens",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router,         prefix="/api",              tags=["Health"])
app.include_router(chat.router,           prefix="/api/chat",         tags=["Chat"])
app.include_router(schemes.router,        prefix="/api/schemes",      tags=["Schemes"])
app.include_router(verify.router,         prefix="/api/verify",       tags=["Verify"])
app.include_router(notifications.router,  prefix="/api/notifications", tags=["Notifications"])
app.include_router(profile.router,        prefix="/api/profile",      tags=["Profile"])


@app.get("/")
async def root():
    return {"message": "JanSaathi AI Backend v1.0 🇮🇳", "status": "running"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)