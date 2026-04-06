import { Language } from '../types';

const TTS_LANG_MAP: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  pa: 'pa-IN',
  gu: 'gu-IN',
};

let isSpeakingCallback: ((val: boolean) => void) | null = null;
let isCancelled = false;
// Store last spoken text+lang for replay
let lastText = '';
let lastLang: Language = 'en';

export function registerSpeakingCallback(cb: (val: boolean) => void) {
  isSpeakingCallback = cb;
}

// Strip markdown symbols before speaking
function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s*/g, '')               // headings: ### Title → Title
    .replace(/\*\*(.*?)\*\*/g, '$1')         // bold: **text** → text
    .replace(/\*(.*?)\*/g, '$1')             // italic: *text* → text
    .replace(/`{1,3}[\s\S]*?`{1,3}/g, '')   // code blocks → remove
    .replace(/^\s*[-*+]\s+/gm, '')           // bullet points
    .replace(/^\s*\d+\.\s+/gm, '')           // numbered lists
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → keep label
    .replace(/_{1,2}(.*?)_{1,2}/g, '$1')     // _italic_ / __bold__
    .replace(/>\s*/g, '')                    // blockquotes
    .replace(/\n{2,}/g, '. ')               // multiple newlines → pause
    .replace(/\n/g, ' ')                    // single newlines → space
    .replace(/\s{2,}/g, ' ')               // extra spaces
    .trim();
}

// Split into natural sentences
function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?।])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 2);
}

// function getVoice(lang: Language): SpeechSynthesisVoice | null {
//   const voices = window.speechSynthesis.getVoices();
//   const langCode = TTS_LANG_MAP[lang];
//   return (
//     voices.find(v =>
//       v.lang.startsWith(langCode.split('-')[0]) &&
//       (v.name.toLowerCase().includes('female') ||
//         v.name.toLowerCase().includes('woman') ||
//         v.name.includes('Google'))
//     ) ||
//     voices.find(v => v.lang.startsWith(langCode.split('-')[0])) ||
//     null
//   );
// }

function getVoice(lang: Language): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const langCode = TTS_LANG_MAP[lang]; // e.g. "pa-IN"
  const langPrefix = langCode.split('-')[0]; // e.g. "pa"

  // 1. Exact locale match with preferred voice type
  const exactPreferred = voices.find(v =>
    v.lang === langCode &&
    (v.name.toLowerCase().includes('female') ||
      v.name.toLowerCase().includes('woman') ||
      v.name.includes('Google'))
  );
  if (exactPreferred) return exactPreferred;

  // 2. Any exact locale match
  const exactAny = voices.find(v => v.lang === langCode);
  if (exactAny) return exactAny;

  // 3. Language prefix match (e.g. "pa" matches "pa-PK")
  const prefixPreferred = voices.find(v =>
    v.lang.startsWith(langPrefix) &&
    (v.name.toLowerCase().includes('female') ||
      v.name.toLowerCase().includes('woman') ||
      v.name.includes('Google'))
  );
  if (prefixPreferred) return prefixPreferred;

  const prefixAny = voices.find(v => v.lang.startsWith(langPrefix));
  if (prefixAny) return prefixAny;

  // 4. For Punjabi/Gujarati: fall back to Hindi voice (same script family)
  //    This at least sounds closer than English
  if (lang === 'pa' || lang === 'gu') {
    const hindiVoice = voices.find(v =>
      v.lang.startsWith('hi') &&
      (v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('woman') ||
        v.name.includes('Google'))
    ) || voices.find(v => v.lang.startsWith('hi'));
    if (hindiVoice) return hindiVoice;
  }

  // 5. Last resort: any available voice
  return voices[0] ?? null;
}

// function speakSentences(sentences: string[], lang: Language, index: number, onEnd?: () => void) {
//   if (isCancelled || index >= sentences.length) {
//     if (!isCancelled) {
//       isSpeakingCallback?.(false);
//       onEnd?.();
//     }
//     return;
//   }

//   const utterance = new SpeechSynthesisUtterance(sentences[index]);
//   utterance.lang = TTS_LANG_MAP[lang];
//   utterance.rate = 0.92;
//   utterance.pitch = 1.1;

//   const voice = getVoice(lang);
//   if (voice) utterance.voice = voice;

//   utterance.onend = () => {
//     if (!isCancelled) speakSentences(sentences, lang, index + 1, onEnd);
//   };
//   utterance.onerror = () => {
//     if (!isCancelled) speakSentences(sentences, lang, index + 1, onEnd);
//   };

//   window.speechSynthesis.speak(utterance);
// }

// export function speak(text: string, lang: Language, onEnd?: () => void): void {
//   if (!window.speechSynthesis) return;

//   stopSpeaking();

//   // Save for replay
//   lastText = text;
//   lastLang = lang;

//   isCancelled = false;
//   isSpeakingCallback?.(true);

//   const clean = stripMarkdown(text);
//   const sentences = splitIntoSentences(clean);

//   if (sentences.length === 0) {
//     isSpeakingCallback?.(false);
//     return;
//   }

//   const startSpeaking = () => speakSentences(sentences, lang, 0, onEnd);

//   if (window.speechSynthesis.getVoices().length > 0) {
//     startSpeaking();
//   } else {
//     window.speechSynthesis.onvoiceschanged = startSpeaking;
//   }
// }

// Replay the last spoken message

function speakSentences(sentences: string[], lang: Language, index: number, onEnd?: () => void) {
  if (isCancelled || index >= sentences.length) {
    if (!isCancelled) { isSpeakingCallback?.(false); onEnd?.(); }
    return;
  }

  const utterance = new SpeechSynthesisUtterance(sentences[index]);
  const voice = getVoice(lang);

  if (voice) {
    utterance.voice = voice;
    // Use the voice's actual lang to avoid browser mismatch on pa/gu
    utterance.lang = voice.lang;
  } else {
    utterance.lang = TTS_LANG_MAP[lang];
  }

  utterance.rate = 0.92;
  utterance.pitch = 1.1;

  utterance.onend = () => { if (!isCancelled) speakSentences(sentences, lang, index + 1, onEnd); };
  utterance.onerror = () => { if (!isCancelled) speakSentences(sentences, lang, index + 1, onEnd); };

  window.speechSynthesis.speak(utterance);
}


export function replayLast(): void {
  if (lastText) speak(lastText, lastLang);
}

export function speak(text: string, lang: Language, onEnd?: () => void): void {
  if (!window.speechSynthesis) return;
  stopSpeaking();
  lastText = text; lastLang = lang;
  isCancelled = false;
  isSpeakingCallback?.(true);

  const clean = stripMarkdown(text);
  const sentences = splitIntoSentences(clean);
  if (sentences.length === 0) { isSpeakingCallback?.(false); return; }

  const startSpeaking = () => speakSentences(sentences, lang, 0, onEnd);

  const trySpeak = (attemptsLeft: number) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      startSpeaking();
    } else if (attemptsLeft > 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        startSpeaking();
      };
      // Retry after 300ms in case onvoiceschanged never fires (iOS Safari)
      setTimeout(() => {
        if (window.speechSynthesis.getVoices().length > 0 && !isCancelled) {
          startSpeaking();
        }
      }, 300);
    } else {
      startSpeaking(); // proceed anyway
    }
  };

  trySpeak(3);
}


export function stopSpeaking(): void {
  isCancelled = true;
  window.speechSynthesis?.cancel();
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

  recognition.onresult = (e: any) => onResult(e.results[0][0].transcript);
  recognition.onerror = onEnd;
  recognition.onend = onEnd;
  recognition.start();

  return () => recognition.stop();
}