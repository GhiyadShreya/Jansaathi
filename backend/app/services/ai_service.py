"""
AI service using Groq API (llama-3.3-70b-versatile)
Drop-in replacement for the previous Gemini-based service.
"""
import os
import json
import httpx
from typing import Optional

from app.models.models import UserProfile, Language

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "llama-3.3-70b-versatile"
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

LANG_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "pa": "Punjabi",
    "gu": "Gujarati",
}

LANG_INSTRUCTIONS = {
    "en": "Respond in English.",
    "hi": "हिंदी में उत्तर दें।",
    "pa": "ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ।",
    "gu": "ગુજરાતીમાં જવાબ આપો।",
}

DEMO_SCHEMES = [
    {"id": "pmkisan",    "title": "PM-Kisan Samman Nidhi",   "description": "Direct income support of ₹6,000/year to farmers.",       "eligibility": "Farmers with less than 2 hectares", "benefits": "₹6,000/year in 3 installments",   "category": "Agriculture"},
    {"id": "ayushman",   "title": "Ayushman Bharat PM-JAY",  "description": "Health coverage of ₹5 lakh per family.",                  "eligibility": "BPL families",                      "benefits": "₹5 lakh health cover",             "category": "Health"},
    {"id": "scholarship","title": "Post-Matric Scholarship",  "description": "Financial assistance for SC/ST/OBC students.",            "eligibility": "SC/ST/OBC students, income < ₹2.5L","benefits": "Tuition + maintenance allowance",  "category": "Education"},
]


async def _call_groq(system_prompt: str, user_message: str, max_tokens: int = 1024) -> str:
    """Core Groq API call — raises on HTTP error."""
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set in backend .env")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROQ_API_KEY}",
    }
    payload = {
        "model": GROQ_MODEL,
        "max_tokens": max_tokens,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_message},
        ],
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(GROQ_API_URL, json=payload, headers=headers)

    if not resp.is_success:
        raise RuntimeError(f"Groq API error {resp.status_code}: {resp.text[:300]}")

    data = resp.json()
    return data["choices"][0]["message"]["content"].strip()


# ── 1. get_chat_response ──────────────────────────────────────────────────────

async def get_chat_response(
    message: str,
    profile: Optional[UserProfile],
    language: str,
    history: list,
) -> str:
    if not GROQ_API_KEY:
        fallbacks = {
            "en": "I'm your JanSaathi assistant. Please set your GROQ_API_KEY to enable AI responses.",
            "hi": "मैं आपका जनसाथी सहायक हूँ। AI उत्तर के लिए GROQ_API_KEY सेट करें।",
            "pa": "ਮੈਂ ਤੁਹਾਡਾ ਜਾਨਸਾਥੀ ਸਹਾਇਕ ਹਾਂ। AI ਜਵਾਬਾਂ ਲਈ GROQ_API_KEY ਸੈੱਟ ਕਰੋ।",
            "gu": "હું તમારો JanSaathi સહાયક છું. AI ઉત્તર માટે GROQ_API_KEY સેટ કરો.",
        }
        return fallbacks.get(language, fallbacks["en"])

    profile_str = json.dumps(profile.model_dump() if profile else {})

    system_prompt = f"""You are JanSaathi (female AI assistant named Saathi), a warm and knowledgeable Indian government scheme helper.
{LANG_INSTRUCTIONS.get(language, 'Respond in English.')}
User Profile: {profile_str}

Guidelines:
- Be warm, friendly, and accessible to rural/low-literacy users
- Use simple language and avoid jargon
- If asked about schemes, reference profile details
- Keep responses concise (3-4 sentences max for simple queries)
- Always be encouraging and helpful"""

    try:
        return await _call_groq(system_prompt, message, max_tokens=1024)
    except Exception as e:
        print(f"[ai_service] get_chat_response error: {e}")
        fallback_err = {
            "en": "Sorry, I could not respond right now. Please try again.",
            "hi": "क्षमा करें, अभी जवाब नहीं दे पा रहा। कृपया दोबारा कोशिश करें।",
            "pa": "ਮਾਫ਼ ਕਰਨਾ, ਹੁਣੇ ਜਵਾਬ ਨਹੀਂ ਦੇ ਸਕਦਾ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
            "gu": "માફ કરશો, હમણાં જવાબ આપી શકાતો નથી. કૃપા કરીને ફરી પ્રયાસ કરો.",
        }
        return fallback_err.get(language, fallback_err["en"])


# ── 2. get_matched_schemes ────────────────────────────────────────────────────

async def get_matched_schemes(profile: UserProfile, language: str) -> list:
    if not GROQ_API_KEY:
        return DEMO_SCHEMES

    system_prompt = """You are a government scheme matcher for India.
Given a user profile, return ONLY a valid JSON array (no markdown, no explanation, no code fences).
Each object must have exactly these fields:
  id (string), title (string), description (string), eligibility (string),
  benefits (string), category (string).
Return 3-5 schemes most relevant to the profile using real Indian government schemes."""

    user_message = f"""Profile: Name={profile.name}, Age={profile.age}, State={profile.state},
Income={profile.income}, Occupation={profile.occupation}, Category={profile.category},
Documents={', '.join(profile.documents) if profile.documents else 'None'}.
Language for title/description/eligibility/benefits: {LANG_NAMES.get(language, 'English')}.
Return matched schemes as a JSON array only."""

    try:
        raw = await _call_groq(system_prompt, user_message, max_tokens=2048)
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(cleaned)
        if isinstance(parsed, list) and len(parsed) > 0:
            return parsed
        raise ValueError("Empty or invalid response")
    except Exception as e:
        print(f"[ai_service] get_matched_schemes error: {e}")
        return DEMO_SCHEMES


# ── 3. verify_document ────────────────────────────────────────────────────────

async def verify_document(doc_name: str, scheme_title: str, language: str) -> dict:
    if not GROQ_API_KEY:
        return {
            "valid": True,
            "reason": f"'{doc_name}' is commonly required for '{scheme_title}'. Please verify with the scheme portal.",
        }

    system_prompt = f"""You are a document verification assistant for Indian government schemes.
Return ONLY valid JSON with exactly two fields: "valid" (boolean) and "reason" (string, 1-2 sentences in {LANG_NAMES.get(language, 'English')}).
No markdown, no extra text, no code fences."""

    user_message = f'Is "{doc_name}" required/accepted for the Indian government scheme "{scheme_title}"?'

    try:
        raw = await _call_groq(system_prompt, user_message, max_tokens=256)
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(cleaned)
        if isinstance(result.get("valid"), bool) and isinstance(result.get("reason"), str):
            return result
        raise ValueError("Invalid response shape")
    except Exception as e:
        print(f"[ai_service] verify_document error: {e}")
        return {"valid": False, "reason": "Verification service temporarily unavailable."}
