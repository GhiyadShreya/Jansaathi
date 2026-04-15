import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Mic, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { Language, UserProfile, Scheme, LANGUAGES } from '../../types';
import { SchemeList } from '../SchemeList';
import { QUICK_PROMPTS } from '../../constants/quickPrompts';
import { Tab } from '../../hooks/useAppState';
import { useChat } from '../../hooks/useChat';

interface DashboardTabProps {
  language: Language;
  profile: UserProfile;
  schemes: Scheme[];
  isLoadingSchemes: boolean;
  unreadCount: number;
  chat: ReturnType<typeof useChat>;
  setActiveTab: (tab: Tab) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  language, profile, schemes, isLoadingSchemes, unreadCount, chat, setActiveTab,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
    className="space-y-5"
  >
    {/* Hero banner */}
    <div
      className="rounded-3xl p-6 sm:p-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #F59E0B 60%, #FBBF24 100%)' }}
    >
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }} />
      <div className="relative z-10">
        <p className="text-orange-100 text-sm font-medium mb-1">
          🙏 {language === 'hi' ? 'नमस्ते' : language === 'pa' ? 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ' : language === 'gu' ? 'નમસ્તે' : 'Namaste'}
        </p>
        <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight"
          style={{ fontFamily: "'Baloo 2', cursive" }}>
          {profile.name || (language === 'hi' ? 'नागरिक' : 'Citizen')}!
        </h2>
        <p className="text-orange-100 mt-2 max-w-sm text-sm">
          {schemes.length > 0
            ? (language === 'hi' ? `आपके लिए ${schemes.length} योजनाएं मिली हैं।` : `${schemes.length} schemes matched your profile.`)
            : (language === 'hi' ? 'प्रोफ़ाइल पूरा करें - आपके लिए सही योजनाएं खोजें।' : 'Complete your profile to find schemes tailored for you.')}
        </p>
        {!profile.name && (
          <button
            onClick={() => setActiveTab('profile')}
            className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black transition-all hover:scale-105"
            style={{ background: 'white', color: '#FF6B35' }}
          >
            {language === 'hi' ? 'प्रोफ़ाइल बनाएं' : 'Set Up Profile'}
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-3 gap-3">
      {[
        { icon: '📋', value: schemes.length, label: language === 'hi' ? 'योजनाएं' : 'Schemes', color: '#7C3AED' },
        { icon: '🔔', value: unreadCount, label: language === 'hi' ? 'नई सूचनाएं' : 'New Alerts', color: '#EF4444' },
        { icon: '📄', value: profile.documents.length, label: language === 'hi' ? 'दस्तावेज़' : 'Documents', color: '#059669' },
      ].map((stat, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="rounded-2xl p-4 text-center"
          style={{ background: 'white', border: '1px solid #F0EDE8' }}
        >
          <span className="text-2xl block mb-1">{stat.icon}</span>
          <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
          <p className="text-xs text-gray-400 font-medium mt-0.5">{stat.label}</p>
        </motion.div>
      ))}
    </div>

    {/* Schemes + Quick chat */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

      {/* Schemes list */}
      <div className="rounded-3xl p-5" style={{ background: 'white', border: '1px solid #F0EDE8' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-gray-800 flex items-center gap-2">
            🏛️ {language === 'hi' ? 'मेरी योजनाएं' : 'My Schemes'}
          </h3>
          <button
            onClick={() => setActiveTab('profile')}
            className="text-xs font-bold px-3 py-1 rounded-xl transition-all hover:scale-105"
            style={{ background: '#FFF7ED', color: '#D97706' }}
          >
            {language === 'hi' ? 'रीफ्रेश' : 'Refresh'}
          </button>
        </div>
        <SchemeList schemes={schemes} isLoading={isLoadingSchemes} language={language} />
      </div>

      {/* Quick chat widget */}
      <div
        className="rounded-3xl p-5 flex flex-col"
        style={{ background: 'white', border: '1px solid #F0EDE8', minHeight: 400 }}
      >
        <h3 className="font-black text-gray-800 flex items-center gap-2 mb-4">
          💬 {language === 'hi' ? 'साथी से पूछें' : language === 'pa' ? 'ਸਾਥੀ ਨੂੰ ਪੁੱਛੋ' : 'Quick Ask'}
        </h3>

        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 max-h-64" style={{ minHeight: 120 }}>
          {chat.chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-4 gap-3">
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_PROMPTS[language].map(q => (
                  <button
                    key={q}
                    onClick={() => { setActiveTab('chat'); chat.setInputText(q); }}
                    className="px-3 py-2 rounded-2xl text-xs font-medium transition-all hover:scale-105 text-left"
                    style={{ background: '#FFF7ED', color: '#D97706', border: '1px solid #FED7AA' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            chat.chatHistory.slice(-6).map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'rounded-tr-none text-white' : 'rounded-tl-none text-gray-800'}`}
                  style={{ background: msg.role === 'user' ? 'linear-gradient(135deg, #FF6B35, #F59E0B)' : '#F5F0EB' }}
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))
          )}

          {chat.isThinking && (
            <div className="flex justify-start">
              <div className="px-4 py-2.5 rounded-2xl rounded-tl-none flex gap-1.5" style={{ background: '#F5F0EB' }}>
                {[0, 0.15, 0.3].map((d, i) => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#D97706' }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: d }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={chat.chatEndRef} />
        </div>

        {/* Inline input */}
        <div className="relative">
          <input
            value={chat.inputText}
            onChange={e => chat.setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && chat.sendMessage()}
            placeholder={language === 'hi' ? 'यहाँ लिखें...' : language === 'pa' ? 'ਇੱਥੇ ਲਿਖੋ...' : 'Type here...'}
            className="w-full pl-4 pr-24 py-3 rounded-2xl text-sm outline-none transition-all"
            style={{ background: '#FBF8F4', border: '2px solid #F0EDE8', color: '#374151' }}
            onFocus={e => (e.target.style.borderColor = '#FF6B35')}
            onBlur={e => (e.target.style.borderColor = '#F0EDE8')}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              onClick={chat.toggleRecording}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{ background: chat.isRecording ? '#FEE2E2' : '#F5F0EB', color: chat.isRecording ? '#DC2626' : '#9CA3AF' }}
            >
              <Mic size={15} />
            </button>
            <button
              onClick={() => chat.sendMessage()}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #FF6B35, #F59E0B)', color: 'white' }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);