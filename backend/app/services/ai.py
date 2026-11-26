"""
AI service layer - supports Ollama locally with Groq fallback.
Tries Ollama first, falls back to Groq if Ollama fails and GROQ_API_KEY is configured.
Set OLLAMA_BASE_URL and OLLAMA_MODEL in backend/.env to use Ollama.
Set GROQ_API_KEY and GROQ_MODEL in backend/.env to enable Groq fallback.
"""
import asyncio
import json
import os
import re
from typing import Any

import httpx

from app.services.reply_guard import FigureChecker, has_wrong_script, strip_wrong_script
from app.services.scheme_reference import MYSCHEME_URL, reference_block

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")


async def _call_groq(
    system_prompt: str, user_message: str, max_tokens: int = 1024, temperature: float = 0.3
) -> str:
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        # Low temperature: fewer spelling slips and invented details in Indian languages.
        "temperature": temperature,
        # Reasoning models spend part of this on hidden reasoning tokens. Groq also counts
        # max_tokens against the per-minute token limit, so don't set it higher than needed.
        "max_tokens": max_tokens,
    }
    if GROQ_MODEL.startswith("openai/gpt-oss"):
        payload["reasoning_effort"] = "low"
    async with httpx.AsyncClient(timeout=120) as client:
        url = f"{GROQ_BASE_URL}/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        resp = await client.post(url, json=payload, headers=headers)
        if resp.status_code == 429:
            # Per-minute limit hit: wait the few seconds Groq asks for, then retry once.
            try:
                wait = float(resp.headers.get("retry-after", "2"))
            except ValueError:
                wait = 2.0
            if wait <= 15:
                await asyncio.sleep(wait)
                resp = await client.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()

    try:
        return data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError) as e:
        raise ValueError(f"Unexpected Groq response format: {data}") from e


