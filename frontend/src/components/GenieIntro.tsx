/**
 * GenieIntro.tsx  (GLB avatar version)
 *
 * WHAT CHANGED vs original:
 *  - The SVG genie + magic lamp are removed.
 *  - A GLBAvatar renders centered, fully idle (no speech, no gesture).
 *  - Phase sequence + onComplete timing: UNCHANGED.
 *  - Stars, sparkles, title, skip button: UNCHANGED.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GLBAvatar } from './GLBAvatar';

interface GenieIntroProps {
  onComplete: () => void;
}

export const GenieIntro: React.FC<GenieIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'lamp' | 'smoke' | 'genie' | 'speak' | 'done'>('lamp');
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; scale: number }[]>([]);

  useEffect(() => {
    // Phase sequence — UNCHANGED from original
    const t1 = setTimeout(() => setPhase('smoke'), 800);
    const t2 = setTimeout(() => setPhase('genie'), 1600);
    const t3 = setTimeout(() => { setPhase('speak'); }, 2400);
    const t4 = setTimeout(() => setPhase('done'), 4800);
    const t5 = setTimeout(onComplete, 5200);

    // Sparkle bursts — UNCHANGED
    const sparkleInterval = setInterval(() => {
      setSparkles(prev => [...prev.slice(-15), {
        id: Date.now(),
        x: 35 + Math.random() * 30,
        y: 10 + Math.random() * 60,
        scale: 0.3 + Math.random() * 0.8
      }]);
    }, 200);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5);
      clearInterval(sparkleInterval);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at center, #1a0a2e 0%, #0d0518 50%, #060310 100%)' }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stars background — UNCHANGED */}
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}

      {/* Floor glow */}
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-16 rounded-full blur-3xl opacity-40"
        style={{ background: 'radial-gradient(ellipse, #F59E0B 0%, transparent 70%)' }} />

      {/* Subtle shimmer during lamp phase */}
      {phase === 'lamp' && (
        <motion.div
          className="absolute"
          style={{ bottom: '20%', left: '50%', transform: 'translateX(-50%)' }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div style={{
            width: 100, height: 50,
            background: 'radial-gradient(ellipse, rgba(245,158,11,0.8) 0%, rgba(245,158,11,0.2) 60%, transparent 100%)',
            borderRadius: '50%',
            filter: 'blur(10px)',
          }} />
        </motion.div>
      )}

      {/* Smoke puffs */}
      <AnimatePresence>
        {phase === 'smoke' && (
          <motion.div className="absolute" style={{ bottom: '22%', left: '50%', transform: 'translateX(-50%)' }}>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 12 + i * 8,
                  height: 12 + i * 8,
                  background: 'radial-gradient(circle, rgba(167,139,250,0.6) 0%, rgba(109,40,217,0.2) 70%, transparent 100%)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
                initial={{ y: 0, opacity: 0, scale: 0 }}
                animate={{
                  y: -(40 + i * 35),
                  opacity: [0, 0.7, 0.3, 0],
                  scale: [0, 1, 1.5, 2],
                  x: [0, (i % 2 === 0 ? 8 : -8), (i % 2 === 0 ? -5 : 5), 0],
                }}
                transition={{ duration: 1.5 + i * 0.3, delay: i * 0.15, repeat: Infinity }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GLB AVATAR — idle, no speech ── */}
      <AnimatePresence>
        {(phase === 'genie' || phase === 'speak' || phase === 'done') && (
          <motion.div
            className="absolute"
            style={{ width: 280, height: 420, bottom: '8%', left: '50%', transform: 'translateX(-50%)' }}
            initial={{ y: 100, opacity: 0, scale: 0.4 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', damping: 14, stiffness: 70 }}
          >
            {/* Purple glow aura */}
            <motion.div
              className="absolute rounded-full blur-3xl pointer-events-none"
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.15, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                background: 'radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 70%)',
                width: '140%', height: '140%',
                left: '-20%', top: '-20%',
              }}
            />
            <GLBAvatar
              glbUrl="/avatar.glb"
              mood="neutral"
              gesture={null}
              isSpeaking={false}
              cameraView="upper"
              style={{ width: '100%', height: '100%' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome speech bubble — shown in 'speak' phase */}
      <AnimatePresence>
        {phase === 'speak' && (
          <motion.div
            className="absolute px-5 py-3 rounded-2xl rounded-bl-none text-center"
            style={{
              bottom: '52%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(167,139,250,0.4)',
              minWidth: 220,
            }}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <p className="text-white text-xs font-bold">JanSaathi में आपका स्वागत है!</p>
            <p className="text-violet-300 text-[10px]">Welcome to JanSaathi Dashboard</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkles — UNCHANGED */}
      <AnimatePresence>
        {phase !== 'lamp' && sparkles.map(sp => (
          <motion.div
            key={sp.id}
            className="absolute pointer-events-none"
            style={{ left: `${sp.x}%`, top: `${sp.y}%` }}
            initial={{ opacity: 1, scale: sp.scale }}
            animate={{ opacity: 0, scale: 0, y: -30, rotate: 180 }}
            transition={{ duration: 0.8 }}
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4">
              <path d="M10 0 L11.5 8.5 L20 10 L11.5 11.5 L10 20 L8.5 11.5 L0 10 L8.5 8.5 Z"
                fill="#F59E0B" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* App title — UNCHANGED */}
      <motion.div
        className="absolute text-center"
        style={{ top: '8%', left: '50%', transform: 'translateX(-50%)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: phase === 'speak' || phase === 'done' ? 1 : 0, y: phase === 'speak' ? 0 : 20 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-black text-white" style={{ fontFamily: "'Baloo 2', cursive" }}>
          Jan<span style={{ color: '#F59E0B' }}>Saathi</span>
        </h1>
        <p className="text-violet-300 text-sm mt-1">आपका सरकारी साथी • Your Government Companion</p>
      </motion.div>

      {/* Skip button — UNCHANGED */}
      <motion.button
        className="absolute bottom-8 right-8 text-white/40 text-xs hover:text-white/70 transition-colors"
        onClick={onComplete}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        Skip →
      </motion.button>
    </motion.div>
  );
};
