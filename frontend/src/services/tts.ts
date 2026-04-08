import { Language } from '../types';

const TTS_LANG_MAP: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  pa: 'pa-IN',
  gu: 'gu-IN',
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

type TtsCategory = 'choose_language' | 'welcome' | 'chat_response' | 'generic';
type PresetKey = 'choose_language' | 'welcome';

interface SpeakOptions {
  category?: TtsCategory;
  cacheKey?: string;
}

const PRESET_LIPSYNC_TEXT: Record<PresetKey, Record<Language, string>> = {
  choose_language: {
    en: 'Please select your language. Hindi, English, Punjabi, or Gujarati.',
    hi: 'Please select your language. Hindi, English, Punjabi, or Gujarati.',
    pa: 'Please select your language. Hindi, English, Punjabi, or Gujarati.',
    gu: 'Please select your language. Hindi, English, Punjabi, or Gujarati.',
  },
  welcome: {
    en: 'Hello! How can I help you today?',
    hi: 'नमस्ते! मैं आपकी कैसे मदद कर सकती हूँ?',
    pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦੀ ਹਾਂ?',
    gu: 'નમસ્તે! હું આજે તમારી કેવી રીતે મદદ કરી શકું?',
  },
};

let isSpeakingCallback: ((val: boolean) => void) | null = null;
let isCancelled = false;
let lastText = '';
let lastLang: Language = 'en';
let lastOptions: SpeakOptions | undefined;
let activeAudio: HTMLAudioElement | null = null;
let activeSpeechTimeout: number | null = null;

export async function resumeAudioContext(): Promise<void> {
  return Promise.resolve();
}

export function registerSpeakingCallback(cb: (val: boolean) => void) {
  isSpeakingCallback = cb;
}

export function registerAudioBufferCallback(cb: (buf: AudioBuffer, text: string, lang: Language) => void) {
  void cb;
  return () => {};
}

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`{1,3}[\s\S]*?`{1,3}/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
    .replace(/>\s*/g, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?।])\s+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 1);
}

function getVoice(lang: Language): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const langCode = TTS_LANG_MAP[lang];
  const prefix = langCode.split('-')[0];

  return (
    voices.find(voice => voice.lang === langCode) ||
    voices.find(voice => voice.lang.startsWith(prefix)) ||
    voices[0] ||
    null
  );
}

async function playBlob(blob: Blob, text: string, lang: Language, onEnd?: () => void): Promise<void> {
  if (isCancelled) return;
  void text;
  void lang;

  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  activeAudio = audio;

  audio.onended = () => {
    URL.revokeObjectURL(url);
    if (activeAudio === audio) activeAudio = null;
    if (!isCancelled) {
      isSpeakingCallback?.(false);
      onEnd?.();
    }
  };

  audio.onerror = () => {
    URL.revokeObjectURL(url);
    if (activeAudio === audio) activeAudio = null;
    if (!isCancelled) {
      isSpeakingCallback?.(false);
      onEnd?.();
    }
  };

  try {
    await audio.play();
  } catch (err) {
    console.warn('[TTS] Audio autoplay blocked:', err);
  }
}

