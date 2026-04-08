"""
JanSaathi AI - FastAPI Backend
Handles: AI chat, scheme matching, notifications, profile management, TTS
"""
from contextlib import asynccontextmanager
from dotenv import load_dotenv
load_dotenv()  # must be before any os.getenv() calls

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.api import chat, schemes, notifications, profile, health, tts
from app.api.tts import preload_model


# ── Lifespan: runs startup/shutdown logic around the server's life ─────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── STARTUP ──
    # Load the TTS model and pre-generate welcome audio clips.
    # This blocks startup until the model is in RAM, so the very first
    # /api/tts request does not incur a 30-60 s cold-start delay.
    print("[Startup] Pre-loading TTS model and welcome clips…")
    await preload_model()
    print("[Startup] Ready.")

    yield  # server is now running and accepting requests

    # ── SHUTDOWN ── (nothing to clean up for now)


app = FastAPI(
    title="JanSaathi AI Backend",
    description="Government scheme guidance and AI assistant for Indian citizens",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router,         prefix="/api",              tags=["Health"])
app.include_router(chat.router,           prefix="/api/chat",         tags=["Chat"])
app.include_router(schemes.router,        prefix="/api/schemes",      tags=["Schemes"])
app.include_router(notifications.router,  prefix="/api/notifications",tags=["Notifications"])
app.include_router(profile.router,        prefix="/api/profile",      tags=["Profile"])
app.include_router(tts.router,            prefix="/api",              tags=["TTS"])


@app.get("/")
async def root():
    return {"message": "JanSaathi AI Backend v1.0 🇮🇳", "status": "running"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
