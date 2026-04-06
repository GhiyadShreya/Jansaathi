import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, User, Bell, Mic, Send, ShieldCheck,
  LayoutDashboard, ChevronRight, X, Globe, LogOut
} from 'lucide-react';
import { Avatar } from './components/Avatar';
import { ProfileForm } from './components/ProfileForm';
import { SchemeList } from './components/SchemeList';
import { GenieIntro } from './components/GenieIntro';
import { LanguageSelect } from './components/LanguageSelect';
import { ActionSelect } from './components/ActionSelect';
import { NotificationPanel } from './components/NotificationPanel';
import { Logo } from './components/Logo';
import { UserProfile, Scheme, Language, LANGUAGES, AppStep, Notification, DEMO_NOTIFICATIONS, DEMO_SCHEMES } from './types';
import { getMatchedSchemes, getChatResponse, verifyDocument } from './services/groq';
import { speak, stopSpeaking, replayLast, registerSpeakingCallback, initSpeechRecognition } from './services/tts';
import { storage } from './services/storage';
import ReactMarkdown from 'react-markdown';

type Tab = 'dashboard' | 'profile' | 'chat' | 'verify';

// Reusable Play/Stop toggle button
const PlayStopButton: React.FC<{
  isSpeaking: boolean;
  onPlay: () => void;
  onStop: () => void;
  language: Language;
  size?: 'sm' | 'md';
}> = ({ isSpeaking, onPlay, onStop, language, size = 'md' }) => {
  const playLabel = language === 'hi' ? 'सुनें' : language === 'pa' ? 'ਸੁਣੋ' : language === 'gu' ? 'સાંભળો' : 'Play';
  const stopLabel = language === 'hi' ? 'रोकें' : language === 'pa' ? 'ਰੋਕੋ' : language === 'gu' ? 'રોકો' : 'Stop';

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

export default function App() {
  const [appStep, setAppStep] = useState<AppStep>('genie');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [profile, setProfile] = useState<UserProfile>(storage.getProfile());
  const [schemes, setSchemes] = useState<Scheme[]>(DEMO_SCHEMES.slice(0, 3));
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>(storage.getChatHistory());
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(storage.getNotifications());
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ valid: boolean; reason: string } | null>(null);
  const [selectedScheme, setSelectedScheme] = useState('Post-Matric Scholarship');
  const [hasGreeted, setHasGreeted] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const stopRecordingRef = useRef<(() => void) | null>(null);

  useEffect(() => { registerSpeakingCallback(setIsSpeaking); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);
  useEffect(() => { storage.saveProfile(profile); }, [profile]);
  useEffect(() => { storage.saveChatHistory(chatHistory); }, [chatHistory]);

  useEffect(() => {
    if (appStep === 'dashboard' && !hasGreeted) {
      setHasGreeted(true);
      setTimeout(() => speak(LANGUAGES[language].greeting, language), 600);
    }
  }, [appStep, language, hasGreeted]);

  const handleGenieComplete = () => setAppStep('language');

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setAppStep('action');
  };

  const handleActionSelect = (action: 'profile' | 'chat' | 'dashboard') => {
    setActiveTab(action === 'dashboard' ? 'dashboard' : action);
    setAppStep('dashboard');
  };

  const handleSaveProfile = async () => {
    setIsLoadingSchemes(true);
    setActiveTab('dashboard');
    const matched = await getMatchedSchemes(profile, language);
    setSchemes(matched);
    setIsLoadingSchemes(false);
    const msg = language === 'hi'
      ? `${profile.name || 'आपके'} के लिए ${matched.length} योजनाएं मिली हैं!`
      : `Found ${matched.length} schemes for ${profile.name || 'you'}!`;
    speak(msg, language);
  };

  const handleSendMessage = async (overrideText?: string) => {
    const text = overrideText || inputText;
    if (!text.trim()) return;
    stopSpeaking();
    setChatHistory(prev => [...prev, { role: 'user', text }]);
    setInputText('');
    setIsThinking(true);
    const reply = await getChatResponse(text, profile, language);
    setIsThinking(false);
    setChatHistory(prev => [...prev, { role: 'ai', text: reply }]);
    speak(reply, language);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecordingRef.current?.();
      setIsRecording(false);
    } else {
      const stop = initSpeechRecognition(
        language,
        (transcript) => {
          setIsRecording(false);
          setInputText(transcript);
          setTimeout(() => handleSendMessage(transcript), 300);
        },
        () => setIsRecording(false)
      );
      if (stop) {
        stopRecordingRef.current = stop;
        setIsRecording(true);
      } else {
        speak(language === 'hi' ? 'यह ब्राउज़र वॉइस का समर्थन नहीं करता।' : 'Voice not supported in this browser.', language);
      }
    }
  };

  const handleVerify = async () => {
    if (!selectedScheme) return;
    setIsThinking(true);
    const docName = profile.documents[0] || 'Aadhaar Card';
    const result = await verifyDocument(docName, selectedScheme);
    setVerificationResult(result);
    setIsThinking(false);
    speak(result.reason, language);
  };

  const handleMarkRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    storage.saveNotifications(updated);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const tabConfig = [
    { id: 'dashboard' as Tab, icon: LayoutDashboard, label: { en: 'Home', hi: 'होम', pa: 'ਹੋਮ', gu: 'હોમ' } },
    { id: 'profile' as Tab, icon: User, label: { en: 'Profile', hi: 'प्रोफाइल', pa: 'ਪ੍ਰੋਫਾਈਲ', gu: 'પ્રોファઇल' } },
    { id: 'chat' as Tab, icon: MessageSquare, label: { en: 'Ask', hi: 'पूछें', pa: 'ਪੁੱਛੋ', gu: 'પૂछो' } },
    { id: 'verify' as Tab, icon: ShieldCheck, label: { en: 'Verify', hi: 'सत्यापित', pa: 'ਤਸਦੀਕ', gu: 'VerIfy' } },
  ];

  const quickPrompts: Record<Language, string[]> = {
    en: ['What schemes am I eligible for?', 'How to apply for Ayushman Bharat?', 'Farming subsidies in my state'],
    hi: ['मेरे लिए कौन सी योजनाएं हैं?', 'आयुष्मान भारत के लिए कैसे आवेदन करें?', 'किसान सम्मान निधि की जानकारी'],
    pa: ['ਮੇਰੇ ਲਈ ਕਿਹੜੀਆਂ ਯੋਜਨਾਵਾਂ ਹਨ?', 'ਕਿਸਾਨ ਸਨਮਾਨ ਨਿਧੀ ਬਾਰੇ', 'ਸਿਹਤ ਕਾਰਡ ਕਿਵੇਂ ਬਣਾਈਏ?'],
    gu: ['मारा माटे कई योजनाओ छे?', 'आयुष्मान भारत माटे केवी रीते अरजी करवी?', 'ખेડूत માटે સહायता'],
  };

  if (appStep === 'genie') return <GenieIntro onComplete={handleGenieComplete} />;
  if (appStep === 'language') return <LanguageSelect onSelect={handleLanguageSelect} />;
  if (appStep === 'action') return <ActionSelect language={language} onSelect={handleActionSelect} />;

  return (
    <div className="min-h-screen" style={{ background: '#FBF8F4', fontFamily: "'Inter', sans-serif" }}>

      {/* ── TOP NAVBAR ── */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl border-b"
        style={{ background: 'rgba(255,255,255,0.92)', borderColor: '#F0EDE8' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo size="md" />

          <div className="flex items-center gap-3">
            {/* Desktop language switcher */}
            <div className="hidden md:flex items-center gap-1 p-1 rounded-2xl" style={{ background: '#F5F0EB' }}>
              {(Object.keys(LANGUAGES) as Language[]).map(l => (
                <button key={l} onClick={() => setLanguage(l)}
                  className="px-3 py-1.5 rounded-xl text-xs font-black transition-all"
                  style={{
                    background: language === l ? '#FF6B35' : 'transparent',
                    color: language === l ? 'white' : '#9CA3AF',
                  }}>
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

            {/* Notifications */}
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
              <AnimatePresence>
                {showNotifications && (
                  <NotificationPanel
                    notifications={notifications}
                    onClose={() => setShowNotifications(false)}
                    onMarkRead={handleMarkRead}
                    language={language}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Profile avatar */}
            <div className="flex items-center gap-2 pl-3 border-l" style={{ borderColor: '#F0EDE8' }}>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-gray-800">{profile.name || 'Guest'}</p>
                <p className="text-[10px] text-gray-400">{profile.state || 'Set location'}</p>
              </div>
              <div className="w-9 h-9 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FF6B35, #F59E0B)' }}>
                <span className="text-white text-sm font-black">
                  {profile.name ? profile.name[0].toUpperCase() : '?'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {showNotifications && (
        <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">

          {/* ── SIDEBAR ── */}
          <aside className="hidden lg:flex flex-col gap-5 w-72 shrink-0">

            {/* Avatar Card */}
            <div className="rounded-3xl p-6 text-center relative overflow-hidden"
              style={{ background: 'linear-gradient(160deg, #FFF7ED 0%, #FFF0E8 60%, #F5F3FF 100%)', border: '1px solid #F0EDE8' }}>
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #FF6B35, transparent)' }} />

              <Avatar isSpeaking={isSpeaking} mood={isThinking ? 'thinking' : isRecording ? 'listening' : 'neutral'} language={language} />
              <div className="mt-5">
                <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Baloo 2', cursive" }}>
                  Saathi
                </h2>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed px-2">
                  {LANGUAGES[language].greeting}
                </p>

                {/* ── PLAY / STOP BUTTON (sidebar) ── */}
                <div className="mt-3 flex justify-center">
                  <PlayStopButton
                    isSpeaking={isSpeaking}
                    onPlay={() => speak(LANGUAGES[language].greeting, language)}
                    onStop={stopSpeaking}
                    language={language}
                  />
                </div>
              </div>

              {/* Quick action buttons */}
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button onClick={() => setActiveTab('chat')}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-xs font-bold transition-all hover:scale-105"
                  style={{ background: '#EDE9FE', color: '#6D28D9' }}>
                  <MessageSquare size={20} />
                  {language === 'hi' ? 'पूछें' : language === 'pa' ? 'ਪੁੱਛੋ' : language === 'gu' ? 'પૂछो' : 'Ask'}
                </button>
                <button onClick={() => setActiveTab('verify')}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-xs font-bold transition-all hover:scale-105"
                  style={{ background: '#D1FAE5', color: '#065F46' }}>
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
                  <div key={n.id} onClick={() => { handleMarkRead(n.id); setShowNotifications(true); }}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all hover:bg-orange-50"
                    style={{ background: n.read ? 'transparent' : '#FFF7ED' }}>
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-gray-200' : 'bg-orange-500'}`} />
                    <p className={`text-xs leading-snug ${n.read ? 'text-gray-400' : 'text-gray-700 font-medium'}`}>
                      {n.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Restart onboarding */}
            <button
              onClick={() => { stopSpeaking(); setAppStep('genie'); setHasGreeted(false); }}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all hover:scale-105"
              style={{ background: '#F5F0EB', color: '#9CA3AF' }}
            >
              <LogOut size={14} />
              Restart Intro
            </button>
          </aside>

          {/* ── MAIN AREA ── */}
          <main className="flex-1 min-w-0">

            {/* Tab nav */}
            <div className="flex gap-1.5 p-1.5 rounded-3xl mb-6 overflow-x-auto no-scrollbar"
              style={{ background: 'white', border: '1px solid #F0EDE8' }}>
              {tabConfig.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-sm font-black transition-all whitespace-nowrap flex-1 justify-center"
                  style={{
                    background: activeTab === tab.id ? 'linear-gradient(135deg, #FF6B35, #F59E0B)' : 'transparent',
                    color: activeTab === tab.id ? 'white' : '#9CA3AF',
                    boxShadow: activeTab === tab.id ? '0 4px 15px rgba(255,107,53,0.3)' : 'none',
                  }}>
                  <tab.icon size={16} />
                  <span className="hidden sm:inline">{tab.label[language]}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* ── DASHBOARD ── */}
              {activeTab === 'dashboard' && (
                <motion.div key="dashboard"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-5">

                  {/* Hero banner */}
                  <div className="rounded-3xl p-6 sm:p-8 relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #F59E0B 60%, #FBBF24 100%)' }}>
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
                        <button onClick={() => setActiveTab('profile')}
                          className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black transition-all hover:scale-105"
                          style={{ background: 'white', color: '#FF6B35' }}>
                          {language === 'hi' ? 'प्रोफ़ाइल बनाएं' : 'Set Up Profile'}
                          <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                    <div className="absolute right-6 bottom-4 opacity-15">
                      <svg viewBox="0 0 60 60" className="w-20 h-20">
                        <circle cx="30" cy="30" r="28" fill="none" stroke="white" strokeWidth="2" />
                        <circle cx="30" cy="30" r="4" fill="white" />
                        {Array.from({ length: 24 }).map((_, i) => (
                          <line key={i}
                            x1={30 + Math.cos(i * 15 * Math.PI / 180) * 5}
                            y1={30 + Math.sin(i * 15 * Math.PI / 180) * 5}
                            x2={30 + Math.cos(i * 15 * Math.PI / 180) * 26}
                            y2={30 + Math.sin(i * 15 * Math.PI / 180) * 26}
                            stroke="white" strokeWidth="0.8"
                          />
                        ))}
                      </svg>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: '📋', value: schemes.length, label: language === 'hi' ? 'योजनाएं' : 'Schemes', color: '#7C3AED' },
                      { icon: '🔔', value: unreadCount, label: language === 'hi' ? 'नई सूचनाएं' : 'New Alerts', color: '#EF4444' },
                      { icon: '📄', value: profile.documents.length, label: language === 'hi' ? 'दस्तावेज़' : 'Documents', color: '#059669' },
                    ].map((stat, i) => (
                      <motion.div key={i} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="rounded-2xl p-4 text-center"
                        style={{ background: 'white', border: '1px solid #F0EDE8' }}>
                        <span className="text-2xl block mb-1">{stat.icon}</span>
                        <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Schemes + Quick chat */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="rounded-3xl p-5" style={{ background: 'white', border: '1px solid #F0EDE8' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-gray-800 flex items-center gap-2">
                          🏛️ {language === 'hi' ? 'मेरी योजनाएं' : 'My Schemes'}
                        </h3>
                        <button onClick={() => setActiveTab('profile')}
                          className="text-xs font-bold px-3 py-1 rounded-xl transition-all hover:scale-105"
                          style={{ background: '#FFF7ED', color: '#D97706' }}>
                          {language === 'hi' ? 'रीफ्रेश' : 'Refresh'}
                        </button>
                      </div>
                      <SchemeList schemes={schemes} isLoading={isLoadingSchemes} language={language} />
                    </div>

                    {/* Quick chat */}
                    <div className="rounded-3xl p-5 flex flex-col" style={{ background: 'white', border: '1px solid #F0EDE8', minHeight: 400 }}>
                      <h3 className="font-black text-gray-800 flex items-center gap-2 mb-4">
                        💬 {language === 'hi' ? 'साथी से पूछें' : language === 'pa' ? 'ਸਾਥੀ ਨੂੰ ਪੁੱਛੋ' : 'Quick Ask'}
                      </h3>
                      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 max-h-64" style={{ minHeight: 120 }}>
                        {chatHistory.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center py-4 gap-3">
                            <div className="flex flex-wrap gap-2 justify-center">
                              {quickPrompts[language].map(q => (
                                <button key={q} onClick={() => { setActiveTab('chat'); setInputText(q); }}
                                  className="px-3 py-2 rounded-2xl text-xs font-medium transition-all hover:scale-105 text-left"
                                  style={{ background: '#FFF7ED', color: '#D97706', border: '1px solid #FED7AA' }}>
                                  {q}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          chatHistory.slice(-6).map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                                msg.role === 'user' ? 'rounded-tr-none text-white' : 'rounded-tl-none text-gray-800'
                              }`} style={{
                                background: msg.role === 'user' ? 'linear-gradient(135deg, #FF6B35, #F59E0B)' : '#F5F0EB',
                              }}>
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                              </div>
                            </div>
                          ))
                        )}
                        {isThinking && (
                          <div className="flex justify-start">
                            <div className="px-4 py-2.5 rounded-2xl rounded-tl-none flex gap-1.5" style={{ background: '#F5F0EB' }}>
                              {[0, 0.15, 0.3].map((d, i) => (
                                <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: '#D97706' }}
                                  animate={{ y: [0, -5, 0] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay: d }} />
                              ))}
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                      <div className="relative">
                        <input
                          value={inputText}
                          onChange={e => setInputText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                          placeholder={language === 'hi' ? 'यहाँ लिखें...' : language === 'pa' ? 'ਇੱਥੇ ਲਿਖੋ...' : 'Type here...'}
                          className="w-full pl-4 pr-24 py-3 rounded-2xl text-sm outline-none transition-all"
                          style={{ background: '#FBF8F4', border: '2px solid #F0EDE8', color: '#374151' }}
                          onFocus={e => (e.target.style.borderColor = '#FF6B35')}
                          onBlur={e => (e.target.style.borderColor = '#F0EDE8')}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <button onClick={toggleRecording}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                            style={{ background: isRecording ? '#FEE2E2' : '#F5F0EB', color: isRecording ? '#DC2626' : '#9CA3AF' }}>
                            <Mic size={15} />
                          </button>
                          <button onClick={() => handleSendMessage()}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                            style={{ background: 'linear-gradient(135deg, #FF6B35, #F59E0B)', color: 'white' }}>
                            <Send size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── PROFILE ── */}
              {activeTab === 'profile' && (
                <motion.div key="profile"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                  className="max-w-2xl mx-auto">
                  <div className="rounded-3xl p-6 mb-5"
                    style={{ background: 'linear-gradient(135deg, #FFF7ED, #FFF0E8)', border: '1px solid #FED7AA' }}>
                    <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Baloo 2', cursive" }}>
                      {language === 'hi' ? '👤 आपकी प्रोफ़ाइल' : language === 'pa' ? '👤 ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ' : '👤 Your Profile'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {language === 'hi' ? 'सटीक जानकारी से बेहतर योजनाएं मिलती हैं' : 'Accurate details help find better schemes for you'}
                    </p>
                  </div>
                  <div className="rounded-3xl p-6" style={{ background: 'white', border: '1px solid #F0EDE8' }}>
                    <ProfileForm
                      profile={profile}
                      setProfile={setProfile}
                      onSave={handleSaveProfile}
                      language={language}
                      isSaving={isLoadingSchemes}
                    />
                  </div>
                </motion.div>
              )}

              {/* ── FULL CHAT ── */}
              {activeTab === 'chat' && (
                <motion.div key="chat"
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="rounded-3xl overflow-hidden flex flex-col"
                  style={{ background: 'white', border: '1px solid #F0EDE8', height: 'calc(100vh - 200px)', minHeight: 500 }}>

                  {/* Chat header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b"
                    style={{ background: 'linear-gradient(135deg, #FFF7ED, #FFFBEB)', borderColor: '#F0EDE8' }}>
                    <div className="flex items-center gap-3">
                      <Avatar isSpeaking={isSpeaking} mood={isThinking ? 'thinking' : isRecording ? 'listening' : 'neutral'} language={language} size="sm" />
                      <div>
                        <h3 className="font-black text-gray-900">
                          {language === 'hi' ? 'साथी AI' : language === 'pa' ? 'ਸਾਥੀ AI' : 'Saathi AI'}
                        </h3>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Online</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* ── PLAY / STOP BUTTON (chat) ── */}
                      <PlayStopButton
                        isSpeaking={isSpeaking}
                        onPlay={replayLast}
                        onStop={stopSpeaking}
                        language={language}
                        size="sm"
                      />

                      <button onClick={() => { stopSpeaking(); setChatHistory([]); storage.saveChatHistory([]); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                        style={{ background: '#FEE2E2', color: '#DC2626' }}>
                        <X size={12} />
                        {language === 'hi' ? 'साफ करें' : 'Clear'}
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {chatHistory.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center gap-5">
                        <div className="text-6xl">🧞‍♀️</div>
                        <div>
                          <h4 className="text-lg font-black text-gray-800" style={{ fontFamily: "'Baloo 2', cursive" }}>
                            {language === 'hi' ? 'नमस्ते! मैं Saathi हूँ' : "Namaste! I'm Saathi"}
                          </h4>
                          <p className="text-sm text-gray-400 mt-1">
                            {language === 'hi' ? 'मुझसे किसी भी सरकारी योजना के बारे में पूछें' : 'Ask me anything about government schemes'}
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 max-w-sm">
                          {quickPrompts[language].map(q => (
                            <button key={q} onClick={() => setInputText(q)}
                              className="px-4 py-2 rounded-2xl text-xs font-medium transition-all hover:scale-105"
                              style={{ background: '#FFF7ED', color: '#D97706', border: '1px solid #FED7AA' }}>
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {chatHistory.map((msg, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
                        {msg.role === 'ai' && (
                          <div className="w-8 h-8 rounded-2xl shrink-0 flex items-center justify-center text-base"
                            style={{ background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)' }}>
                            🧞‍♀️
                          </div>
                        )}
                        <div className={`max-w-[75%] px-5 py-3 rounded-3xl text-sm leading-relaxed ${
                          msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'
                        }`} style={{
                          background: msg.role === 'user' ? 'linear-gradient(135deg, #FF6B35, #F59E0B)' : '#FBF8F4',
                          color: msg.role === 'user' ? 'white' : '#374151',
                          border: msg.role === 'ai' ? '1px solid #F0EDE8' : 'none',
                        }}>
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-8 h-8 rounded-2xl shrink-0 flex items-center justify-center font-black text-sm text-white"
                            style={{ background: 'linear-gradient(135deg, #FF6B35, #F59E0B)' }}>
                            {profile.name ? profile.name[0].toUpperCase() : 'U'}
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {isThinking && (
                      <div className="flex justify-start gap-3">
                        <div className="w-8 h-8 rounded-2xl flex items-center justify-center text-base"
                          style={{ background: '#FFF7ED' }}>🧞‍♀️</div>
                        <div className="px-5 py-3 rounded-3xl rounded-tl-sm flex gap-2 items-center"
                          style={{ background: '#FBF8F4', border: '1px solid #F0EDE8' }}>
                          {[0, 0.2, 0.4].map((d, i) => (
                            <motion.div key={i} className="w-2 h-2 rounded-full"
                              style={{ background: '#D97706' }}
                              animate={{ y: [0, -6, 0] }}
                              transition={{ duration: 0.7, repeat: Infinity, delay: d }} />
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input area */}
                  <div className="p-5 border-t" style={{ borderColor: '#F0EDE8', background: '#FFFAF6' }}>
                    <div className="relative max-w-3xl mx-auto">
                      <textarea
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                        placeholder={language === 'hi' ? 'अपना सवाल लिखें...' : language === 'pa' ? 'ਆਪਣਾ ਸਵਾਲ ਲਿਖੋ...' : 'Type your question here...'}
                        rows={1}
                        className="w-full pl-5 pr-28 py-4 rounded-3xl text-sm outline-none resize-none"
                        style={{ background: 'white', border: '2px solid #F0EDE8', color: '#374151' }}
                        onFocus={e => (e.target.style.borderColor = '#FF6B35')}
                        onBlur={e => (e.target.style.borderColor = '#F0EDE8')}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button onClick={toggleRecording}
                          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all hover:scale-110"
                          style={{ background: isRecording ? '#FEE2E2' : '#F5F0EB', color: isRecording ? '#DC2626' : '#9CA3AF' }}>
                          <Mic size={18} />
                        </button>
                        <button onClick={() => handleSendMessage()}
                          className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black transition-all hover:scale-105"
                          style={{ background: 'linear-gradient(135deg, #FF6B35, #F59E0B)', color: 'white' }}>
                          <Send size={16} />
                          {language === 'hi' ? 'भेजें' : 'Send'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── VERIFY ── */}
              {activeTab === 'verify' && (
                <motion.div key="verify"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="max-w-lg mx-auto space-y-5">

                  <div className="rounded-3xl p-6"
                    style={{ background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', border: '1px solid #6EE7B7' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                        style={{ background: 'white' }}>🛡️</div>
                      <div>
                        <h2 className="text-xl font-black text-green-900" style={{ fontFamily: "'Baloo 2', cursive" }}>
                          {language === 'hi' ? 'दस्तावेज़ सत्यापन' : 'Document Verification'}
                        </h2>
                        <p className="text-sm text-green-700">
                          {language === 'hi' ? 'जांचें कि आपके दस्तावेज़ सही हैं' : 'Check if your documents are valid'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl p-6 space-y-5" style={{ background: 'white', border: '1px solid #F0EDE8' }}>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                        🏛️ {language === 'hi' ? 'योजना चुनें' : 'Select Scheme'}
                      </label>
                      <select
                        value={selectedScheme}
                        onChange={e => setSelectedScheme(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all"
                        style={{ background: '#FBF8F4', border: '2px solid #F0EDE8', color: '#374151' }}
                        onFocus={e => (e.target.style.borderColor = '#059669')}
                        onBlur={e => (e.target.style.borderColor = '#F0EDE8')}
                      >
                        <option value="Post-Matric Scholarship">Post-Matric Scholarship</option>
                        <option value="PM-Kisan Samman Nidhi">PM-Kisan Samman Nidhi</option>
                        <option value="Ayushman Bharat PM-JAY">Ayushman Bharat PM-JAY</option>
                        <option value="PM Mudra Yojana">PM Mudra Yojana</option>
                        <option value="PM Ujjwala Yojana">PM Ujjwala Yojana</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                        📄 {language === 'hi' ? 'आपके दस्तावेज़' : 'Your Documents'}
                      </label>
                      {profile.documents.length === 0 ? (
                        <div className="p-6 rounded-2xl text-center border-2 border-dashed" style={{ borderColor: '#F0EDE8' }}>
                          <p className="text-sm text-gray-400">
                            {language === 'hi' ? 'प्रोफ़ाइल में दस्तावेज़ जोड़ें।' : 'Add documents in your Profile section.'}
                          </p>
                          <button onClick={() => setActiveTab('profile')}
                            className="mt-3 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                            style={{ background: '#FFF7ED', color: '#D97706' }}>
                            {language === 'hi' ? 'प्रोफ़ाइल जाएं →' : 'Go to Profile →'}
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {profile.documents.map(doc => (
                            <div key={doc} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
                              style={{ background: '#D1FAE5', color: '#065F46' }}>
                              📎 {doc}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleVerify}
                      disabled={isThinking || profile.documents.length === 0}
                      className="w-full py-4 rounded-2xl font-black text-white text-base transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ background: isThinking ? '#9CA3AF' : 'linear-gradient(135deg, #059669, #10B981)', fontFamily: "'Baloo 2', cursive" }}
                    >
                      {isThinking ? (
                        <>
                          <motion.div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white"
                            animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                          {language === 'hi' ? 'जाँच हो रही है...' : 'Verifying...'}
                        </>
                      ) : (
                        <><ShieldCheck size={20} /> {language === 'hi' ? 'सत्यापित करें' : 'Verify Now'}</>
                      )}
                    </button>

                    <AnimatePresence>
                      {verificationResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="p-5 rounded-2xl"
                          style={{
                            background: verificationResult.valid ? '#F0FDF4' : '#FEF2F2',
                            border: `2px solid ${verificationResult.valid ? '#86EFAC' : '#FECACA'}`,
                          }}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{verificationResult.valid ? '✅' : '❌'}</span>
                            <h4 className="font-black text-gray-900">
                              {verificationResult.valid
                                ? (language === 'hi' ? 'सत्यापन सफल!' : 'Verification Successful!')
                                : (language === 'hi' ? 'सत्यापन असफल' : 'Verification Failed')}
                            </h4>
                          </div>
                          <p className="text-sm leading-relaxed" style={{ color: verificationResult.valid ? '#166534' : '#991B1B' }}>
                            {verificationResult.reason}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4">
        <div className="flex gap-1 p-2 rounded-3xl shadow-2xl"
          style={{ background: 'white', border: '1px solid #F0EDE8' }}>
          {tabConfig.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-2xl transition-all"
              style={{
                background: activeTab === tab.id ? 'linear-gradient(135deg, #FF6B35, #F59E0B)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#9CA3AF',
              }}>
              <tab.icon size={20} />
              <span className="text-[9px] font-black">{tab.label[language]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:hidden h-24" />
    </div>
  );
}