/**
 * Avatar.tsx
 *
 * WHAT CHANGED:
 *  - Holds a ref to GLBAvatar and exposes speakAudio() via its own ref
 *  - ttsApiKey / ttsRegion props removed (no longer needed — audio-driven lipsync)
 *  - App.tsx registers registerAudioBufferCallback() so whenever tts.ts produces
 *    audio, it lands here and gets forwarded to head.speakAudio()
 */

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GLBAvatar, GLBAvatarHandle } from './GLBAvatar';

export interface AvatarHandle {
  speakAudio: (audioBuffer: AudioBuffer, text: string, lang?: 'en' | 'hi' | 'gu' | 'pa') => void;
  resumeAudio: () => void;
}

interface AvatarProps {
  isSpeaking: boolean;
  mood?: 'happy' | 'neutral' | 'thinking' | 'listening';
  size?: 'sm' | 'md' | 'lg';
  language?: 'en' | 'hi' | 'gu' | 'pa';
}

export const Avatar = forwardRef<AvatarHandle, AvatarProps>(({
  isSpeaking,
  mood = 'neutral',
  size = 'lg',
  language = 'hi',
}, ref) => {
  const glbRef = useRef<GLBAvatarHandle>(null);

  const containerSize =
    size === 'sm' ? { width: 80,  height: 80  } :
    size === 'md' ? { width: 160, height: 160 } :
                    { width: 260, height: 260 };

  const glbMood =
    mood === 'thinking'  ? 'thinking'  :
    mood === 'listening' ? 'listening' :
    mood === 'happy'     ? 'happy'     :
    'neutral';

  // Expose speakAudio and resumeAudio up to App.tsx
  useImperativeHandle(ref, () => ({
    speakAudio(audioBuffer: AudioBuffer, text: string, lang?: 'en' | 'hi' | 'gu' | 'pa') {
      glbRef.current?.speakAudio(audioBuffer, text, lang ?? language);
    },
    // Forwards the user-gesture unlock into the GLB avatar's internal AudioContext
    // (talkinghead.mjs creates its own context which also needs resuming)
    resumeAudio() {
      glbRef.current?.resumeAudio?.();
    },
  }));

  return (
    <div
      className="relative mx-auto"
      style={{ width: containerSize.width, height: containerSize.height }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-60 transition-all duration-700 pointer-events-none"
        style={{
          background: isSpeaking
            ? 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(253,186,116,0.15) 0%, transparent 70%)',
          transform: isSpeaking ? 'scale(1.1)' : 'scale(1)',
        }}
      />

      {/* GLB Avatar — audio-driven lipsync via ref */}
      <GLBAvatar
        ref={glbRef}
        glbUrl="/avatar.glb"
        mood={glbMood}
        isSpeaking={isSpeaking}
        language={language}
        cameraView={size === 'sm' ? 'head' : 'upper'}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Speaking pulse ring */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-amber-400 pointer-events-none"
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1.15, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Mood badge */}
      <AnimatePresence>
        {(mood === 'thinking' || mood === 'listening') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute -top-1 -right-1 px-3 py-1.5 rounded-2xl shadow-lg border flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider backdrop-blur
              ${mood === 'listening'
                ? 'bg-rose-50/95 border-rose-200 text-rose-600'
                : 'bg-violet-50/95 border-violet-200 text-violet-600'}`}
          >
            <span className="flex gap-0.5">
              {[0, 0.15, 0.3].map((delay, i) => (
                <span
                  key={i}
                  className={`w-1 h-1 rounded-full animate-bounce ${mood === 'listening' ? 'bg-rose-500' : 'bg-violet-500'}`}
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </span>
            {mood === 'listening' ? 'Listening' : 'Thinking'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Avatar.displayName = 'Avatar';
