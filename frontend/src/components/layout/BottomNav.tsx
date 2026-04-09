import React from 'react';
import { Language } from '../../types';
import { Tab } from '../../hooks/useAppState';

interface TabItem {
  id: Tab;
  icon: React.ElementType;
  label: Record<Language, string>;
}

interface BottomNavProps {
  tabConfig: TabItem[];
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  language: Language;
  /** 'top' = tab bar inside main content area; 'mobile' = fixed bottom bar */
  variant: 'top' | 'mobile';
}

export const BottomNav: React.FC<BottomNavProps> = ({
  tabConfig, activeTab, setActiveTab, language, variant,
}) => {
  if (variant === 'top') {
    return (
      <div
        className="flex gap-1.5 p-1.5 rounded-3xl mb-6 overflow-x-auto no-scrollbar"
        style={{ background: 'white', border: '1px solid #F0EDE8' }}
      >
        {tabConfig.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-sm font-black transition-all whitespace-nowrap flex-1 justify-center"
            style={{
              background: activeTab === tab.id ? 'linear-gradient(135deg, #FF6B35, #F59E0B)' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#9CA3AF',
              boxShadow: activeTab === tab.id ? '0 4px 15px rgba(255,107,53,0.3)' : 'none',
            }}
          >
            <tab.icon size={16} />
            <span className="hidden sm:inline">{tab.label[language]}</span>
          </button>
        ))}
      </div>
    );
  }

  // Mobile fixed bottom nav
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4">
      <div
        className="flex gap-1 p-2 rounded-3xl shadow-2xl"
        style={{ background: 'white', border: '1px solid #F0EDE8' }}
      >
        {tabConfig.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-2xl transition-all"
            style={{
              background: activeTab === tab.id ? 'linear-gradient(135deg, #FF6B35, #F59E0B)' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#9CA3AF',
            }}
          >
            <tab.icon size={20} />
            <span className="text-[9px] font-black">{tab.label[language]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};