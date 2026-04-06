import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Notification, Language } from '../types';

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  language: Language;
}

const TYPE_CONFIG = {
  scheme: { icon: '🏛️', color: '#7C3AED', bg: '#F5F3FF' },
  reminder: { icon: '⏰', color: '#D97706', bg: '#FFFBEB' },
  alert: { icon: '🔔', color: '#DC2626', bg: '#FEF2F2' },
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications, onClose, onMarkRead, language
}) => {
  const unread = notifications.filter(n => !n.read).length;

  const titles: Record<Language, string> = {
    en: 'Notifications',
    hi: 'सूचनाएं',
    pa: 'ਸੂਚਨਾਵਾਂ',
    gu: 'સૂचनाओ',
  };

  const markAllLabels: Record<Language, string> = {
    en: 'Mark all read',
    hi: 'सभी पढ़ा',
    pa: 'ਸਭ ਪੜ੍ਹਿਆ',
    gu: 'બધા વਾਂਚ્યा',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20 }}
      className="absolute right-0 top-full mt-2 w-80 rounded-3xl shadow-2xl overflow-hidden z-50"
      style={{ background: 'white', border: '1px solid #F3F4F6' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50"
        style={{ background: 'linear-gradient(135deg, #FFF7ED, #FFFBEB)' }}>
        <div className="flex items-center gap-2">
          <Bell size={18} style={{ color: '#D97706' }} />
          <span className="font-black text-gray-900">{titles[language]}</span>
          {unread > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black text-white"
              style={{ background: '#EF4444' }}>
              {unread}
            </span>
          )}
        </div>
        <button onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
          <X size={14} className="text-gray-400" />
        </button>
      </div>

      {/* Notification list */}
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {notifications.map((n, i) => {
            const cfg = TYPE_CONFIG[n.type];
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex gap-3 p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50 ${!n.read ? 'bg-orange-50/30' : ''}`}
                onClick={() => onMarkRead(n.id)}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-lg"
                  style={{ background: cfg.bg }}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-bold leading-tight ${n.read ? 'text-gray-500' : 'text-gray-900'}`}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: '#EF4444' }} />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{n.body}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-gray-400">
                    <Clock size={10} />
                    {n.timestamp}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {notifications.length === 0 && (
          <div className="py-12 text-center">
            <CheckCircle2 size={32} className="mx-auto mb-2 text-green-400" />
            <p className="text-sm text-gray-400">All caught up!</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {unread > 0 && (
        <div className="p-3 border-t border-gray-50">
          <button
            onClick={() => notifications.forEach(n => onMarkRead(n.id))}
            className="w-full py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
            style={{ background: '#FFF7ED', color: '#D97706' }}
          >
            {markAllLabels[language]}
          </button>
        </div>
      )}
    </motion.div>
  );
};
