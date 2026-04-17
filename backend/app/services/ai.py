"""
AI service layer — supports Ollama locally with Groq fallback.
Tries Ollama first, falls back to Groq if Ollama fails and GROQ_API_KEY is configured.
Set OLLAMA_BASE_URL and OLLAMA_MODEL in backend/.env to use Ollama.
Set GROQ_API_KEY and GROQ_MODEL in backend/.env to enable Groq fallback.
"""
import json
import os
import httpx
from typing import Any

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")


def _compose_prompt(system_prompt: str, user_message: str) -> str:
    return (
        f"{system_prompt}\n\nUser: {user_message}\n"  # Groq text models expect a single input string
    )


async def _call_groq(system_prompt: str, user_message: str) -> str:
    """Send the prompt to Groq and return the generated text."""
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.7,
        "max_tokens": 1024
    }
    async with httpx.AsyncClient(timeout=120) as client:
        url = f"{GROQ_BASE_URL}/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        resp = await client.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()

    try:
        content = data["choices"][0]["message"]["content"]
        return content.strip()
    except (KeyError, IndexError) as e:
        raise ValueError(f"Unexpected Groq response format: {data}") from e


async def _call_ollama(system_prompt: str, user_message: str) -> str:
    """Send a system+user turn to Ollama's /api/chat, return response text."""
    payload = {
        "model": OLLAMA_MODEL,
        "stream": False,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_message},
        ],
    }
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(f"{OLLAMA_BASE_URL}/api/chat", json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["message"]["content"].strip()


async def _call_ai(system_prompt: str, user_message: str) -> str:
    # Prefer Groq if API key is configured, as it is generally faster and more reliable
    if GROQ_API_KEY:
        try:
            return await _call_groq(system_prompt, user_message)
        except Exception as groq_error:
            print(f"Groq failed: {groq_error}. Falling back to Ollama...")

    # Otherwise, or if Groq fails, try Ollama
    try:
        return await _call_ollama(system_prompt, user_message)
    except Exception as e:
        print(f"Ollama failed: {e}")
        raise e


# ── Public functions (same signatures as before) ──────────────────────────────

async def get_chat_response(message: str, profile: dict, language: str) -> str:
    lang_instructions = {
        "en": "Respond in English.",
        "hi": "हिंदी में उत्तर दें।",
        "pa": "ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ।",
        "gu": "ગુજરાતીમાં જવાબ આપો।",
    }
    system_prompt = (
        "You are Saathi, a helpful Indian government schemes assistant.\n"
        f"{lang_instructions.get(language, 'Respond in English.')}\n"
        f"User profile: Name={profile.get('name') or 'Unknown'}, "
        f"Age={profile.get('age') or 'Unknown'}, "
        f"State={profile.get('state') or 'Unknown'}, "
        f"Income={profile.get('income') or 'Unknown'}, "
        f"Occupation={profile.get('occupation') or 'Unknown'}, "
        f"Category={profile.get('category') or 'Unknown'}.\n"
        "Provide concise, accurate, helpful answers about Indian government welfare schemes. "
        "Use simple language. Format with markdown where helpful."
    )
    return await _call_ai(system_prompt, message)


async def get_matched_schemes(profile: dict, language: str) -> list[dict]:
    system_prompt = (
        "You are a government scheme matcher for India.\n"
        "Given a user profile, return ONLY a valid JSON array (no markdown, no explanation).\n"
        "Each object must have exactly these fields:\n"
        "  id (string), title (string), description (string), eligibility (string),\n"
        "  benefits (string), category (string).\n"
        "Return 3–5 schemes most relevant to the profile.\n"
        "Use real Indian government schemes (PM-Kisan, Ayushman Bharat, PMAY, Mudra, etc.)."
    )
    user_message = (
        f"Profile: Name={profile.get('name')}, Age={profile.get('age')}, "
        f"State={profile.get('state')}, Income={profile.get('income')}, "
        f"Occupation={profile.get('occupation')}, Category={profile.get('category')}, "
        f"Gender={profile.get('gender')}, "
        f"Documents={', '.join(profile.get('documents', [])) or 'None'}.\n"
        f"Language preference: {language}.\n"
        "Return matched schemes as a JSON array."
    )
    raw = await _call_ai(system_prompt, user_message)
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    parsed = json.loads(cleaned)
    if isinstance(parsed, list) and parsed:
        return parsed
    raise ValueError("Empty or invalid scheme list returned")


async def verify_document(doc_name: str, scheme_title: str, language: str) -> dict[str, Any]:
    lang_instructions = {
        "en": "The 'reason' in the JSON response must be in English.",
        "hi": "JSON प्रतिक्रिया में 'reason' फ़ील्ड हिंदी में होना चाहिए।",
        "pa": "JSON ਜਵਾਬ ਵਿੱਚ 'reason' ਫੀਲਡ ਪੰਜਾਬੀ ਵਿੱਚ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।",
        "gu": "JSON પ્રતિસાદમાં 'reason' ફીલ્ડ ગુજરાતીમાં હોવું જોઈએ.",
    }
    system_prompt = (
        "You are a document verification assistant for Indian government schemes.\n"
        "Given a document name and a scheme name, determine if the document is valid/accepted for that scheme.\n"
        "Be highly forgiving and inclusive. For example, '12th marksheet', '10th certificate', and 'fee receipt' are perfectly valid for Post-Matric and educational scholarships (Post-Matric means post-10th grade, including 11th, 12th, and college).\n"
        "Standard identity documents (Aadhaar, PAN, Voter ID), income certificates, and caste certificates are valid for almost all welfare schemes.\n"
        'Return ONLY valid JSON with exactly two fields: "valid" (boolean) and "reason" (string, 1–2 sentences).\n'
        "No markdown, no extra text.\n"
        f"{lang_instructions.get(language, 'The `reason` in the JSON response must be in English.')}"
    )
    user_message = (
        f'Document: "{doc_name}"\n'
        f'Scheme: "{scheme_title}"\n'
        "Is this document accepted for this scheme? Return JSON."
    )
    raw = await _call_ai(system_prompt, user_message)
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    result = json.loads(cleaned)
    if isinstance(result.get("valid"), bool) and isinstance(result.get("reason"), str):
        return result
    raise ValueError("Unexpected response shape from the AI service")
