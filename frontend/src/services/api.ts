/**
 * api.ts — all backend communication lives here.
 * The frontend never calls Groq directly anymore.
 */

import { UserProfile, Scheme, Language } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API GET ${path} failed (${res.status})`);
  return res.json();
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export async function getChatResponse(
  message: string,
  profile: UserProfile,
  language: Language,
): Promise<string> {
  try {
    const data = await post<{ reply: string }>('/chat/', { message, profile, language });
    return data.reply;
  } catch (e) {
    console.error('getChatResponse error:', e);
    return language === 'hi'
      ? 'क्षमा करें, अभी जवाब नहीं दे पा रहा। कृपया दोबारा कोशिश करें।'
      : 'Sorry, I could not respond right now. Please try again.';
  }
}

export async function getChatHistory(): Promise<{ role: 'user' | 'ai'; text: string }[]> {
  const data = await get<{ history: { role: 'user' | 'ai'; text: string }[] }>('/chat/history');
  return data.history;
}

export async function clearChatHistory(): Promise<void> {
  await fetch(`${BASE_URL}/chat/history`, { method: 'DELETE' });
}

// ── Schemes ───────────────────────────────────────────────────────────────────

export async function getMatchedSchemes(
  profile: UserProfile,
  language: Language,
): Promise<Scheme[]> {
  try {
    const data = await post<{ schemes: Scheme[] }>('/schemes/match', { profile, language });
    return data.schemes;
  } catch (e) {
    console.error('getMatchedSchemes error:', e);
    // Fallback: fetch demo schemes from backend
    try {
      const fallback = await get<{ schemes: Scheme[] }>('/schemes/demo');
      return fallback.schemes.slice(0, 3);
    } catch {
      return [];
    }
  }
}

// ── Verify ────────────────────────────────────────────────────────────────────

export async function verifyDocument(
  doc_name: string,
  scheme_title: string,
): Promise<{ valid: boolean; reason: string }> {
  try {
    return await post<{ valid: boolean; reason: string }>('/verify/', { doc_name, scheme_title });
  } catch (e) {
    console.error('verifyDocument error:', e);
    return { valid: false, reason: 'Could not verify the document at this time. Please try again.' };
  }
}