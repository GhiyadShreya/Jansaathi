# """
# AI service layer — all Groq API calls are centralised here.
# The API key is read from the GROQ_API_KEY environment variable (set in .env).
# """
# import os
# import json
# import httpx
# from typing import Any

# GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
# GROQ_MODEL = "llama-3.3-70b-versatile"


# def _get_api_key() -> str:
#     key = os.getenv("GROQ_API_KEY", "")
#     if not key:
#         raise RuntimeError("GROQ_API_KEY environment variable is not set")
#     return key


# async def call_groq(system_prompt: str, user_message: str, max_tokens: int = 1024) -> str:
#     """Low-level helper: send one system+user turn to Groq, return raw text."""
#     headers = {
#         "Content-Type": "application/json",
#         "Authorization": f"Bearer {_get_api_key()}",
#     }
#     payload = {
#         "model": GROQ_MODEL,
#         "max_tokens": max_tokens,
#         "messages": [
#             {"role": "system", "content": system_prompt},
#             {"role": "user", "content": user_message},
#         ],
#     }
#     async with httpx.AsyncClient(timeout=30) as client:
#         resp = await client.post(GROQ_API_URL, headers=headers, json=payload)
#         resp.raise_for_status()
#         data = resp.json()
#         return data["choices"][0]["message"]["content"].strip()


# async def get_chat_response(message: str, profile: dict, language: str) -> str:
#     lang_instructions = {
#         "en": "Respond in English.",
#         "hi": "हिंदी में उत्तर दें।",
#         "pa": "ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ।",
#         "gu": "ગુજરાતીમાં જવાબ આપો।",
#     }
#     system_prompt = (
#         f"You are Saathi, a helpful Indian government schemes assistant.\n"
#         f"{lang_instructions.get(language, 'Respond in English.')}\n"
#         f"User profile: Name={profile.get('name') or 'Unknown'}, "
#         f"Age={profile.get('age') or 'Unknown'}, "
#         f"State={profile.get('state') or 'Unknown'}, "
#         f"Income={profile.get('income') or 'Unknown'}, "
#         f"Occupation={profile.get('occupation') or 'Unknown'}, "
#         f"Category={profile.get('category') or 'Unknown'}.\n"
#         "Provide concise, accurate, helpful answers about Indian government welfare schemes. "
#         "Use simple language. Format with markdown where helpful."
#     )
#     return await call_groq(system_prompt, message, max_tokens=1024)


# async def get_matched_schemes(profile: dict, language: str) -> list[dict]:
#     system_prompt = (
#         "You are a government scheme matcher for India.\n"
#         "Given a user profile, return ONLY a valid JSON array (no markdown, no explanation).\n"
#         "Each object must have exactly these fields:\n"
#         "  id (string), title (string), description (string), eligibility (string),\n"
#         "  benefits (string), category (string).\n"
#         "Return 3–5 schemes most relevant to the profile.\n"
#         "Use real Indian government schemes (PM-Kisan, Ayushman Bharat, PMAY, Mudra, etc.)."
#     )
#     user_message = (
#         f"Profile: Name={profile.get('name')}, Age={profile.get('age')}, "
#         f"State={profile.get('state')}, Income={profile.get('income')}, "
#         f"Occupation={profile.get('occupation')}, Category={profile.get('category')}, "
#         f"Gender={profile.get('gender')}, "
#         f"Documents={', '.join(profile.get('documents', [])) or 'None'}.\n"
#         f"Language preference: {language}.\n"
#         "Return matched schemes as a JSON array."
#     )
#     raw = await call_groq(system_prompt, user_message, max_tokens=2048)
#     cleaned = raw.replace("```json", "").replace("```", "").strip()
#     parsed = json.loads(cleaned)
#     if isinstance(parsed, list) and parsed:
#         return parsed
#     raise ValueError("Empty or invalid scheme list returned")


# async def verify_document(doc_name: str, scheme_title: str) -> dict[str, Any]:
#     system_prompt = (
#         "You are a document verification assistant for Indian government schemes.\n"
#         "Given a document name and a scheme name, determine if the document is valid/accepted for that scheme.\n"
#         'Return ONLY valid JSON with exactly two fields: "valid" (boolean) and "reason" (string, 1–2 sentences).\n'
#         "No markdown, no extra text."
#     )
#     user_message = (
#         f'Document: "{doc_name}"\n'
#         f'Scheme: "{scheme_title}"\n'
#         "Is this document accepted for this scheme? Return JSON."
#     )
#     raw = await call_groq(system_prompt, user_message, max_tokens=256)
#     cleaned = raw.replace("```json", "").replace("```", "").strip()
#     result = json.loads(cleaned)
#     if isinstance(result.get("valid"), bool) and isinstance(result.get("reason"), str):
#         return result
#     raise ValueError("Unexpected response shape from Groq")

"""
AI service layer — uses Ollama running locally.
Make sure Ollama is running: `ollama serve`
Pull the model first:  `ollama pull llama3.2`
Set OLLAMA_BASE_URL and OLLAMA_MODEL in backend/.env to override defaults.
"""
import json
import os
import httpx
from typing import Any

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL    = os.getenv("OLLAMA_MODEL", "llama3.2")


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
    return await _call_ollama(system_prompt, message)


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
    raw = await _call_ollama(system_prompt, user_message)
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    parsed = json.loads(cleaned)
    if isinstance(parsed, list) and parsed:
        return parsed
    raise ValueError("Empty or invalid scheme list returned")


async def verify_document(doc_name: str, scheme_title: str) -> dict[str, Any]:
    system_prompt = (
        "You are a document verification assistant for Indian government schemes.\n"
        "Given a document name and a scheme name, determine if the document is valid/accepted for that scheme.\n"
        'Return ONLY valid JSON with exactly two fields: "valid" (boolean) and "reason" (string, 1–2 sentences).\n'
        "No markdown, no extra text."
    )
    user_message = (
        f'Document: "{doc_name}"\n'
        f'Scheme: "{scheme_title}"\n'
        "Is this document accepted for this scheme? Return JSON."
    )
    raw = await _call_ollama(system_prompt, user_message)
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    result = json.loads(cleaned)
    if isinstance(result.get("valid"), bool) and isinstance(result.get("reason"), str):
        return result
    raise ValueError("Unexpected response shape from Ollama")