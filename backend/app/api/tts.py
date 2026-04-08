"""
Speakatoo-backed TTS endpoints with persistent local audio caching.

The cache is split by category so we can keep demo clips predictable:
  - choose_language
  - welcome
  - chat_response
  - generic
"""

from __future__ import annotations

import asyncio
import base64
import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urljoin

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

router = APIRouter()

SPEAKATOO_BASE_URL = os.getenv("SPEAKATOO_BASE_URL", "https://www.speakatoo.com")
SPEAKATOO_API_URL = urljoin(SPEAKATOO_BASE_URL, "/api/v1/voiceapi")
SPEAKATOO_API_KEY = os.getenv("SPEAKATOO_API_KEY", "")
SPEAKATOO_USERNAME = os.getenv("SPEAKATOO_USERNAME") or os.getenv("SPEAKATOO_EMAIL", "")
SPEAKATOO_PASSWORD = os.getenv("SPEAKATOO_PASSWORD", "")
SPEAKATOO_ENGINE = os.getenv("SPEAKATOO_TTS_ENGINE", "neural")
SPEAKATOO_FORMAT = os.getenv("SPEAKATOO_TTS_FORMAT", "wav").lower()
SPEAKATOO_SYNTHESIZE_TYPE = os.getenv("SPEAKATOO_SYNTHESIZE_TYPE", "save")

CACHE_DIR = Path(__file__).resolve().parents[2] / "data" / "tts_cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)
INDEX_PATH = CACHE_DIR / "index.json"

SUPPORTED_LANGS = ("en", "hi", "pa", "gu")
SUPPORTED_CATEGORIES = ("choose_language", "welcome", "chat_response", "generic")

LANGUAGE_VOICE_IDS = {
    "en": os.getenv("SPEAKATOO_VOICE_ID_EN", ""),
    "hi": os.getenv("SPEAKATOO_VOICE_ID_HI", ""),
    "pa": os.getenv("SPEAKATOO_VOICE_ID_PA", ""),
    "gu": os.getenv("SPEAKATOO_VOICE_ID_GU", ""),
}

PRESET_TEXTS: dict[str, dict[str, str]] = {
    "choose_language": {
        "en": "Please select your language. Hindi, English, Punjabi, or Gujarati.",
    },
    "welcome": {
        "en": "Hello! How can I help you today?",
        "hi": "नमस्ते! मैं आपकी कैसे मदद कर सकती हूँ?",
        "pa": "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦੀ ਹਾਂ?",
        "gu": "નમસ્તે! હું આજે તમારી કેવી રીતે મદદ કરી શકું?",
    },
}

_cache_lock = asyncio.Lock()


class TTSRequest(BaseModel):
    text: str = Field(min_length=1)
    lang: str
    category: str = "generic"
    cache_key: str | None = None


def _ensure_cache_index() -> None:
    if not INDEX_PATH.exists():
        INDEX_PATH.write_text("{}", encoding="utf-8")


def _read_cache_index() -> dict[str, Any]:
    _ensure_cache_index()
    try:
        return json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def _write_cache_index(data: dict[str, Any]) -> None:
    INDEX_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def _build_cache_key(category: str, lang: str, text: str, cache_key: str | None = None) -> str:
    source = cache_key.strip() if cache_key else text.strip()
    digest = hashlib.sha256(f"{category}|{lang}|{source}".encode("utf-8")).hexdigest()[:20]
    return digest


def _cache_path(category: str, lang: str, text: str, cache_key: str | None = None) -> Path:
    digest = _build_cache_key(category, lang, text, cache_key)
    directory = CACHE_DIR / category / lang
    directory.mkdir(parents=True, exist_ok=True)
    return directory / f"{digest}.{SPEAKATOO_FORMAT}"


def _cache_media_type(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".wav":
        return "audio/wav"
    if suffix == ".ogg":
        return "audio/ogg"
    return "audio/mpeg"


def _validate_lang(lang: str) -> None:
    if lang not in SUPPORTED_LANGS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported lang '{lang}'. Supported: {list(SUPPORTED_LANGS)}",
        )


def _validate_category(category: str) -> None:
    if category not in SUPPORTED_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported category '{category}'. Supported: {list(SUPPORTED_CATEGORIES)}",
        )


def _get_voice_id(lang: str) -> str:
    _validate_lang(lang)
    voice_id = LANGUAGE_VOICE_IDS.get(lang, "").strip()
    if not voice_id:
        raise HTTPException(
            status_code=503,
            detail=f"Speakatoo voice id not configured for '{lang}'.",
        )
    return voice_id