async function speakWithBackend(text: string, lang: Language, onEnd?: () => void, options?: SpeakOptions): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      lang,
      category: options?.category || 'generic',
      cache_key: options?.cacheKey || null,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `TTS request failed with ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('audio')) {
    throw new Error('Backend TTS did not return audio.');
  }

  const blob = await response.blob();
  await playBlob(blob, text, lang, onEnd);
}

async function speakPreset(presetKey: PresetKey, lang: Language, onEnd?: () => void): Promise<void> {
  stopSpeaking();
  isCancelled = false;
  isSpeakingCallback?.(true);

  try {
    const response = await fetch(`${API_BASE}/api/tts/preset/${presetKey}/${lang}`);
    if (!response.ok) {
      throw new Error(await response.text());
    }

    const blob = await response.blob();
    await playBlob(blob, '', lang, onEnd);
  } catch (err) {
    console.warn(`[TTS] Preset '${presetKey}' failed, using browser fallback:`, err);
    isSpeakingCallback?.(false);
    if (presetKey === 'choose_language') {
      speakWithBrowserTTS('Please select your language. Hindi, English, Punjabi, or Gujarati.', 'en', onEnd);
    } else {
      onEnd?.();
    }
  }
}

function speakSentences(sentences: string[], lang: Language, index: number, onEnd?: () => void) {
  if (isCancelled || index >= sentences.length) {
    if (!isCancelled) {
      isSpeakingCallback?.(false);
      onEnd?.();
    }
    return;
  }

  const utterance = new SpeechSynthesisUtterance(sentences[index]);
  const voice = getVoice(lang);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = TTS_LANG_MAP[lang];
  }

  utterance.rate = lang === 'en' ? 0.9 : 0.82;
  utterance.pitch = 1.05;
  utterance.onend = () => {
    if (!isCancelled) {
      speakSentences(sentences, lang, index + 1, onEnd);
    }
  };
  utterance.onerror = () => {
    if (!isCancelled) {
      speakSentences(sentences, lang, index + 1, onEnd);
    }
  };

  window.speechSynthesis.speak(utterance);
}

function speakWithBrowserTTS(text: string, lang: Language, onEnd?: () => void): void {
  if (!window.speechSynthesis) {
    isSpeakingCallback?.(false);
    onEnd?.();
    return;
  }

  const sentences = splitIntoSentences(text);
  if (sentences.length === 0) {
    isSpeakingCallback?.(false);
    onEnd?.();
    return;
  }

  const start = () => speakSentences(sentences, lang, 0, onEnd);
  const voices = window.speechSynthesis.getVoices();

  if (voices.length > 0) {
    start();
    return;
  }

  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.onvoiceschanged = null;
    if (!isCancelled) start();
  };

  setTimeout(() => {
    if (!isCancelled && window.speechSynthesis.getVoices().length > 0) {
      start();
    }
  }, 300);
}

export async function speakWelcome(lang: Language, onEnd?: () => void): Promise<void> {
  await speakPreset('welcome', lang, onEnd);
}

export async function speakChooseLanguage(onEnd?: () => void): Promise<void> {
  await speakPreset('choose_language', 'en', onEnd);
}

export function replayLast(): void {
  if (lastText) {
    speak(lastText, lastLang, undefined, lastOptions);
  }
}

export function speak(text: string, lang: Language, onEnd?: () => void, options?: SpeakOptions): void {
  stopSpeaking();
  isCancelled = false;
  lastText = text;
  lastLang = lang;
  lastOptions = options;
  isSpeakingCallback?.(true);

  const clean = stripMarkdown(text);
  if (!clean) {
    isSpeakingCallback?.(false);
    onEnd?.();
    return;
  }

  speakWithBackend(clean, lang, onEnd, options).catch((err) => {
    console.warn('[TTS] Backend speech failed, using browser fallback:', err);
    if (!isCancelled) {
      speakWithBrowserTTS(clean, lang, onEnd);
    }
  });
}

export function stopSpeaking(): void {
  isCancelled = true;
  window.speechSynthesis?.cancel();
  if (activeSpeechTimeout !== null) {
    window.clearTimeout(activeSpeechTimeout);
    activeSpeechTimeout = null;
  }
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = '';
    activeAudio = null;
  }
  isSpeakingCallback?.(false);
}

export function initSpeechRecognition(
  lang: Language,
  onResult: (text: string) => void,
  onEnd: () => void
): (() => void) | null {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) return null;

  const recognition = new SR();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = TTS_LANG_MAP[lang];
  recognition.onresult = (event: any) => onResult(event.results[0][0].transcript);
  recognition.onerror = onEnd;
  recognition.onend = onEnd;
  recognition.start();

  return () => recognition.stop();
}
