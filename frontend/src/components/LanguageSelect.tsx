/**
 * LanguageSelect.tsx  (GLB avatar version)
 *
 * WHAT CHANGED vs original:
 *  - Layout is now two-column: GLB avatar idle on LEFT, language chooser on RIGHT.
 *  - ALL text content, language options, speak() calls, onSelect logic: UNCHANGED.
 *  - All styling colours, animations, and LANG_CONFIG: UNCHANGED.
 */

import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Language, LANGUAGES } from '../types';
import { speak, speakChooseLanguage, registerAudioBufferCallback } from '../services/tts';
import { GLBAvatar, GLBAvatarHandle } from './GLBAvatar';

interface LanguageSelectProps {
  onSelect: (lang: Language) => void;
}

const LANG_CONFIG: { lang: Language; icon: string; color: string; bg: string; border: string }[] = [
  { lang: 'hi', icon: '🇮🇳', color: '#FF6B35', bg: '#FFF5F0', border: '#FFCDB8' },
  { lang: 'en', icon: '🌏', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  { lang: 'pa', icon: '🌾', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  { lang: 'gu', icon: '🪁', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
];

export const LanguageSelect: React.FC<LanguageSelectProps> = ({ onSelect }) => {
  const avatarRef = useRef<GLBAvatarHandle>(null);

  useEffect(() => {
    const unregister = registerAudioBufferCallback((buf, text, lang) => {
      avatarRef.current?.speakAudio(buf, text, lang);
    });
    return unregister;
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      speakChooseLanguage();
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const handleSelect = (lang: Language) => {
    speak(LANGUAGES[lang].greeting, lang);
    onSelect(lang);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-stretch"
      style={{ background: 'linear-gradient(135deg, #FFF9F0 0%, #FFF0E8 40%, #F0F4FF 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Decorative top stripe — UNCHANGED */}
      <div className="absolute top-0 left-0 right-0 h-2 flex z-10">
        {['#FF9933', '#FFFFFF', '#138808', '#FF9933', '#138808', '#FFFFFF', '#FF9933'].map((c, i) => (
          <div key={i} className="flex-1" style={{ background: c }} />
        ))}
      </div>

      {/* ── LEFT HALF: GLB Avatar idle ── */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #2d1458 50%, #1e0d3a 100%)' }}>
        {/* Subtle star bg */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}

        {/* Glow behind avatar */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center 60%, rgba(124,58,237,0.25) 0%, transparent 65%)' }} />

        <motion.div
          style={{ width: 300, height: 460 }}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <GLBAvatar
            ref={avatarRef}
            glbUrl="/avatar.glb"
            mood="neutral"
            gesture={null}
            isSpeaking={false}
            cameraView="upper"
            style={{ width: '100%', height: '100%' }}
          />
        </motion.div>

        {/* Saathi label below avatar */}
        <motion.div
          className="text-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-white/60 text-sm font-medium">Saathi</p>
          <p className="text-violet-300 text-xs">आपका सरकारी साथी</p>
        </motion.div>
      </div>

      {/* ── RIGHT HALF: Language chooser — all content UNCHANGED ── */}
      <div className="flex flex-col items-center justify-center w-full lg:w-1/2 px-6 relative">

        {/* Logo — UNCHANGED */}
        <motion.div
          className="flex items-center gap-3 mb-10"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #FF6B35, #FF9F68)' }}>
            <span className="text-2xl">🏛️</span>
          </div>
          <div>
            <h1 className="text-2xl font-black" style={{ fontFamily: "'Baloo 2', cursive", color: '#1A1A2E' }}>
              Jan<span style={{ color: '#FF6B35' }}>Saathi</span>
            </h1>
            <p className="text-xs text-gray-500">आपका सरकारी साथी</p>
          </div>
        </motion.div>

        {/* Header — UNCHANGED */}
        <motion.div
          className="text-center mb-10"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-black mb-2" style={{ color: '#1A1A2E', fontFamily: "'Baloo 2', cursive" }}>
            अपनी भाषा चुनें
          </h2>
          <p className="text-lg text-gray-500">Choose Your Language</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-8 h-0.5 rounded-full bg-orange-200" />
            <div className="w-2 h-2 rounded-full bg-orange-400" />
            <div className="w-8 h-0.5 rounded-full bg-orange-200" />
          </div>
        </motion.div>

        {/* Language Buttons 2×2 — UNCHANGED */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {LANG_CONFIG.map(({ lang, icon, color, bg, border }, i) => (
            <motion.button
              key={lang}
              onClick={() => handleSelect(lang)}
              className="relative flex flex-col items-center justify-center p-6 rounded-3xl transition-all active:scale-95 group"
              style={{ background: bg, border: `2px solid ${border}` }}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1, type: 'spring', damping: 15 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.span
                className="text-4xl mb-2"
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
              >
                {icon}
              </motion.span>
              <span
                className="text-2xl font-black leading-tight"
                style={{
                  color,
                  fontFamily: lang === 'en' ? "'Baloo 2', cursive" : "'Noto Sans Devanagari', 'Baloo 2', sans-serif"
                }}
              >
                {LANGUAGES[lang].native}
              </span>
              <span className="text-xs font-semibold mt-1" style={{ color: `${color}AA` }}>
                {LANGUAGES[lang].name}
              </span>
              <div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ boxShadow: `0 0 30px ${color}40` }}
              />
            </motion.button>
          ))}
        </div>

        {/* Voice hint — UNCHANGED */}
        <motion.div
          className="mt-8 flex items-center gap-2 px-4 py-2.5 rounded-full"
          style={{ background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <span className="text-lg">🔊</span>
          <span className="text-sm font-medium text-orange-700">Voice guide is active</span>
          <motion.div
            className="flex gap-0.5"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {[4, 7, 5, 8, 4].map((h, i) => (
              <div key={i} className="w-0.5 rounded-full bg-orange-500" style={{ height: h }} />
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom decoration — UNCHANGED */}
      <div className="absolute bottom-0 left-0 right-0 h-1 flex">
        {['#FF9933', '#FFFFFF', '#138808'].map((c, i) => (
          <div key={i} className="flex-1" style={{ background: c }} />
        ))}
      </div>
    </motion.div>
  );
};