def _assert_speakatoo_ready() -> None:
    missing: list[str] = []
    if not SPEAKATOO_API_KEY:
        missing.append("SPEAKATOO_API_KEY")
    if not SPEAKATOO_USERNAME:
        missing.append("SPEAKATOO_USERNAME")
    if not SPEAKATOO_PASSWORD:
        missing.append("SPEAKATOO_PASSWORD")

    if missing:
        raise HTTPException(
            status_code=503,
            detail=f"Speakatoo is not fully configured. Missing: {', '.join(missing)}",
        )


def _safe_title(text: str) -> str:
    cleaned = "".join(ch if ch.isalnum() or ch in (" ", "_", "-") else " " for ch in text)
    compact = " ".join(cleaned.split())
    return (compact[:48] or "JanSaathi").replace(" ", "_")


def _preview_text(text: str, limit: int = 120) -> str:
    compact = " ".join(text.split())
    if len(compact) <= limit:
        return compact
    return f"{compact[:limit]}..."


def _extract_audio_bytes(payload: Any) -> bytes | None:
    candidates: list[str] = []

    def _collect(obj: Any) -> None:
        if isinstance(obj, dict):
            for key, value in obj.items():
                lowered = key.lower()
                if isinstance(value, str) and any(token in lowered for token in ("base64", "audio_content", "audio")):
                    candidates.append(value)
                else:
                    _collect(value)
        elif isinstance(obj, list):
            for item in obj:
                _collect(item)

    _collect(payload)
    for value in candidates:
        try:
            return base64.b64decode(value, validate=True)
        except Exception:
            continue
    return None


def _extract_audio_url(payload: Any) -> str | None:
    keys = {
        "url",
        "uri",
        "tts_uri",
        "audio_url",
        "audio_file",
        "file_url",
        "download_url",
        "path",
        "audio_path",
        "file_path",
        "voice_url",
    }

    def _search(obj: Any) -> str | None:
        if isinstance(obj, dict):
            for key, value in obj.items():
                if isinstance(value, str) and key.lower() in keys and value.strip():
                    return value
                found = _search(value)
                if found:
                    return found
        elif isinstance(obj, list):
            for item in obj:
                found = _search(item)
                if found:
                    return found
        return None

    return _search(payload)


async def _download_audio(url: str) -> bytes:
    target = url if url.startswith("http") else urljoin(SPEAKATOO_BASE_URL, url)
    async with httpx.AsyncClient(timeout=90.0, follow_redirects=True) as client:
        response = await client.get(target)
    if not response.is_success:
        raise RuntimeError(f"Could not download Speakatoo audio: {response.status_code}")
    return response.content


async def _request_speakatoo_audio(text: str, lang: str) -> bytes:
    _assert_speakatoo_ready()
    voice_id = _get_voice_id(lang)

    headers = {
        "Content-Type": "application/json",
        "X-API-KEY": SPEAKATOO_API_KEY,
    }
    payload = {
        "username": SPEAKATOO_USERNAME,
        "password": SPEAKATOO_PASSWORD,
        "tts_title": _safe_title(text),
        "ssml_mode": "0",
        "tts_engine": SPEAKATOO_ENGINE,
        "tts_format": SPEAKATOO_FORMAT,
        "tts_text": text,
        "tts_resource_ids": voice_id,
        "synthesize_type": SPEAKATOO_SYNTHESIZE_TYPE,
    }

    # print(
    #     "[TTS] Speakatoo request:",
    #     {
    #         "lang": lang,
    #         "voice_id": voice_id,
    #         "engine": SPEAKATOO_ENGINE,
    #         "format": SPEAKATOO_FORMAT,
    #         "synthesize_type": SPEAKATOO_SYNTHESIZE_TYPE,
    #         "title": payload["tts_title"],
    #         "text_preview": _preview_text(text),
    #         "text_length": len(text),
    #     },
    # )

    async with httpx.AsyncClient(timeout=120.0, follow_redirects=True) as client:
        response = await client.post(SPEAKATOO_API_URL, json=payload, headers=headers)

    content_type = response.headers.get("content-type", "").lower()
    # print(
    #     "[TTS] Speakatoo response meta:",
    #     {
    #         "status_code": response.status_code,
    #         "content_type": content_type,
    #     },
    # )
    if response.is_success and content_type.startswith("audio/"):
        return response.content

    try:
        data = response.json()
    except Exception:
        # print(f"[TTS] Speakatoo raw response: {response.text[:1000]}")
        raise RuntimeError(f"Speakatoo error {response.status_code}: {response.text[:300]}")

    print(f"[TTS] Speakatoo JSON response: {json.dumps(data, ensure_ascii=False)[:1500]}")

    if response.status_code >= 400:
        message = data.get("message") if isinstance(data, dict) else None
        raise RuntimeError(message or f"Speakatoo error {response.status_code}")

    if isinstance(data, dict) and (data.get("status") is False or data.get("result") is False):
        raise RuntimeError(data.get("message") or "Speakatoo synthesis failed.")

    audio_bytes = _extract_audio_bytes(data)
    if audio_bytes:
        return audio_bytes

    audio_url = _extract_audio_url(data)
    if audio_url:
        return await _download_audio(audio_url)

    raise RuntimeError("Speakatoo response did not include playable audio content.")


