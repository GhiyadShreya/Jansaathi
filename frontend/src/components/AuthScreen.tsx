import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowRight, X } from 'lucide-react';
import { Language } from '../types';

interface AuthScreenProps {
  language: Language;
  onLogin: (phone: string) => void;
  onClose?: () => void;
}

const LABELS: Record<Language, { title: string; subtitle: string; phoneLabel: string; phonePh: string; continue: string; invalidPhone: string }> = {
  en: {
    title: 'Citizen Login',
    subtitle: 'Continue with your mobile number',
    phoneLabel: 'Mobile Number',
    phonePh: 'Enter 10-digit number',
    continue: 'Continue to Dashboard',
    invalidPhone: 'Please enter a valid 10-digit mobile number.',
  },
  hi: {
    title: 'नागरिक लॉगिन',
    subtitle: 'अपने मोबाइल नंबर से आगे बढ़ें',
    phoneLabel: 'मोबाइल नंबर',
    phonePh: '10 अंकों का नंबर दर्ज करें',
    continue: 'डैशबोर्ड पर जाएं',
    invalidPhone: 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें।',
  },
  pa: {
    title: 'ਨਾਗਰਿਕ ਲਾਗਇਨ',
    subtitle: 'ਆਪਣੇ ਮੋਬਾਈਲ ਨੰਬਰ ਨਾਲ ਅੱਗੇ ਵਧੋ',
    phoneLabel: 'ਮੋਬਾਈਲ ਨੰਬਰ',
    phonePh: '10 ਅੰਕਾਂ ਵਾਲਾ ਨੰਬਰ ਦਰਜ ਕਰੋ',
    continue: 'ਡੈਸ਼ਬੋਰਡ ਤੇ ਜਾਓ',
    invalidPhone: 'ਕਿਰਪਾ ਕਰਕੇ 10 ਅੰਕਾਂ ਵਾਲਾ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ।',
  },
  gu: {
    title: 'નાગરિક લોગિન',
    subtitle: 'તમારા મોબાઇલ નંબરથી આગળ વધો',
    phoneLabel: 'મોબાઇલ નંબર',
    phonePh: '10 અંકનો નંબર દાખલ કરો',
    continue: 'ડેશબોર્ડ પર જાઓ',
    invalidPhone: 'કૃપા કરીને 10 અંકનો મોબાઇલ નંબર દાખલ કરો.',
  },
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ language, onLogin, onClose }) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const L = LABELS[language] || LABELS.en;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();

    if (phone.length < 10) {
      setError(L.invalidPhone);
      return;
    }

    onLogin(phone);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FFF9F0 0%, #FFF0E8 40%, #F0F4FF 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute top-0 left-0 right-0 h-2 flex z-10">
        {['#FF9933', '#FFFFFF', '#138808'].map((c, i) => (
          <div key={i} className="flex-1" style={{ background: c }} />
        ))}
      </div>

      <motion.div
        className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden relative z-20"
        initial={{ y: 20, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-colors text-white z-30"
          >
            <X size={20} />
          </button>
        )}

        <div className="p-8 text-center" style={{ background: 'linear-gradient(135deg, #FF6B35, #F59E0B)' }}>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg">
              <ShieldCheck size={32} className="text-orange-500" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Baloo 2', cursive" }}>
            {L.title}
          </h2>
          <p className="text-orange-100 text-sm mt-1">{L.subtitle}</p>
        </div>

        <div className="p-8">
          <motion.form onSubmit={handleContinue} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
              📱 {L.phoneLabel}
            </label>
            <div className="flex relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold border-r pr-3 border-gray-200">+91</span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                placeholder={L.phonePh}
                className="w-full pl-16 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-base font-bold bg-white/80"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-2 text-center font-bold">{error}</p>}
            <button
              type="submit"
              disabled={phone.length < 10}
              className="w-full mt-6 py-4 rounded-2xl font-black text-white text-base transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #1A1A2E, #2D1458)', fontFamily: "'Baloo 2', cursive" }}
            >
              {L.continue} <ArrowRight size={18} />
            </button>
          </motion.form>
        </div>
      </motion.div>
    </motion.div>
  );
};
