import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  User,
} from 'lucide-react';

import { AppStep, Language, Notification, Scheme, UserProfile } from '../types';
import { getMatchedSchemes } from '../services/api';
import { speak, speakWelcome, stopSpeaking } from '../services/tts';
import { createEmptyProfile, storage } from '../services/storage';

export type Tab = 'dashboard' | 'profile' | 'chat' | 'verify';

interface SaveProfileOptions {
  useWelcomeGreeting?: boolean;
}

export function useAppState() {
  const [appStep, setAppStep] = useState<AppStep>('genie');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [language, setLanguageState] = useState<Language>('en');
  const [profile, setProfile] = useState<UserProfile>(createEmptyProfile());
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(storage.getNotifications());
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    storage.saveProfile(profile);
  }, [profile]);

  const startFreshSession = (lang: Language) => {
    stopSpeaking();
    setLanguageState(lang);
    setProfile(createEmptyProfile());
    setSchemes([]);
    setActiveTab('dashboard');
    setShowNotifications(false);
    storage.clearProfile();
    storage.clearChatHistory();
    setAppStep('dashboard');
  };

  const handleActionSelect = (action: 'profile' | 'chat' | 'dashboard') => {
    setActiveTab(action === 'dashboard' ? 'dashboard' : action);
    setAppStep('dashboard');
  };

  const handleLanguageChange = async (nextLanguage: Language) => {
    if (nextLanguage === language) return;

    stopSpeaking();
    setLanguageState(nextLanguage);

    const hasProfileData = Boolean(
      profile.name ||
      profile.age ||
      profile.occupation ||
      profile.state ||
      profile.income ||
      profile.category ||
      profile.documents.length
    );

    if (!hasProfileData) {
      setSchemes([]);
      return;
    }

    setIsLoadingSchemes(true);
    try {
      const matched = await getMatchedSchemes(profile, nextLanguage);
      setSchemes(matched);
    } finally {
      setIsLoadingSchemes(false);
    }
  };

  const handleSaveProfile = async (options?: SaveProfileOptions) => {
    setIsLoadingSchemes(true);
    setActiveTab('dashboard');

    const matched = await getMatchedSchemes(profile, language);
    setSchemes(matched);
    setIsLoadingSchemes(false);

    if (options?.useWelcomeGreeting) {
      speakWelcome(language);
      return;
    }

    const msg = language === 'hi'
      ? `${profile.name || 'आपके'} के लिए ${matched.length} योजनाएँ मिली हैं!`
      : language === 'pa'
      ? `${profile.name || 'ਤੁਹਾਡੇ'} ਲਈ ${matched.length} ਯੋਜਨਾਵਾਂ ਮਿਲ ਗਈਆਂ!`
      : language === 'gu'
      ? `${profile.name || 'તમારા'} માટે ${matched.length} યોજનાઓ મળી છે!`
      : `Found ${matched.length} schemes for ${profile.name || 'you'}!`;

    speak(msg, language);
  };

  const handleMarkRead = (id: string) => {
    const updated = notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updated);
    storage.saveNotifications(updated);
  };

  const handleRestartIntro = () => {
    stopSpeaking();
    setAppStep('genie');
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const tabConfig = [
    { id: 'dashboard' as Tab, icon: LayoutDashboard, label: { en: 'Home', hi: 'होम', pa: 'ਹੋਮ', gu: 'હોમ' } },
    { id: 'profile' as Tab, icon: User, label: { en: 'Profile', hi: 'प्रोफ़ाइल', pa: 'ਪ੍ਰੋਫਾਈਲ', gu: 'પ્રોફાઇલ' } },
    { id: 'chat' as Tab, icon: MessageSquare, label: { en: 'Ask', hi: 'पूछें', pa: 'ਪੁੱਛੋ', gu: 'પૂછો' } },
    { id: 'verify' as Tab, icon: ShieldCheck, label: { en: 'Verify', hi: 'सत्यापित', pa: 'ਤਸਦੀਕ', gu: 'ચકાસો' } },
  ];

  return {
    appStep,
    setAppStep,
    activeTab,
    setActiveTab,
    language,
    setLanguage: handleLanguageChange,
    profile,
    setProfile,
    schemes,
    isLoadingSchemes,
    notifications,
    showNotifications,
    setShowNotifications,
    unreadCount,
    tabConfig,
    startFreshSession,
    handleActionSelect,
    handleSaveProfile,
    handleMarkRead,
    handleRestartIntro,
  };
}
