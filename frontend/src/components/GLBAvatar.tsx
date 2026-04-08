/**
 * GLBAvatar.tsx
 * Wraps the TalkingHead library to render a .glb avatar with
 * audio-driven lipsync (speakAudio), eye blink, gestures, and moods.
 *
 * LIPSYNC STRATEGY (Option 3 — audio-driven):
 *   Instead of using TalkingHead's internal TTS (speakText), we receive
 *   an AudioBuffer from our own tts.ts and call head.speakAudio().
 *   The mouth motion is derived from the audio envelope itself so it works
 *   the same way across English, Hindi, Punjabi, and Gujarati.
 */

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AvatarMood = 'neutral' | 'happy' | 'thinking' | 'listening';
type AvatarLanguage = 'en' | 'hi' | 'gu' | 'pa';

export interface GLBAvatarHandle {
  /** Feed an AudioBuffer + spoken text → avatar lip-syncs to it */
  speakAudio: (audioBuffer: AudioBuffer, text: string, lang?: AvatarLanguage) => void;
  /** Stop all speech immediately */
  stopSpeech: () => void;
  /** Resume TalkingHead's internal audio context after a user gesture */
  resumeAudio: () => void;
}

interface GLBAvatarProps {
  glbUrl?: string;
  isSpeaking?: boolean;
  mood?: AvatarMood;
  gesture?: 'namaste' | 'wave' | 'nod' | null;
  speakText?: string;
  cameraView?: 'upper' | 'full' | 'head';
  language?: AvatarLanguage;
  className?: string;
  style?: React.CSSProperties;
  onReady?: () => void;
}

// ---------------------------------------------------------------------------
// TalkingHead lazy loader
// ---------------------------------------------------------------------------

let TalkingHeadClass: any = null;
let loadPromise: Promise<any> | null = null;

function loadTalkingHead(): Promise<any> {
  if (TalkingHeadClass) return Promise.resolve(TalkingHeadClass);
  if (loadPromise) return loadPromise;
  loadPromise = import(
    /* @vite-ignore */
    'https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.1/modules/talkinghead.mjs'
  ).then((mod) => {
    TalkingHeadClass = mod.TalkingHead;
    return TalkingHeadClass;
  }).catch((err) => {
    loadPromise = null;
    throw err;
  });
  return loadPromise;
}

function normalizeLipSyncLanguage(lang?: AvatarLanguage): AvatarLanguage {
  if (lang === 'hi' || lang === 'gu' || lang === 'pa') return lang;
  return 'en';
}

function buildSpeechCue(text: string, durationMs: number) {
  const compact = text.replace(/\s+/g, ' ').trim();
  return {
    words: [compact || 'speech'],
    wtimes: [0],
    wdurations: [Math.max(1, Math.round(durationMs))],
  };
}

