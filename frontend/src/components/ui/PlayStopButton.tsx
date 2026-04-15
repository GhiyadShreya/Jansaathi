import React from 'react';
import { motion } from 'motion/react';
import { Language } from '../../types';

const LABELS: Record<Language, { play: string; stop: string }> = {
  en: { play: 'Play', stop: 'Stop' },
  hi: { play: 'सुनें', stop: 'रोकें' },
  pa: { play: 'ਸੁਣੋ', stop: 'ਰੋਕੋ' },
  gu: { play: 'સાંભળો', stop: 'રોકો' },
};

interface PlayStopButtonProps {
  isSpeaking: boolean;
  onPlay: () => void;
  onStop: () => void;
  language: Language;
  size?: 'sm' | 'md';
}

export const PlayStopButton: React.FC<PlayStopButtonProps> = ({
  isSpeaking, onPlay, onStop, language, size = 'md',
}) => {
  const { play: playLabel, stop: stopLabel } = LABELS[language];

  return (
    <button
      onClick={() => isSpeaking ? onStop() : onPlay()}
      className="flex items-center gap-1.5 rounded-full font-bold transition-all hover:scale-105"
      style={{
        background: isSpeaking ? '#FEE2E2' : '#FFF7ED',
        color: isSpeaking ? '#DC2626' : '#D97706',
        padding: size === 'sm' ? '4px 10px' : '6px 14px',
        fontSize: size === 'sm' ? '10px' : '11px',
      }}
    >
      {isSpeaking ? (
        <>
          <motion.div className="flex gap-0.5 items-center">
            {[3, 6, 4, 7, 3].map((h, i) => (
              <motion.div key={i} className="w-0.5 rounded-full"
                style={{ background: '#DC2626', height: h }}
                animate={{ height: [h, h * 2.5, h] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </motion.div>
          {stopLabel}
        </>
      ) : (
        <>🔊 {playLabel}</>
      )}
    </button>
  );
};