async def _call_ollama(system_prompt: str, user_message: str) -> str:
    payload = {
        "model": OLLAMA_MODEL,
        "stream": False,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
    }
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(f"{OLLAMA_BASE_URL}/api/chat", json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["message"]["content"].strip()


async def _call_ai(
    system_prompt: str, user_message: str, max_tokens: int = 1024, temperature: float = 0.3
) -> str:
    if GROQ_API_KEY:
        try:
            return await _call_groq(system_prompt, user_message, max_tokens, temperature)
        except Exception as groq_error:
            print(f"Groq failed: {groq_error}. Falling back to Ollama...")

    try:
        return await _call_ollama(system_prompt, user_message)
    except Exception as e:
        print(f"Ollama failed: {e}")
        raise e


_SEE_OFFICIAL = {
    "en": "See the official website for current details.",
    "hi": "ताज़ा जानकारी के लिए आधिकारिक वेबसाइट देखें।",
    "pa": "ਤਾਜ਼ਾ ਜਾਣਕਾਰੀ ਲਈ ਸਰਕਾਰੀ ਵੈੱਬਸਾਈਟ ਵੇਖੋ।",
    "gu": "તાજી માહિતી માટે સત્તાવાર વેબસાઇટ જુઓ.",
}

_SPELLING_RULE = (
    "SPELLING: write brand names, acronyms and technical terms in English letters exactly as "
    "spelled here: RuPay, DBT, LPG, Aadhaar, OTP, and scheme codes such as PM-KISAN. Do not "
    "transliterate them. "
    "Apart from those, use only the script of the reply language; never mix in letters from "
    "another Indian script."
)


async def get_chat_response(message: str, profile: dict, language: str) -> str:
    lang_instructions = {
        "en": "Respond in English.",
        "hi": "हिंदी में उत्तर दें।",
        "pa": "ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ।",
        "gu": "ગુજરાતીમાં જવાબ આપો.",
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
        "Use simple language.\n\n"
        f"{reference_block(include_hindi=language == 'hi')}\n\n"
        "ACCURACY RULES:\n"
        "- Prefer schemes from the reference above. Name each one exactly as written there "
        "(official name or its short code, e.g. PM-KISAN); you may add a translation, but never "
        "rename, abbreviate differently, or invent a scheme.\n"
        "- Quote amounts, ages and limits ONLY from the reference. If a detail is not in it, "
        "do not guess numbers; say the user should check the official site.\n"
        "- Do not state dates, months, deadlines, instalment numbers or payment schedules, and do "
        "not attach a feature or card to a scheme unless the reference says so for that scheme.\n"
        "- For every scheme you mention, include its official site as a markdown link.\n"
        f"- For state-specific schemes or anything outside the reference, say so and point to {MYSCHEME_URL} "
        "or the state government portal.\n\n"
        "FORMAT RULES (replies show in a small chat bubble and are read aloud):\n"
        "- No tables and no headings. Use short paragraphs and simple bullet lists.\n"
        "- Mention at most 4 schemes, about 150 words in total.\n"
        "- Bold only scheme names.\n"
        f"{_SPELLING_RULE}"
    )
    reply = await _call_ai(system_prompt, message)
    if has_wrong_script(reply, language):
        print("[AI] Reply mixed in letters from another script; regenerating once.")
        reply = strip_wrong_script(await _call_ai(system_prompt, message, temperature=0.1), language)
    checker = FigureChecker([message, *profile.values()], context=reply)
    cleaned, dropped = checker.clean(reply)
    if dropped:
        print(f"[AI] Removed sentences with unverified figures: {dropped}")
    return cleaned or reply


async def get_matched_schemes(profile: dict, language: str) -> list[dict]:
    language_instructions = {
        "en": "Return all scheme fields in English.",
        "hi": "Return all scheme fields in Hindi written in Devanagari script only.",
        "pa": "Return all scheme fields in Punjabi.",
        "gu": "Return all scheme fields in Gujarati.",
    }
    system_prompt = (
        "You are a government scheme matcher for India.\n"
        "Given a user profile, return ONLY a valid JSON array with no markdown or extra text.\n"
        "Each object must have exactly these fields:\n"
        "id (string), title (string), description (string), eligibility (string), "
        "benefits (string), category (string), required_documents (array of strings).\n"
        "Return 3 to 5 schemes most relevant to the profile.\n"
        "Choose schemes from the verified reference below. "
        "Take benefit amounts and limits only from the reference; never invent figures or schemes.\n"
        + (
            "title: use the official Hindi name from the reference followed by the code, "
            "e.g. 'प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)'.\n"
            if language == "hi" else
            "title: use the official English name from the reference exactly, followed by the code, "
            "e.g. 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)'. Never translate or transliterate "
            "the title; translate only the other fields.\n"
        )
        + f"{reference_block(include_hindi=language == 'hi')}\n"
        f"{language_instructions.get(language, 'Return all scheme fields in English.')}\n"
        f"{_SPELLING_RULE}"
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
    raw = await _call_ai(system_prompt, user_message, max_tokens=2500)
    if has_wrong_script(raw, language):
        print("[AI] Scheme list mixed in letters from another script; regenerating once.")
        raw = strip_wrong_script(
            await _call_ai(system_prompt, user_message, max_tokens=2500, temperature=0.1), language
        )
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    parsed = json.loads(cleaned)
    if isinstance(parsed, list) and parsed:
        for scheme in parsed:
            checker = FigureChecker(
                [str(v) for v in profile.values()],
                context=f"{scheme.get('title', '')} {scheme.get('id', '')}",
            )
            for field in ("description", "eligibility", "benefits"):
                if isinstance(scheme.get(field), str):
                    text, dropped = checker.clean(scheme[field])
                    if dropped:
                        print(f"[AI] Removed unverified figures from {scheme.get('title')}/{field}: {dropped}")
                    scheme[field] = text or _SEE_OFFICIAL.get(language, _SEE_OFFICIAL["en"])
            title = scheme.get("title")
            if isinstance(title, str):
                # "e-Shram (e-Shram)" -> "e-Shram"
                scheme["title"] = re.sub(r"^(.+?)\s*\(\s*\1\s*\)$", r"\1", title.strip())
        return parsed
    raise ValueError("Empty or invalid scheme list returned")


async def verify_document(doc_name: str, scheme_title: str, language: str) -> dict[str, Any]:
    default_reason_instruction = "The 'reason' in the JSON response must be in English."
    lang_instructions = {
        "en": "The 'reason' in the JSON response must be in English.",
        "hi": "JSON प्रतिक्रिया में 'reason' फ़ील्ड हिंदी में होना चाहिए।",
        "pa": "JSON ਜਵਾਬ ਵਿੱਚ 'reason' ਫੀਲਡ ਪੰਜਾਬੀ ਵਿੱਚ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ।",
        "gu": "JSON પ્રતિસાદમાં 'reason' ફીલ્ડ ગુજરાતી ભાષામાં હોવી જોઈએ.",
    }
    system_prompt = (
        "You are a document verification assistant for Indian government schemes.\n"
        "Given a document name and a scheme name, determine if the document is valid or accepted for that scheme.\n"
        "Be highly forgiving and inclusive. For example, 12th marksheet, 10th certificate, and fee receipt are valid for post-matric and educational scholarships.\n"
        "Standard identity documents, income certificates, and caste certificates are valid for most welfare schemes.\n"
        'Return ONLY valid JSON with exactly two fields: "valid" (boolean) and "reason" (string, 1 to 2 sentences).\n'
        "No markdown and no extra text.\n"
        f"{lang_instructions.get(language, default_reason_instruction)}"
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
