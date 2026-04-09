import React from 'react';
import { AnimatePresence } from 'motion/react';

import { GenieIntro } from './components/GenieIntro';
import { LanguageSelect } from './components/LanguageSelect';
import { ActionSelect } from './components/ActionSelect';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardTab } from './components/tabs/DashboardTab';
import { ChatTab } from './components/tabs/ChatTab';
import { ProfileTab } from './components/tabs/ProfileTab';
import { VerifyTab } from './components/tabs/VerifyTab';
import { NotificationPanel } from './components/NotificationPanel';

import { useAppState } from './hooks/useAppState';
import { useChat } from './hooks/useChat';

export default function App() {
  const app = useAppState();
  const chat = useChat(app.profile, app.language);

  if (app.appStep === 'genie') return <GenieIntro onComplete={() => app.setAppStep('language')} />;
  if (app.appStep === 'language') return <LanguageSelect onSelect={app.handleLanguageSelect} />;
  if (app.appStep === 'action') return <ActionSelect language={app.language} onSelect={app.handleActionSelect} />;

  return (
    <div className="min-h-screen" style={{ background: '#FBF8F4', fontFamily: "'Inter', sans-serif" }}>

      <Navbar
        language={app.language}
        setLanguage={app.setLanguage}
        profile={app.profile}
        unreadCount={app.unreadCount}
        showNotifications={app.showNotifications}
        setShowNotifications={app.setShowNotifications}
        setAppStep={app.setAppStep}
        renderNotificationPanel={
          <AnimatePresence>
            {app.showNotifications && (
              <NotificationPanel
                notifications={app.notifications}
                onClose={() => app.setShowNotifications(false)}
                onMarkRead={app.handleMarkRead}
                language={app.language}
              />
            )}
          </AnimatePresence>
        }
      />

      {app.showNotifications && (
        <div className="fixed inset-0 z-30" onClick={() => app.setShowNotifications(false)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">

          <Sidebar
            language={app.language}
            profile={app.profile}
            isSpeaking={chat.isSpeaking}
            isThinking={chat.isThinking}
            isRecording={chat.isRecording}
            notifications={app.notifications}
            unreadCount={app.unreadCount}
            setActiveTab={app.setActiveTab}
            setShowNotifications={app.setShowNotifications}
            handleMarkRead={app.handleMarkRead}
            onRestartIntro={() => { app.handleRestartIntro(); }}
          />

          <main className="flex-1 min-w-0">
            <BottomNav
              tabConfig={app.tabConfig}
              activeTab={app.activeTab}
              setActiveTab={app.setActiveTab}
              language={app.language}
              variant="top"
            />

            <AnimatePresence mode="wait">
              {app.activeTab === 'dashboard' && (
                <DashboardTab
                  key="dashboard"
                  language={app.language}
                  profile={app.profile}
                  schemes={app.schemes}
                  isLoadingSchemes={app.isLoadingSchemes}
                  unreadCount={app.unreadCount}
                  chat={chat}
                  setActiveTab={app.setActiveTab}
                />
              )}

              {app.activeTab === 'profile' && (
                <ProfileTab
                  key="profile"
                  language={app.language}
                  profile={app.profile}
                  setProfile={app.setProfile}
                  onSave={app.handleSaveProfile}
                  isSaving={app.isLoadingSchemes}
                />
              )}

              {app.activeTab === 'chat' && (
                <ChatTab
                  key="chat"
                  language={app.language}
                  profile={app.profile}
                  chat={chat}
                />
              )}

              {app.activeTab === 'verify' && (
                <VerifyTab
                  key="verify"
                  language={app.language}
                  profile={app.profile}
                  setActiveTab={app.setActiveTab}
                  isThinking={chat.isThinking}
                />
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      <BottomNav
        tabConfig={app.tabConfig}
        activeTab={app.activeTab}
        setActiveTab={app.setActiveTab}
        language={app.language}
        variant="mobile"
      />

      <div className="lg:hidden h-24" />
    </div>
  );
}