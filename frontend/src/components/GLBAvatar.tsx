/**
 * GLBAvatar.tsx
 * Wraps the TalkingHead library to render a .glb avatar with
 * Azure TTS lipsync, eye blink, gestures, and moods.
 */

import React, { useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AvatarMood = 'neutral' | 'happy' | 'thinking' | 'listening';
type AvatarLanguage = 'en' | 'hi' | 'gu' | 'pa';

interface GLBAvatarProps {
  glbUrl?: string;
  isSpeaking?: boolean;
  speakText?: string;
  mood?: AvatarMood;
  gesture?: 'namaste' | 'wave' | 'nod' | null;
  cameraView?: 'upper' | 'full' | 'head';
  language?: AvatarLanguage;
  className?: string;
  style?: React.CSSProperties;
  onReady?: () => void;
  ttsApiKey?: string;
  ttsRegion?: string;
}

// ---------------------------------------------------------------------------
// Azure voice map
// ---------------------------------------------------------------------------

const AZURE_VOICE_MAP: Record<AvatarLanguage, { ttsLang: string; ttsVoice: string }> = {
  en: { ttsLang: 'en-IN', ttsVoice: 'en-IN-NeerjaNeural' },
  hi: { ttsLang: 'hi-IN', ttsVoice: 'hi-IN-SwaraNeural' },
  gu: { ttsLang: 'gu-IN', ttsVoice: 'gu-IN-DhwaniNeural' },
  pa: { ttsLang: 'pa-IN', ttsVoice: 'pa-IN-OjasNeural'  },
};

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
    loadPromise = null; // allow retry on next mount
    throw err;
  });
  return loadPromise;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const GLBAvatar: React.FC<GLBAvatarProps> = ({
  glbUrl       = '/avatar.glb',
  isSpeaking   = false,
  speakText,
  mood         = 'neutral',
  gesture      = null,
  cameraView   = 'upper',
  language     = 'hi',
  className    = '',
  style        = {},
  onReady,
  ttsApiKey    = '',
  ttsRegion    = '',
}) => {
  const containerRef  = useRef<HTMLDivElement>(null);
  const headRef       = useRef<any>(null);
  const loadedRef     = useRef(false);
  const prevSpeakText = useRef<string | undefined>(undefined);
  const prevGesture   = useRef<string | null>(null);

  // Refs so initHead always reads the latest prop values (avoids stale closure)
  const ttsApiKeyRef  = useRef(ttsApiKey);
  const ttsRegionRef  = useRef(ttsRegion);
  const languageRef   = useRef(language);
  const glbUrlRef     = useRef(glbUrl);
  const cameraViewRef = useRef(cameraView);
  const moodRef       = useRef(mood);
  const onReadyRef    = useRef(onReady);

  ttsApiKeyRef.current  = ttsApiKey;
  ttsRegionRef.current  = ttsRegion;
  languageRef.current   = language;
  glbUrlRef.current     = glbUrl;
  cameraViewRef.current = cameraView;
  moodRef.current       = mood;
  onReadyRef.current    = onReady;

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

        const node        = containerRef.current!;
        const apiKey      = ttsApiKeyRef.current;
        const region      = ttsRegionRef.current;
        const voiceConfig = AZURE_VOICE_MAP[languageRef.current] ?? AZURE_VOICE_MAP['hi'];

        // ─────────────────────────────────────────────────────────────────────
        // FIX: TalkingHead ALWAYS requires a ttsEndpoint in its constructor.
        // It throws "You must provide some Google-compliant TTS Endpoint"
        // if the field is missing or empty — even if you never call speakText().
        //
        // Strategy:
        //   1. Azure key + region present → use Azure endpoint (full TTS + lipsync)
        //   2. Otherwise → pass Google's public TTS URL with an empty key.
        //      The constructor check passes; speech calls will fail silently,
        //      but the 3D avatar still loads and renders normally.
        // ─────────────────────────────────────────────────────────────────────
        const ttsConfig =
          apiKey && region
            ? {
                ttsEndpoint : `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
                ttsApikey   : apiKey,
              }
            : {
                // Satisfies TalkingHead's mandatory endpoint check.
                // No key supplied → TTS requests fail gracefully; avatar still renders.
                ttsEndpoint : 'https://texttospeech.googleapis.com/v1beta1/text:synthesize',
                ttsApikey   : '',
              };

        const head = new THClass(node, {
          ...ttsConfig,
          ttsLang            : voiceConfig.ttsLang,
          ttsVoice           : voiceConfig.ttsVoice,
          ttsRate            : 1.0,
          cameraView         : cameraViewRef.current,
          cameraRotateEnable : false,
          avatarMood         : moodRef.current,
          lipsyncLang        : 'en',
        });

        headRef.current = head;

        // showAvatar in its own try/catch — a TTS warm-up error is non-fatal
        try {
          await head.showAvatar(
            {
              url         : glbUrlRef.current,
              body        : 'F',
              ttsLang     : voiceConfig.ttsLang,
              ttsVoice    : voiceConfig.ttsVoice,
              lipsyncLang : 'en',
            },
            (_ev: ProgressEvent) => {}
          );
        } catch (avatarErr: any) {
          // TTS warm-up failed but mesh may still be visible — non-fatal
          console.warn('[GLBAvatar] showAvatar partial error (TTS warm-up may have failed):', avatarErr);
        }

        if (cancelled) return;
        setIsLoading(false);
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
  // Speak text
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const head = headRef.current;
    if (!head || isLoading) return;
    if (!speakText || speakText === prevSpeakText.current) return;
    prevSpeakText.current = speakText;
    try { head.speakText(speakText); } catch (_) {}
  }, [speakText, isLoading]);

  // ---------------------------------------------------------------------------
  // Gestures
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const head = headRef.current;
    if (!head || isLoading) return;
    if (!gesture || gesture === prevGesture.current) return;
    prevGesture.current = gesture;
    try {
      if (gesture === 'namaste')     head.speakText('Namaste! 🙏');
      else if (gesture === 'wave')   head.speakText('Hello! 👋');
      else if (gesture === 'nod')    head.speakText('Yes! ✅');
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
};