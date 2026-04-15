import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

import { Language, UserProfile } from '../../types';
import { verifyDocument } from '../../services/api';
import { speak } from '../../services/tts';
import { Tab } from '../../hooks/useAppState';

const SCHEME_OPTIONS = [
  'Post-Matric Scholarship',
  'PM-Kisan Samman Nidhi',
  'Ayushman Bharat PM-JAY',
  'PM Mudra Yojana',
  'PM Ujjwala Yojana',
];

interface VerifyTabProps {
  language: Language;
  profile: UserProfile;
  setActiveTab: (tab: Tab) => void;
  isThinking: boolean;
}

export const VerifyTab: React.FC<VerifyTabProps> = ({ language, profile, setActiveTab, isThinking: parentThinking }) => {
  const [selectedScheme, setSelectedScheme] = useState('Post-Matric Scholarship');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; reason: string } | null>(null);

  const handleVerify = async () => {
    if (!selectedScheme || profile.documents.length === 0) return;
    setIsVerifying(true);
    const docName = profile.documents[0] || 'Aadhaar Card';
    const res = await verifyDocument(docName, selectedScheme);
    setResult(res);
    setIsVerifying(false);
    speak(res.reason, language);
  };

  const isLoading = isVerifying || parentThinking;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="max-w-lg mx-auto space-y-5"
    >
      {/* Header */}
      <div
        className="rounded-3xl p-6"
        style={{ background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', border: '1px solid #6EE7B7' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'white' }}>
            🛡️
          </div>
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

      {/* Form card */}
      <div className="rounded-3xl p-6 space-y-5" style={{ background: 'white', border: '1px solid #F0EDE8' }}>

        {/* Scheme select */}
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
            {SCHEME_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Documents */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
            📄 {language === 'hi' ? 'आपके दस्तावेज़' : 'Your Documents'}
          </label>
          {profile.documents.length === 0 ? (
            <div className="p-6 rounded-2xl text-center border-2 border-dashed" style={{ borderColor: '#F0EDE8' }}>
              <p className="text-sm text-gray-400">
                {language === 'hi' ? 'प्रोफ़ाइल में दस्तावेज़ जोड़ें।' : 'Add documents in your Profile section.'}
              </p>
              <button
                onClick={() => setActiveTab('profile')}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                style={{ background: '#FFF7ED', color: '#D97706' }}
              >
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

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={isLoading || profile.documents.length === 0}
          className="w-full py-4 rounded-2xl font-black text-white text-base transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: isLoading ? '#9CA3AF' : 'linear-gradient(135deg, #059669, #10B981)', fontFamily: "'Baloo 2', cursive" }}
        >
          {isLoading ? (
            <>
              <motion.div
                className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
              {language === 'hi' ? 'जाँच हो रही है...' : 'Verifying...'}
            </>
          ) : (
            <><ShieldCheck size={20} /> {language === 'hi' ? 'सत्यापित करें' : 'Verify Now'}</>
          )}
        </button>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-5 rounded-2xl"
              style={{
                background: result.valid ? '#F0FDF4' : '#FEF2F2',
                border: `2px solid ${result.valid ? '#86EFAC' : '#FECACA'}`,
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{result.valid ? '✅' : '❌'}</span>
                <h4 className="font-black text-gray-900">
                  {result.valid
                    ? (language === 'hi' ? 'सत्यापन सफल!' : 'Verification Successful!')
                    : (language === 'hi' ? 'सत्यापन असफल' : 'Verification Failed')}
                </h4>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: result.valid ? '#166534' : '#991B1B' }}>
                {result.reason}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};