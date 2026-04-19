import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';

import { GenieIntro } from './components/GenieIntro';
import { LanguageSelect } from './components/LanguageSelect';
import { AuthScreen } from './components/AuthScreen';
import { QuestionnaireModal } from './components/QuestionnaireModal';
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

  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Skip the initial Genie intro (purple page)
  useEffect(() => {
    if (app.appStep === 'genie') {
      app.setAppStep('language');
    }
  }, [app.appStep, app]);

  // Trigger auth modal when accessing profile tab if not authenticated
  useEffect(() => {
    if (app.activeTab === 'profile' && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [app.activeTab, isAuthenticated]);

  // Clear chat when language changes
  useEffect(() => {
    if (chat && typeof chat.setMessages === 'function') {
      chat.setMessages([]);
    } else if (chat && typeof (chat as any).clearMessages === 'function') {
      (chat as any).clearMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.language]);

  if (app.appStep === 'genie') return null;
  if (app.appStep === 'language') return <LanguageSelect onSelect={(lang) => {
    app.setLanguage(lang);
    app.setAppStep('dashboard');
    setShowQuestionnaire(true);
  }} />;

  return (
    <div className="min-h-screen" style={{ background: '#FBF8F4', fontFamily: "'Inter', sans-serif" }}>

      <AnimatePresence>
        {showAuthModal && (
          <AuthScreen 
            language={app.language} 
            onLogin={(phone) => {
              app.setProfile({ ...app.profile, phone });
              setIsAuthenticated(true);
              setShowAuthModal(false);
            }} 
            onClose={() => {
              setShowAuthModal(false);
              // If they cancel out of auth, return them to the dashboard
              if (app.activeTab === 'profile') {
                app.setActiveTab('dashboard');
              }
            }} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQuestionnaire && (
          <QuestionnaireModal
            onComplete={(data) => {
              app.setProfile({ ...app.profile, ...data });
              setShowQuestionnaire(false);
              // Automatically trigger a scheme search to fetch matches 
              setTimeout(() => {
                if (app.handleSaveProfile) app.handleSaveProfile();
              }, 100);
            }}
            onClose={() => setShowQuestionnaire(false)}
          />
        )}
      </AnimatePresence>

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
                  setProfile={app.setProfile}
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