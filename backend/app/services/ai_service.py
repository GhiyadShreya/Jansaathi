"""
AI service using Google Gemini API
"""
import os
import json
from typing import Optional
import google.generativeai as genai

from app.models.models import UserProfile, Language

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

LANG_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "pa": "Punjabi",
    "gu": "Gujarati",
}

DEMO_SCHEMES = [
    {"id": "pmkisan", "title": "PM-Kisan Samman Nidhi", "description": "Direct income support of ₹6,000/year to farmers.", "eligibility": "Farmers with less than 2 hectares", "benefits": "₹6,000/year in 3 installments", "category": "Agriculture"},
    {"id": "ayushman", "title": "Ayushman Bharat PM-JAY", "description": "Health coverage of ₹5 lakh per family.", "eligibility": "BPL families", "benefits": "₹5 lakh health cover", "category": "Health"},
    {"id": "scholarship", "title": "Post-Matric Scholarship", "description": "Financial assistance for SC/ST/OBC students.", "eligibility": "SC/ST/OBC students, income < ₹2.5L", "benefits": "Tuition + maintenance allowance", "category": "Education"},
]


async def get_chat_response(message: str, profile: Optional[UserProfile], language: str, history: list) -> str:
    if not GEMINI_API_KEY:
        fallbacks = {
            "en": "I'm your JanSaathi assistant. Please set your Gemini API key to enable AI responses.",
            "hi": "मैं आपका जनसाथी सहायक हूँ। AI उत्तर के लिए Gemini API key सेट करें।",
            "pa": "ਮੈਂ ਤੁਹਾਡਾ ਜਾਨਸਾਥੀ ਸਹਾਇਕ ਹਾਂ। AI ਜਵਾਬਾਂ ਲਈ Gemini API key ਸੈੱਟ ਕਰੋ।",
            "gu": "હું તમારો JanSaathi સહાયક છું. AI ઉત્તર માટે Gemini API key સેટ કરો.",
        }
        return fallbacks.get(language, fallbacks["en"])

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        profile_str = json.dumps(profile.model_dump() if profile else {})
        
        prompt = f"""You are JanSaathi (female AI assistant named Saathi), a warm and knowledgeable Indian government scheme helper.
User Profile: {profile_str}
Language: Respond in {LANG_NAMES.get(language, 'English')} only.
Message: {message}

Guidelines:
- Be warm, friendly, and accessible to rural/low-literacy users
- Use simple language and avoid jargon  
- If asked about schemes, reference profile details
- Keep responses concise (3-4 sentences max for simple queries)
- Always be encouraging and helpful"""

        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"


async def get_matched_schemes(profile: UserProfile, language: str) -> list:
    if not GEMINI_API_KEY:
        return DEMO_SCHEMES

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = f"""Based on this Indian citizen profile, recommend 3 most relevant government welfare/scholarship schemes.
Profile: Name: {profile.name}, Age: {profile.age}, Occupation: {profile.occupation}, State: {profile.state}, Income: {profile.income}, Category: {profile.category}

Return ONLY a JSON array with objects having: id, title, description, eligibility, benefits, category
Respond in {LANG_NAMES.get(language, 'English')} language for title/description/eligibility/benefits."""

        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception:
        return DEMO_SCHEMES


async def verify_document(doc_name: str, scheme_title: str, language: str) -> dict:
    if not GEMINI_API_KEY:
        return {"valid": True, "reason": f"'{doc_name}' is commonly required for '{scheme_title}'. Please verify with the scheme portal."}

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = f"""Is "{doc_name}" required for Indian government scheme "{scheme_title}"?
Return JSON: {{"valid": boolean, "reason": "1-2 sentence explanation in {LANG_NAMES.get(language, 'English')}"}}"""

        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception:
        return {"valid": False, "reason": "Verification service temporarily unavailable."}
