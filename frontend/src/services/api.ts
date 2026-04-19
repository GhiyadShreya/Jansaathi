/**
 * api.ts - all backend communication lives here.
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

export async function getMatchedSchemes(
  profile: UserProfile,
  language: Language,
): Promise<Scheme[]> {
  try {
    const data = await post<{ schemes: Scheme[] }>('/schemes/match', { profile, language });
    return data.schemes;
  } catch (e) {
    console.error('getMatchedSchemes error:', e);
    try {
      const fallback = await get<{ schemes: Scheme[] }>('/schemes/demo');
      return fallback.schemes.slice(0, 3);
    } catch {
      return [];
    }
  }
}

export async function verifyDocument(
  doc_name: string,
  scheme_title: string,
  language: Language,
): Promise<{ valid: boolean; reason: string }> {
  try {
    return await post<{ valid: boolean; reason: string }>('/verify/', { doc_name, scheme_title, language });
  } catch (e) {
    console.error('verifyDocument error:', e);
    return {
      valid: false,
      reason: language === 'hi'
        ? 'इस समय दस्तावेज़ सत्यापित नहीं हो सका। कृपया फिर से कोशिश करें।'
        : 'Could not verify the document at this time. Please try again.',
    };
  }
}

export async function verifyDocumentOCR(
  file: File
): Promise<{ success: boolean; doc_type: 'aadhaar' | 'income' | 'unknown'; text: string; error?: string }> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${BASE_URL}/verify/ocr`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`OCR verification failed (${res.status})`);
    return res.json();
  } catch (e) {
    console.error('verifyDocumentOCR error:', e);
    return { success: false, doc_type: 'unknown', text: '', error: 'Could not process the document.' };
  }
}
