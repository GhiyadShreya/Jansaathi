import React from 'react';
import { motion } from 'motion/react';
import { Language, UserProfile } from '../../types';
import { ProfileForm } from '../ProfileForm';

interface ProfileTabProps {
  language: Language;
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  language, profile, setProfile, onSave, isSaving,
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
    className="max-w-2xl mx-auto"
  >
    <div
      className="rounded-3xl p-6 mb-5"
      style={{ background: 'linear-gradient(135deg, #FFF7ED, #FFF0E8)', border: '1px solid #FED7AA' }}
    >
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
        onSave={onSave}
        language={language}
        isSaving={isSaving}
      />
    </div>
  </motion.div>
);