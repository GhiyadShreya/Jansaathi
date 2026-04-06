// src/services/groq.ts
// Drop-in replacement for services/gemini.ts — uses Groq API

import { UserProfile, Scheme, Language, DEMO_SCHEMES } from '../types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_API_KEY = "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"

// ── Helper: call Groq ──────────────────────────────────────────────────────────
async function callGroq(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 1024
): Promise<string> {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

// ── 1. getChatResponse ────────────────────────────────────────────────────────
export async function getChatResponse(
  userMessage: string,
  profile: UserProfile,
  language: Language
): Promise<string> {
  const langInstructions: Record<Language, string> = {
    en: 'Respond in English.',
    hi: 'हिंदी में उत्तर दें।',
    pa: 'ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ।',
    gu: 'ગુજરાતીમાં જવાબ આપો।',
  };

  const systemPrompt = `You are Saathi, a helpful Indian government schemes assistant.
${langInstructions[language]}
User profile: Name=${profile.name || 'Unknown'}, Age=${profile.age || 'Unknown'}, 
State=${profile.state || 'Unknown'}, Income=${profile.income || 'Unknown'}, 
Occupation=${profile.occupation || 'Unknown'}, Category=${profile.category || 'Unknown'}.
Provide concise, accurate, helpful answers about Indian government welfare schemes.
Use simple language. Format with markdown where helpful.`;

  try {
    return await callGroq(systemPrompt, userMessage, 1024);
  } catch (e) {
    console.error('getChatResponse error:', e);
    return language === 'hi'
      ? 'क्षमा करें, अभी जवाब नहीं दे पा रहा। कृपया दोबारा कोशिश करें।'
      : 'Sorry, I could not respond right now. Please try again.';
  }
}

// ── 2. getMatchedSchemes ──────────────────────────────────────────────────────
export async function getMatchedSchemes(
  profile: UserProfile,
  language: Language
): Promise<Scheme[]> {
  const systemPrompt = `You are a government scheme matcher for India.
Given a user profile, return ONLY a valid JSON array (no markdown, no explanation).
Each object must have exactly these fields:
  id (string), name (string), description (string), eligibility (string),
  benefit (string), category (string), deadline (string), applyUrl (string).
Return 3–5 schemes most relevant to the profile.
Use real Indian government schemes (PM-Kisan, Ayushman Bharat, PMAY, Mudra, etc.).`;

  const userMessage = `Profile: Name=${profile.name}, Age=${profile.age}, State=${profile.state}, 
Income=${profile.income}, Occupation=${profile.occupation}, 
Category=${profile.category}, Gender=${profile.gender},
Documents=${profile.documents?.join(', ') || 'None'}.
Language preference: ${language}.
Return matched schemes as a JSON array.`;

  try {
    const raw = await callGroq(systemPrompt, userMessage, 2048);

    // Strip accidental markdown fences
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed: Scheme[] = JSON.parse(cleaned);

    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    throw new Error('Empty or invalid response');
  } catch (e) {
    console.error('getMatchedSchemes error:', e);
    // Fallback to demo schemes filtered by profile
    return DEMO_SCHEMES.slice(0, 3);
  }
}

// ── 3. verifyDocument ────────────────────────────────────────────────────────
export async function verifyDocument(
  documentName: string,
  schemeName: string
): Promise<{ valid: boolean; reason: string }> {
  const systemPrompt = `You are a document verification assistant for Indian government schemes.
Given a document name and a scheme name, determine if the document is valid/accepted for that scheme.
Return ONLY valid JSON with exactly two fields: "valid" (boolean) and "reason" (string, 1–2 sentences).
No markdown, no extra text.`;

  const userMessage = `Document: "${documentName}"
Scheme: "${schemeName}"
Is this document accepted for this scheme? Return JSON.`;

  try {
    const raw = await callGroq(systemPrompt, userMessage, 256);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleaned);

    if (typeof result.valid === 'boolean' && typeof result.reason === 'string') {
      return result;
    }
    throw new Error('Invalid shape');
  } catch (e) {
    console.error('verifyDocument error:', e);
    return {
      valid: false,
      reason: 'Could not verify the document at this time. Please try again.',
    };
  }
}