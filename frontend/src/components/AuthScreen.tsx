import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { sendOtp, verifyOtp } from '../services/api';

interface AuthScreenProps {
  language: Language;
  onLogin: (phone: string) => void;
}

const LABELS: Record<Language, any> = {
  en: {
    title: 'Citizen Login',
    subtitle: 'Secure access via Mobile & Aadhaar',
    phoneLabel: 'Mobile Number',
    phonePh: 'Enter 10-digit number',
    otpLabel: 'Enter OTP',
    otpPh: 'Enter OTP',
    sendOtp: 'Send OTP',
    verify: 'Verify & Login',
    mockHint: 'Demo: Use any number and OTP 1234',
    invalidOtp: 'Invalid OTP. Please use 1234.',
    editNumber: 'Edit Number'
  },
  hi: {
    title: 'नागरिक लॉगिन',
    subtitle: 'मोबाइल और आधार द्वारा सुरक्षित लॉगिन',
    phoneLabel: 'मोबाइल नंबर',
    phonePh: '10-अंकीय नंबर दर्ज करें',
    otpLabel: 'OTP दर्ज करें',
    otpPh: 'OTP दर्ज करें',
    sendOtp: 'OTP भेजें',
    verify: 'सत्यापित करें और लॉगिन करें',
    mockHint: 'डेमो: कोई भी नंबर और OTP 1234 का उपयोग करें',
    invalidOtp: 'अमान्य OTP। कृपया 1234 का उपयोग करें।',
    editNumber: 'नंबर बदलें'
  },
  pa: {
    title: 'ਨਾਗਰਿਕ ਲੌਗਇਨ',
    subtitle: 'ਮੋਬਾਈਲ ਅਤੇ ਆਧਾਰ ਰਾਹੀਂ ਸੁਰੱਖਿਅਤ ਲੌਗਇਨ',
    phoneLabel: 'ਮੋਬਾਈਲ ਨੰਬਰ',
    phonePh: '10-ਅੰਕਾਂ ਵਾਲਾ ਨੰਬਰ ਦਰਜ ਕਰੋ',
    otpLabel: 'OTP ਦਰਜ ਕਰੋ',
    otpPh: 'OTP ਦਰਜ ਕਰੋ',
    sendOtp: 'OTP ਭੇਜੋ',
    verify: 'ਤਸਦੀਕ ਕਰੋ ਅਤੇ ਲੌਗਇਨ ਕਰੋ',
    mockHint: 'ਡੈਮੋ: ਕੋਈ ਵੀ ਨੰਬਰ ਅਤੇ OTP 1234 ਵਰਤੋ',
    invalidOtp: 'ਅਵੈਧ OTP। ਕਿਰਪਾ ਕਰਕੇ 1234 ਵਰਤੋ।',
    editNumber: 'ਨੰਬਰ ਬਦਲੋ'
  },
  gu: {
    title: 'નાગરિક લોગિન',
    subtitle: 'મોબાઇલ અને આધાર દ્વારા સુરક્ષિત ઍક્સેસ',
    phoneLabel: 'મોબાઇલ નંબર',
    phonePh: '10-આંકડાનો નંબર દાખલ કરો',
    otpLabel: 'OTP દાખલ કરો',
    otpPh: 'OTP દાખલ કરો',
    sendOtp: 'OTP મોકલો',
    verify: 'ચકાસો અને લોગિન કરો',
    mockHint: 'ડેમો: કોઈપણ નંબર અને OTP 1234 નો ઉપયોગ કરો',
    invalidOtp: 'અમાન્ય OTP. કૃપા કરીને 1234 નો ઉપયોગ કરો.',
    editNumber: 'નંબર બદલો'
  }
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ language, onLogin }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const L = LABELS[language] || LABELS.en;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setIsLoading(true);
      setError('');
      const res = await sendOtp(phone);
      setIsLoading(false);
      if (res.success) {
        setStep('otp');
      } else {
        setError(res.message);
      }
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await verifyOtp(phone, otp);
    setIsLoading(false);
    if (res.success) onLogin(phone);
    else setError(res.message);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FFF9F0 0%, #FFF0E8 40%, #F0F4FF 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Top flag decoration */}
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

          {step === 'phone' ? (
            <motion.form onSubmit={handleSendOtp} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                📱 {L.phoneLabel}
              </label>
              <div className="flex relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold border-r pr-3 border-gray-200">+91</span>
                <input type="tel" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder={L.phonePh} className="w-full pl-16 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-base font-bold bg-white/80" autoFocus />
              </div>
              {error && <p className="text-red-500 text-xs mt-2 text-center font-bold">{error}</p>}
              <button type="submit" disabled={phone.length < 10 || isLoading} className="w-full mt-6 py-4 rounded-2xl font-black text-white text-base transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'linear-gradient(135deg, #1A1A2E, #2D1458)', fontFamily: "'Baloo 2', cursive" }}>
                {isLoading ? <motion.div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} /> : <>{L.sendOtp} <ArrowRight size={18} /></>}
              </button>
            </motion.form>
          ) : (
            <motion.form onSubmit={handleVerify} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <label className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                <span>🔐 {L.otpLabel}</span>
                <button type="button" onClick={() => { setStep('phone'); setOtp(''); }} className="text-orange-500 normal-case hover:underline">{L.editNumber}</button>
              </label>
              <input type="text" maxLength={8} value={otp} onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }} placeholder={L.otpPh} className={`w-full text-center tracking-[0.5em] py-4 rounded-2xl border-2 ${error ? 'border-red-400 focus:ring-red-100' : 'border-gray-100 focus:border-orange-400 focus:ring-orange-100'} focus:ring-4 outline-none transition-all text-xl font-black bg-white/80`} autoFocus />
              {error && <p className="text-red-500 text-xs mt-2 text-center font-bold">{error}</p>}
              
              <button type="submit" disabled={otp.length < 4 || isLoading} className="w-full mt-6 py-4 rounded-2xl font-black text-white text-base transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'linear-gradient(135deg, #059669, #10B981)', fontFamily: "'Baloo 2', cursive" }}>
                {isLoading ? <motion.div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} /> : <><CheckCircle2 size={20} /> {L.verify}</>}
              </button>
            </motion.form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};