function buildAmplitudeAnimation(audioBuffer: AudioBuffer) {
  const sampleRate = audioBuffer.sampleRate;
  const channelCount = audioBuffer.numberOfChannels;
  const frameMs = 1000 / 12;
  const frameSize = Math.max(1, Math.floor((sampleRate * frameMs) / 1000));
  const frameCount = Math.max(1, Math.ceil(audioBuffer.length / frameSize));

  const jawOpen: number[] = [];
  const mouthClose: number[] = [];
  const mouthFunnel: number[] = [];
  const mouthPucker: number[] = [];
  const dt = new Array(frameCount).fill(frameMs);

  let previous = 0;

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    const start = frameIndex * frameSize;
    const end = Math.min(audioBuffer.length, start + frameSize);
    let sum = 0;
    let count = 0;

    for (let channel = 0; channel < channelCount; channel += 1) {
      const data = audioBuffer.getChannelData(channel);
      for (let i = start; i < end; i += 1) {
        const sample = data[i] || 0;
        sum += sample * sample;
        count += 1;
      }
    }

    const rms = count > 0 ? Math.sqrt(sum / count) : 0;
    const boosted = Math.min(1, Math.pow(rms * 2.2, 0.95));
    const attack = 0.3;
    const release = 0.94;
    const blend = boosted > previous ? attack : release;
    const smoothed = previous * blend + boosted * (1 - blend);
    previous = smoothed;

    const gated = smoothed < 0.12 ? 0 : smoothed;
    jawOpen.push(Math.min(0.32, gated * 0.46));
    mouthClose.push(Math.max(0.52, 0.94 - gated * 0.22));
    mouthFunnel.push(Math.min(0.1, gated * 0.06));
    mouthPucker.push(Math.min(0.06, gated * 0.04));
  }

  return {
    dt,
    vs: {
      jawOpen,
      mouthClose,
      mouthFunnel,
      mouthPucker,
    },
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const GLBAvatar = forwardRef<GLBAvatarHandle, GLBAvatarProps>(({
  glbUrl       = '/avatar.glb',
  isSpeaking   = false,
  mood         = 'neutral',
  gesture      = null,
  speakText: _speakText = undefined,
  cameraView   = 'upper',
  language     = 'hi',
  className    = '',
  style        = {},
  onReady,
}, ref) => {
  const containerRef  = useRef<HTMLDivElement>(null);
  const headRef       = useRef<any>(null);
  const loadedRef     = useRef(false);
  const prevGesture   = useRef<string | null>(null);
  const pendingSpeechRef = useRef<{ audioBuffer: AudioBuffer; text: string } | null>(null);

  const languageRef   = useRef(language);
  const glbUrlRef     = useRef(glbUrl);
  const cameraViewRef = useRef(cameraView);
  const moodRef       = useRef(mood);
  const onReadyRef    = useRef(onReady);

  languageRef.current   = language;
  glbUrlRef.current     = glbUrl;
  cameraViewRef.current = cameraView;
  moodRef.current       = mood;
  onReadyRef.current    = onReady;

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const playSpeech = (audioBuffer: AudioBuffer, text: string, lang?: AvatarLanguage) => {
    const head = headRef.current;
    if (!head) return false;

    const durationMs = audioBuffer.duration * 1000;
    const cue = buildSpeechCue(text, durationMs);
    const anim = buildAmplitudeAnimation(audioBuffer);
    const lipsyncLang = normalizeLipSyncLanguage(lang ?? languageRef.current);

    try {
      head.stopSpeaking?.();
      head.speakAudio({
        audio: audioBuffer,
        words: cue.words,
        wtimes: cue.wtimes,
        wdurations: cue.wdurations,
        anim,
      }, { isRaw: true, lipsyncLang });
      return true;
    } catch (err) {
      console.warn('[GLBAvatar] speakAudio failed:', err);
      return false;
    }
  };

  // ---------------------------------------------------------------------------
  // Expose imperative handle so Avatar.tsx can call speakAudio / stopSpeech
  // ---------------------------------------------------------------------------

  useImperativeHandle(ref, () => ({
    speakAudio(audioBuffer: AudioBuffer, text: string, lang?: AvatarLanguage) {
      if (!headRef.current || isLoading) {
        pendingSpeechRef.current = { audioBuffer, text };
        return;
      }
      pendingSpeechRef.current = null;
      playSpeech(audioBuffer, text, lang);
    },

    stopSpeech() {
      try { headRef.current?.stopSpeaking?.(); } catch (_) {}
    },

    resumeAudio() {
      try {
        const ctx = headRef.current?.audioCtx as AudioContext | undefined;
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
      } catch (_) {}
    },
  }));

  // ---------------------------------------------------------------------------
  // Resume TalkingHead's internal AudioContext on first user gesture
  // Chrome blocks AudioContext.start() until a user gesture has occurred.
  // TalkingHead stores its context at head.audioCtx — we resume it on click.
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const resume = () => {
      const head = headRef.current;
      if (!head) return;
      try {
        // TalkingHead exposes its AudioContext as head.audioCtx
        const ctx = head.audioCtx as AudioContext | undefined;
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
      } catch (_) {}
    };

    document.addEventListener('click', resume, { once: true });
    document.addEventListener('touchend', resume, { once: true });
    return () => {
      document.removeEventListener('click', resume);
      document.removeEventListener('touchend', resume);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Init — runs once on mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function initHead() {
      if (loadedRef.current || !containerRef.current) return;
      loadedRef.current = true;

      try {
        const THClass = await loadTalkingHead();
        if (cancelled) return;

        const node = containerRef.current!;

        // Dummy Google TTS endpoint — satisfies constructor check, never called
        // since we use speakAudio() exclusively
        const head = new THClass(node, {
          ttsEndpoint : 'https://texttospeech.googleapis.com/v1beta1/text:synthesize',
          ttsApikey   : '',
          ttsLang     : 'en-IN',
          ttsVoice    : 'en-IN-Standard-A',
          ttsRate     : 1.0,
          cameraView  : cameraViewRef.current,
          cameraRotateEnable: false,
          avatarMood  : moodRef.current,
          lipsyncLang : normalizeLipSyncLanguage(languageRef.current),
        });

        headRef.current = head;

        try {
          await head.showAvatar(
            {
              url        : glbUrlRef.current,
              body       : 'F',
              lipsyncLang: normalizeLipSyncLanguage(languageRef.current),
            },
            (_ev: ProgressEvent) => {}
          );
        } catch (avatarErr: any) {
          console.warn('[GLBAvatar] showAvatar partial error:', avatarErr);
        }

        if (cancelled) return;
        setIsLoading(false);
        if (pendingSpeechRef.current) {
          const pending = pendingSpeechRef.current;
          pendingSpeechRef.current = null;
          playSpeech(pending.audioBuffer, pending.text, languageRef.current);
        }
        onReadyRef.current?.();

      } catch (err: any) {
        if (cancelled) return;
        console.error('[GLBAvatar] Fatal load error:', err);
        setLoadError(err?.message || 'Failed to load avatar');
        setIsLoading(false);
      }
    }

    initHead();

    return () => {
      cancelled = true;
      try { headRef.current?.dispose?.(); } catch (_) {}
      headRef.current   = null;
      loadedRef.current = false;
      pendingSpeechRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------------------------
  // Mood changes
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const head = headRef.current;
    if (!head || isLoading) return;
    try {
      if (typeof head.setMood === 'function') {
        const thMood =
          mood === 'thinking'  ? 'sad'    :
          mood === 'listening' ? 'happy'  :
          mood === 'happy'     ? 'happy'  :
          'neutral';
        head.setMood(thMood);
      }
    } catch (_) {}
  }, [mood, isLoading]);

  // ---------------------------------------------------------------------------
  // Gestures — use speakAudio with a silent buffer so mouth stays closed
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const head = headRef.current;
    if (!head || isLoading) return;
    if (!gesture || gesture === prevGesture.current) return;
    prevGesture.current = gesture;
    try {
      // Gestures just trigger an animation/mood — no TTS needed
      if (gesture === 'namaste')   head.setMood?.('happy');
      else if (gesture === 'wave') head.setMood?.('happy');
      else if (gesture === 'nod')  head.setMood?.('neutral');
    } catch (_) {}
  }, [gesture, isLoading]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={`relative ${className}`}
      style={{ background: 'transparent', overflow: 'hidden', ...style }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {isLoading && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
            <span className="text-xs text-orange-400 font-medium">Loading avatar…</span>
          </div>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 p-4 text-center">
          <span>⚠️ Avatar unavailable</span>
        </div>
      )}
    </div>
  );
});

GLBAvatar.displayName = 'GLBAvatar';
