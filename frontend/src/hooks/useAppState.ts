import { useState, useEffect } from 'react';
import {
  MessageSquare, User, Bell, ShieldCheck, LayoutDashboard,
} from 'lucide-react';

import { UserProfile, Scheme, Language, AppStep, Notification, LANGUAGES, DEMO_SCHEMES } from '../types';
import { getMatchedSchemes } from '../services/api';
import { speak, stopSpeaking } from '../services/tts';
import { storage } from '../services/storage';

export type Tab = 'dashboard' | 'profile' | 'chat' | 'verify';

export function useAppState() {
  const [appStep, setAppStep] = useState<AppStep>('genie');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [profile, setProfile] = useState<UserProfile>(storage.getProfile());
  const [schemes, setSchemes] = useState<Scheme[]>(DEMO_SCHEMES.slice(0, 3));
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(storage.getNotifications());
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);

  // Persist profile and notifications
  useEffect(() => { storage.saveProfile(profile); }, [profile]);

  // Greet on dashboard arrival
  useEffect(() => {
    if (appStep === 'dashboard' && !hasGreeted) {
      setHasGreeted(true);
      setTimeout(() => speak(LANGUAGES[language].greeting, language), 600);
    }
  }, [appStep, language, hasGreeted]);

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

  const handleMarkRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    storage.saveNotifications(updated);
  };

  const handleRestartIntro = () => {
    stopSpeaking();
    setAppStep('genie');
    setHasGreeted(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const tabConfig = [
    { id: 'dashboard' as Tab, icon: LayoutDashboard, label: { en: 'Home', hi: 'होम', pa: 'ਹੋਮ', gu: 'હોમ' } },
    { id: 'profile' as Tab, icon: User, label: { en: 'Profile', hi: 'प्रोफाइल', pa: 'ਪ੍ਰੋਫਾਈਲ', gu: 'પ્રોファઇल' } },
    { id: 'chat' as Tab, icon: MessageSquare, label: { en: 'Ask', hi: 'पूछें', pa: 'ਪੁੱਛੋ', gu: 'પૂछो' } },
    { id: 'verify' as Tab, icon: ShieldCheck, label: { en: 'Verify', hi: 'सत्यापित', pa: 'ਤਸਦੀਕ', gu: 'VerIfy' } },
  ];

  return {
    appStep, setAppStep,
    activeTab, setActiveTab,
    language, setLanguage,
    profile, setProfile,
    schemes,
    isLoadingSchemes,
    notifications,
    showNotifications, setShowNotifications,
    unreadCount,
    tabConfig,
    handleLanguageSelect,
    handleActionSelect,
    handleSaveProfile,
    handleMarkRead,
    handleRestartIntro,
  };
}