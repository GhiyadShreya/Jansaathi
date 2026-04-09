import React from 'react';
import { Bell, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, UserProfile, LANGUAGES, AppStep } from '../../types';
import { Logo } from '../Logo';

interface NavbarProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  profile: UserProfile;
  unreadCount: number;
  showNotifications: boolean;
  setShowNotifications: (val: boolean) => void;
  setAppStep: (step: AppStep) => void;
  renderNotificationPanel: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({
  language, setLanguage, profile,
  unreadCount, showNotifications, setShowNotifications,
  setAppStep, renderNotificationPanel,
}) => (
  <nav
    className="sticky top-0 z-40 backdrop-blur-xl border-b"
    style={{ background: 'rgba(255,255,255,0.92)', borderColor: '#F0EDE8' }}
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <Logo size="md" />

      <div className="flex items-center gap-3">
        {/* Desktop language switcher */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-2xl" style={{ background: '#F5F0EB' }}>
          {(Object.keys(LANGUAGES) as Language[]).map(l => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className="px-3 py-1.5 rounded-xl text-xs font-black transition-all"
              style={{
                background: language === l ? '#FF6B35' : 'transparent',
                color: language === l ? 'white' : '#9CA3AF',
              }}
            >
              {LANGUAGES[l].native}
            </button>
          ))}
        </div>

        {/* Mobile language toggle */}
        <button
          className="md:hidden flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold"
          style={{ background: '#FFF7ED', color: '#D97706' }}
          onClick={() => setAppStep('language')}
        >
          <Globe size={14} />
          {LANGUAGES[language].native}
        </button>

        {/* Notifications bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: showNotifications ? '#FFF7ED' : '#F5F0EB' }}
          >
            <Bell size={18} style={{ color: '#D97706' }} />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[9px] font-black text-white flex items-center justify-center"
                style={{ background: '#EF4444' }}
              >
                {unreadCount}
              </motion.span>
            )}
          </button>
          {renderNotificationPanel}
        </div>

        {/* Profile avatar */}
        <div className="flex items-center gap-2 pl-3 border-l" style={{ borderColor: '#F0EDE8' }}>
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-gray-800">{profile.name || 'Guest'}</p>
            <p className="text-[10px] text-gray-400">{profile.state || 'Set location'}</p>
          </div>
          <div
            className="w-9 h-9 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FF6B35, #F59E0B)' }}
          >
            <span className="text-white text-sm font-black">
              {profile.name ? profile.name[0].toUpperCase() : '?'}
            </span>
          </div>
        </div>
      </div>
    </div>
  </nav>
);