async def _cache_audio(
    *,
    category: str,
    lang: str,
    text: str,
    cache_key: str | None = None,
) -> Path:
    _validate_lang(lang)
    _validate_category(category)
    path = _cache_path(category, lang, text, cache_key)
    if path.exists():
        return path

    async with _cache_lock:
        if path.exists():
            return path

        audio_bytes = await _request_speakatoo_audio(text, lang)
        path.write_bytes(audio_bytes)

        index = _read_cache_index()
        index[str(path.relative_to(CACHE_DIR))] = {
            "category": category,
            "lang": lang,
            "cache_key": cache_key,
            "text": text,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "format": SPEAKATOO_FORMAT,
        }
        _write_cache_index(index)

    return path


async def _serve_preset(preset_key: str, lang: str) -> FileResponse:
    texts = PRESET_TEXTS.get(preset_key)
    if not texts:
        raise HTTPException(status_code=404, detail=f"Unknown preset '{preset_key}'.")
    if lang not in texts:
        raise HTTPException(
            status_code=400,
            detail=f"Preset '{preset_key}' is not available for '{lang}'.",
        )

    path = await _cache_audio(
        category=preset_key,
        lang=lang,
        text=texts[lang],
        cache_key=f"{preset_key}:{lang}",
    )
    return FileResponse(str(path), media_type=_cache_media_type(path))


async def preload_model() -> None:
    """
    Keep the original startup hook name so the rest of the backend can stay unchanged.
    Pre-generates only the fixed preset clips if Speakatoo is configured.
    """
    missing = []
    if not SPEAKATOO_API_KEY:
        missing.append("SPEAKATOO_API_KEY")
    if not SPEAKATOO_USERNAME:
        missing.append("SPEAKATOO_USERNAME")
    if not SPEAKATOO_PASSWORD:
        missing.append("SPEAKATOO_PASSWORD")

    voice_missing = [lang for lang, voice_id in LANGUAGE_VOICE_IDS.items() if not voice_id]
    if voice_missing:
        missing.append(f"voice ids for {', '.join(voice_missing)}")

    if missing:
        print(f"[TTS] Speakatoo preset preload skipped. Missing: {', '.join(missing)}")
        return

    print("[TTS] Preloading Speakatoo preset audio clips...")
    for preset_key, langs in PRESET_TEXTS.items():
        for lang, text in langs.items():
            try:
                await _cache_audio(
                    category=preset_key,
                    lang=lang,
                    text=text,
                    cache_key=f"{preset_key}:{lang}",
                )
            except Exception as exc:
                print(f"[TTS] Could not preload {preset_key}/{lang}: {exc}")
    print("[TTS] Speakatoo presets ready.")


@router.get("/tts/preset/{preset_key}/{lang}")
async def preset_audio(preset_key: str, lang: str):
    return await _serve_preset(preset_key, lang)


@router.get("/tts/welcome/{lang}")
async def welcome_audio(lang: str):
    return await _serve_preset("welcome", lang)


@router.post("/tts")
async def synthesize(req: TTSRequest):
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required.")

    _validate_lang(req.lang)
    category = req.category.strip() or "generic"
    _validate_category(category)

    try:
        path = await _cache_audio(
            category=category,
            lang=req.lang,
            text=text,
            cache_key=req.cache_key,
        )
    except HTTPException:
        raise
    except Exception as exc:
        print(f"[TTS] Speakatoo synthesis error: {exc}")
        raise HTTPException(status_code=503, detail=f"TTS unavailable: {str(exc)[:300]}")

    return FileResponse(str(path), media_type=_cache_media_type(path))
