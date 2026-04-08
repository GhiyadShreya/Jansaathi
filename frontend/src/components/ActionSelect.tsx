/**
 * ActionSelect.tsx  (GLB avatar version)
 *
 * WHAT CHANGED vs original:
 *  - The 🧞‍♀️ emoji icon at top is replaced by GLBAvatar.
 *  - Avatar starts centered, greets (namaste for hi/pa/gu, wave/hello for en)
 *    with lipsync + eye blink, then slides to the LEFT after greeting.
 *  - ALL text labels, action cards, speak() calls, onSelect logic: UNCHANGED.
 *  - All styling, colours, animations on action buttons: UNCHANGED.
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Language, LANGUAGES } from '../types';
import { speak, registerAudioBufferCallback } from '../services/tts';
import { GLBAvatar, GLBAvatarHandle } from './GLBAvatar';

interface ActionSelectProps {
  language: Language;
  onSelect: (action: 'profile' | 'chat' | 'dashboard') => void;
}

const ACTIONS = [
  {
    id: 'chat' as const,
    emoji: '💬',
    en: 'Ask JanSaathi',
    hi: 'जानसाथी से पूछें',
    pa: 'ਜਾਨਸਾਥੀ ਤੋਂ ਪੁੱਛੋ',
    gu: 'જાણ સાથી ને પૂછો',
    desc_en: 'Talk to your AI helper',
    desc_hi: 'AI सहायक से बात करें',
    color: '#7C3AED',
    bg: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)',
    icon: (
      <svg viewBox="0 0 40 40" className="w-16 h-16">
        <circle cx="20" cy="20" r="18" fill="#7C3AED" opacity="0.15" />
        <path d="M8 14 Q8 8 14 8 L26 8 Q32 8 32 14 L32 22 Q32 28 26 28 L22 28 L16 34 L16 28 L14 28 Q8 28 8 22 Z"
          fill="#7C3AED" />
        <circle cx="15" cy="18" r="2" fill="white" />
        <circle cx="20" cy="18" r="2" fill="white" />
        <circle cx="25" cy="18" r="2" fill="white" />
      </svg>
    ),
  },
  {
    id: 'profile' as const,
    emoji: '👤',
    en: 'Update Profile',
    hi: 'प्रोफ़ाइल अपडेट करें',
    pa: 'ਪ੍ਰੋਫਾਈਲ ਅਪਡੇਟ ਕਰੋ',
    gu: 'પ્રોફાઇલ અપડેટ કરો',
    desc_en: 'Add your details',
    desc_hi: 'अपनी जानकारी भरें',
    color: '#059669',
    bg: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
    icon: (
      <svg viewBox="0 0 40 40" className="w-16 h-16">
        <circle cx="20" cy="20" r="18" fill="#059669" opacity="0.15" />
        <circle cx="20" cy="15" r="6" fill="#059669" />
        <path d="M8 32 Q8 24 20 24 Q32 24 32 32" fill="#059669" />
      </svg>
    ),
  },
  {
    id: 'dashboard' as const,
    emoji: '🏠',
    en: 'Main Dashboard',
    hi: 'मुख्य डैशबोर्ड',
    pa: 'ਮੁੱਖ ਡੈਸ਼ਬੋਰਡ',
    gu: 'મुখ्य ડेशबोर्ड',
    desc_en: 'See your schemes',
    desc_hi: 'योजनाएं देखें',
    color: '#D97706',
    bg: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
    icon: (
      <svg viewBox="0 0 40 40" className="w-16 h-16">
        <circle cx="20" cy="20" r="18" fill="#D97706" opacity="0.15" />
        <path d="M20 8 L32 18 L32 32 L24 32 L24 24 L16 24 L16 32 L8 32 L8 18 Z" fill="#D97706" />
        <rect x="17" y="26" width="6" height="6" fill="white" opacity="0.5" />
      </svg>
    ),
  },
];

// Greeting line spoken by avatar + gesture per language
const GREET_CONFIG: Record<Language, { text: string; gesture: 'namaste' | 'wave' }> = {
  hi: { text: 'नमस्ते! आज आप क्या करना चाहते हैं?', gesture: 'namaste' },
  pa: { text: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਅੱਜ ਤੁਸੀਂ ਕੀ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?', gesture: 'namaste' },
  gu: { text: 'નમસ્તે! આજે તમે શું કરવા માંગો છો?', gesture: 'namaste' },
  en: { text: 'Hello! What would you like to do today?', gesture: 'wave' },
};

export const ActionSelect: React.FC<ActionSelectProps> = ({ language, onSelect }) => {
  // Phase: 'center' = avatar centered + greeting, 'left' = avatar slid to left + looking at options
  const [avatarPhase, setAvatarPhase] = useState<'center' | 'left'>('center');
  const [currentSpeakText, setCurrentSpeakText] = useState<string | undefined>(undefined);
  const [currentGesture, setCurrentGesture] = useState<'namaste' | 'wave' | null>(null);
  const greetedRef = useRef(false);
  const avatarRef = useRef<GLBAvatarHandle>(null);

  useEffect(() => {
    const unregister = registerAudioBufferCallback((buf, text, lang) => {
      avatarRef.current?.speakAudio(buf, text, lang);
    });
    return unregister;
  }, []);

  useEffect(() => {
    if (greetedRef.current) return;
    greetedRef.current = true;

    const { text, gesture } = GREET_CONFIG[language];

    // Small delay for avatar to appear before speaking
    const t1 = setTimeout(() => {
      setCurrentGesture(gesture);
      setCurrentSpeakText(text);
      // Use the original speak() for browser TTS (same as original code)
      speak(text, language);
    }, 500);

    // After greeting finishes (~3s), slide avatar to left
    const t2 = setTimeout(() => {
      setAvatarPhase('left');
    }, 3200);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [language]);

  const getName = (action: typeof ACTIONS[0]) =>
    language === 'hi' ? action.hi : language === 'pa' ? action.pa : language === 'gu' ? action.gu : action.en;

  const getDesc = (action: typeof ACTIONS[0]) =>
    language === 'hi' ? action.desc_hi : action.desc_en;

  const labels: Record<Language, { title: string; subtitle: string }> = {
    en: { title: 'What would you like to do?', subtitle: 'Tap to select' },
    hi: { title: 'आप क्या करना चाहते हैं?', subtitle: 'चुनने के लिए टैप करें' },
    pa: { title: 'ਤੁਸੀਂ ਕੀ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?', subtitle: 'ਚੁਣਨ ਲਈ ਟੈਪ ਕਰੋ' },
    gu: { title: 'તమे ਸ਼ੂ ਕਰਵਾ ਮਾਂਗੋ ਛੋ?', subtitle: 'पसंद करवा टॅप करो' },
  };

  return (
    <motion.div
      className="fixed inset-0 z-[85] flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FFFBF5 0%, #FFF5EC 50%, #F0EEFF 100%)' }}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── AVATAR: center → left animation ── */}
      <motion.div
        className="absolute"
        style={{ width: 240, height: 380 }}
        animate={
          avatarPhase === 'center'
            ? { x: 0, y: 0, left: '50%', marginLeft: -120, top: '50%', marginTop: -190 }
            : { x: -100, left: '8%', marginLeft: 0, top: '50%', marginTop: -190 }
        }
        transition={{ type: 'spring', stiffness: 60, damping: 18, duration: 0.9 }}
      >
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none rounded-full blur-2xl opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.3) 0%, transparent 70%)', width: '130%', height: '130%', left: '-15%', top: '-15%' }} />
        <GLBAvatar
          ref={avatarRef}
          glbUrl="/avatar.glb"
          mood={avatarPhase === 'center' ? 'happy' : 'neutral'}
          gesture={currentGesture}
          speakText={currentSpeakText}
          isSpeaking={avatarPhase === 'center'}
          cameraView="upper"
          style={{ width: '100%', height: '100%' }}
        />
      </motion.div>

      {/* ── ACTION CARDS: only fully visible after avatar slides left ── */}
      <motion.div
        className="flex flex-col gap-4 w-full max-w-xs"
        style={{ position: 'relative', zIndex: 2 }}
        animate={{ opacity: avatarPhase === 'left' ? 1 : 0, x: avatarPhase === 'left' ? 60 : 80 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Header — UNCHANGED text */}
        <div className="text-center mb-4">
          <h2
            className="text-2xl font-black mb-1"
            style={{ color: '#1A1A2E', fontFamily: "'Baloo 2', cursive" }}
          >
            {labels[language].title}
          </h2>
          <p className="text-sm text-gray-500">{labels[language].subtitle}</p>
        </div>

        {ACTIONS.map((action, i) => (
          <motion.button
            key={action.id}
            onClick={() => onSelect(action.id)}
            className="flex items-center gap-5 p-5 rounded-3xl text-left transition-all active:scale-98 group relative overflow-hidden"
            style={{ background: action.bg, border: `1px solid ${action.color}30` }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.12, type: 'spring', damping: 18 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2 + i * 0.5, repeat: Infinity }}
            >
              {action.icon}
            </motion.div>
            <div className="flex-1">
              <p
                className="text-lg font-black leading-tight"
                style={{ color: action.color, fontFamily: "'Baloo 2', cursive" }}
              >
                {getName(action)}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">{getDesc(action)}</p>
            </div>
            <motion.div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: action.color }}
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.div>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-3xl"
              style={{ background: `linear-gradient(90deg, transparent, ${action.color}15, transparent)` }}
            />
          </motion.button>
        ))}

        {/* Language indicator — UNCHANGED */}
        <motion.p
          className="mt-2 text-xs text-gray-400 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          🌐 {LANGUAGES[language].name} selected
        </motion.p>
      </motion.div>
    </motion.div>
  );
};
