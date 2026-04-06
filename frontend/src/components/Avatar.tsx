/**
 * Avatar.tsx  (GLB avatar version)
 *
 * WHAT CHANGED vs original:
 *  - Added `language` prop so GLBAvatar picks the correct Azure Neural voice
 *    (hi-IN-SwaraNeural, gu-IN-DhwaniNeural, pa-IN-OjasNeural, en-IN-NeerjaNeural)
 *  - Azure credentials (VITE_AZURE_TTS_KEY / VITE_AZURE_TTS_REGION) are read
 *    from import.meta.env and forwarded to GLBAvatar — no prop drilling from App.tsx.
 *  - All other props, glow, pulse ring, and mood badge are UNCHANGED.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GLBAvatar } from './GLBAvatar';

interface AvatarProps {
  isSpeaking: boolean;
  mood?: 'happy' | 'neutral' | 'thinking' | 'listening';
  size?: 'sm' | 'md' | 'lg';
  language?: 'en' | 'hi' | 'gu' | 'pa';
}

export const Avatar: React.FC<AvatarProps> = ({
  isSpeaking,
  mood = 'neutral',
  size = 'lg',
  language = 'hi',
}) => {
  // Size mapping: match the original SVG avatar's visual footprint
  const containerSize =
    size === 'sm' ? { width: 80,  height: 80  } :
    size === 'md' ? { width: 160, height: 160 } :
                    { width: 260, height: 260 };

  // GLBAvatar mood passthrough (TalkingHead mood names)
  const glbMood =
    mood === 'thinking'  ? 'thinking'  :
    mood === 'listening' ? 'listening' :
    mood === 'happy'     ? 'happy'     :
    'neutral';

  // Azure credentials — read once here so GLBAvatar stays generic
  const ttsApiKey = import.meta.env.VITE_AZURE_TTS_KEY  ?? '';
  const ttsRegion = import.meta.env.VITE_AZURE_TTS_REGION ?? '';

  return (
    <div
      className="relative mx-auto"
      style={{ width: containerSize.width, height: containerSize.height }}
    >
      {/* Ambient glow — mirrors original */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-60 transition-all duration-700 pointer-events-none"
        style={{
          background: isSpeaking
            ? 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(253,186,116,0.15) 0%, transparent 70%)',
          transform: isSpeaking ? 'scale(1.1)' : 'scale(1)',
        }}
      />

      {/* GLB Avatar — Azure TTS + language-aware voice */}
      <GLBAvatar
        glbUrl="/avatar.glb"
        mood={glbMood}
        isSpeaking={isSpeaking}
        language={language}
        cameraView={size === 'sm' ? 'head' : 'upper'}
        style={{ width: '100%', height: '100%' }}
        ttsApiKey={ttsApiKey}
        ttsRegion={ttsRegion}
      />

      {/* Speaking pulse ring — UNCHANGED from original */}
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

      {/* Mood badge — UNCHANGED from original */}
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
};