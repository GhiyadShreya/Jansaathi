import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ size = 'md' }) => {
  const dim = size === 'sm' ? 32 : size === 'md' ? 40 : 52;

  return (
    <div className="flex items-center gap-2.5">
      {/* Icon mark */}
      <svg width={dim} height={dim} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B35" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF9F68" />
            <stop offset="100%" stopColor="#FCD34D" />
          </linearGradient>
        </defs>

        {/* Background shape */}
        <rect width="48" height="48" rx="13" fill="url(#logoGrad)" />

        {/* Ashoka wheel hint - simplified */}
        <circle cx="24" cy="18" r="8" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" />
        <circle cx="24" cy="18" r="2" fill="white" opacity="0.8" />
        {/* Spokes */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
          <line
            key={i}
            x1={24 + Math.cos(deg * Math.PI / 180) * 2.5}
            y1={18 + Math.sin(deg * Math.PI / 180) * 2.5}
            x2={24 + Math.cos(deg * Math.PI / 180) * 7}
            y2={18 + Math.sin(deg * Math.PI / 180) * 7}
            stroke="white"
            strokeWidth="0.8"
            opacity="0.6"
          />
        ))}

        {/* Hand/helping icon */}
        <path
          d="M14 32 C14 28 17 26 20 26 L26 26 C28 26 30 24 30 22 L30 20 C30 19 31 18 32 18 L34 18 C35 18 36 19 36 20 L36 28 C36 32 33 36 28 36 L18 36 C15.8 36 14 34.2 14 32 Z"
          fill="white"
          opacity="0.9"
        />
        <path
          d="M14 32 L14 36 L18 36"
          stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"
        />
      </svg>

      {/* Text */}
      <div>
        <h1
          className={`font-black leading-none tracking-tight ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'}`}
          style={{ fontFamily: "'Baloo 2', cursive", color: '#1A1A2E' }}
        >
          Jan<span style={{ color: '#FF6B35' }}>Saathi</span>
        </h1>
        {size !== 'sm' && (
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 mt-0.5">
            आपका सरकारी साथी
          </p>
        )}
      </div>
    </div>
  );
};
