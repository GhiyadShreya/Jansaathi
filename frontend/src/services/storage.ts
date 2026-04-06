import { UserProfile, Notification, DEMO_NOTIFICATIONS } from '../types';

const KEYS = {
  PROFILE: 'jansaathi_profile',
  NOTIFICATIONS: 'jansaathi_notifications',
  LANGUAGE: 'jansaathi_language',
  CHAT_HISTORY: 'jansaathi_chat',
  ONBOARDED: 'jansaathi_onboarded',
};

export const storage = {
  getProfile(): UserProfile {
    try {
      const raw = localStorage.getItem(KEYS.PROFILE);
      return raw ? JSON.parse(raw) : {
        name: '', age: '', occupation: '', state: '', income: '', category: '', documents: [],
        gender: undefined
      };
    } catch { return { name: '', age: '', occupation: '', state: '', income: '', category: '', documents: [] , gender: undefined}; }
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  getNotifications(): Notification[] {
    try {
      const raw = localStorage.getItem(KEYS.NOTIFICATIONS);
      return raw ? JSON.parse(raw) : DEMO_NOTIFICATIONS;
    } catch { return DEMO_NOTIFICATIONS; }
  },

  saveNotifications(notifications: Notification[]): void {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  markNotificationRead(id: string): void {
    const notifications = storage.getNotifications();
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    storage.saveNotifications(updated);
  },

  getChatHistory(): { role: 'user' | 'ai'; text: string }[] {
    try {
      const raw = localStorage.getItem(KEYS.CHAT_HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },

  saveChatHistory(history: { role: 'user' | 'ai'; text: string }[]): void {
    // Keep last 50 messages
    localStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(history.slice(-50)));
  },

  isOnboarded(): boolean {
    return localStorage.getItem(KEYS.ONBOARDED) === 'true';
  },

  setOnboarded(): void {
    localStorage.setItem(KEYS.ONBOARDED, 'true');
  },

  clearAll(): void {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }
};
