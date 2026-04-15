import React from 'react';
import { MessageSquare, ShieldCheck, LogOut } from 'lucide-react';
import { Language, UserProfile, Notification, LANGUAGES } from '../../types';
import { Avatar } from '../Avatar';
import { PlayStopButton } from '../ui/PlayStopButton';
import { speak } from '../../services/tts';
import { Tab } from '../../hooks/useAppState';

interface SidebarProps {
  language: Language;
  profile: UserProfile;
  isSpeaking: boolean;
  isThinking: boolean;
  isRecording: boolean;
  notifications: Notification[];
  unreadCount: number;
  setActiveTab: (tab: Tab) => void;
  setShowNotifications: (val: boolean) => void;
  handleMarkRead: (id: string) => void;
  onRestartIntro: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  language, profile, isSpeaking, isThinking, isRecording,
  notifications, unreadCount, setActiveTab,
  setShowNotifications, handleMarkRead, onRestartIntro,
}) => (
  <aside className="hidden lg:flex flex-col gap-5 w-72 shrink-0">

    {/* Avatar card */}
    <div
      className="rounded-3xl p-6 text-center relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FFF7ED 0%, #FFF0E8 60%, #F5F3FF 100%)', border: '1px solid #F0EDE8' }}
    >
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #FF6B35, transparent)' }} />

      <Avatar
        isSpeaking={isSpeaking}
        mood={isThinking ? 'thinking' : isRecording ? 'listening' : 'neutral'}
        language={language}
      />

      <div className="mt-5">
        <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Baloo 2', cursive" }}>
          Saathi
        </h2>
        <p className="text-sm text-gray-500 mt-1.5 leading-relaxed px-2">
          {LANGUAGES[language].greeting}
        </p>
        <div className="mt-3 flex justify-center">
          <PlayStopButton
            isSpeaking={isSpeaking}
            onPlay={() => speak(LANGUAGES[language].greeting, language)}
            onStop={() => {}}
            language={language}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveTab('chat')}
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-xs font-bold transition-all hover:scale-105"
          style={{ background: '#EDE9FE', color: '#6D28D9' }}
        >
          <MessageSquare size={20} />
          {language === 'hi' ? 'पूछें' : language === 'pa' ? 'ਪੁੱਛੋ' : language === 'gu' ? 'પૂछो' : 'Ask'}
        </button>
        <button
          onClick={() => setActiveTab('verify')}
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-xs font-bold transition-all hover:scale-105"
          style={{ background: '#D1FAE5', color: '#065F46' }}
        >
          <ShieldCheck size={20} />
          {language === 'hi' ? 'सत्यापित' : language === 'pa' ? 'ਤਸਦੀਕ' : 'Verify'}
        </button>
      </div>
    </div>

    {/* Notifications preview */}
    <div className="rounded-3xl p-5" style={{ background: 'white', border: '1px solid #F0EDE8' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
          {language === 'hi' ? 'हाल की सूचनाएं' : 'Recent Alerts'}
        </h3>
        {unreadCount > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-black text-white"
            style={{ background: '#EF4444' }}>{unreadCount} new</span>
        )}
      </div>
      <div className="space-y-2">
        {notifications.slice(0, 3).map(n => (
          <div
            key={n.id}
            onClick={() => { handleMarkRead(n.id); setShowNotifications(true); }}
            className="flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all hover:bg-orange-50"
            style={{ background: n.read ? 'transparent' : '#FFF7ED' }}
          >
            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-gray-200' : 'bg-orange-500'}`} />
            <p className={`text-xs leading-snug ${n.read ? 'text-gray-400' : 'text-gray-700 font-medium'}`}>
              {n.title}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* Restart intro */}
    <button
      onClick={onRestartIntro}
      className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all hover:scale-105"
      style={{ background: '#F5F0EB', color: '#9CA3AF' }}
    >
      <LogOut size={14} />
      Restart Intro
    </button>
  </aside>
);