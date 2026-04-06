import React from 'react';
import { motion } from 'motion/react';
import { UserProfile, STATES, Language } from '../types';
import { Upload, X, Save } from 'lucide-react';

interface ProfileFormProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  onSave: () => void;
  language: Language;
  isSaving?: boolean;
}

const LABELS: Record<Language, Record<string, string>> = {
  en: {
    title: 'Your Profile',
    subtitle: 'Help us find the right schemes for you',
    name: 'Full Name',
    age: 'Age',
    state: 'State',
    occupation: 'Occupation',
    income: 'Annual Income (₹)',
    category: 'Category',
    documents: 'Documents',
    save: 'Save & Find Schemes',
    saving: 'Finding Schemes...',
    namePh: 'Enter your name',
    agePh: 'e.g. 25',
    occupationPh: 'e.g. Farmer, Student',
    incomePh: 'e.g. 1,50,000',
    selectState: 'Select State',
    selectCategory: 'Select Category',
    uploadDoc: 'Upload Document',
    noDoc: 'No documents yet',
  },
  hi: {
    title: 'आपकी प्रोफ़ाइल',
    subtitle: 'हमें सही योजनाएं खोजने में मदद करें',
    name: 'पूरा नाम',
    age: 'आयु',
    state: 'राज्य',
    occupation: 'व्यवसाय',
    income: 'वार्षिक आय (₹)',
    category: 'श्रेणी',
    documents: 'दस्तावेज़',
    save: 'सेव करें और योजनाएं खोजें',
    saving: 'योजनाएं खोजी जा रही हैं...',
    namePh: 'अपना नाम दर्ज करें',
    agePh: 'जैसे 25',
    occupationPh: 'जैसे किसान, छात्र',
    incomePh: 'जैसे 1,50,000',
    selectState: 'राज्य चुनें',
    selectCategory: 'श्रेणी चुनें',
    uploadDoc: 'दस्तावेज़ अपलोड करें',
    noDoc: 'अभी कोई दस्तावेज़ नहीं',
  },
  pa: {
    title: 'ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ',
    subtitle: 'ਸਹੀ ਯੋਜਨਾਵਾਂ ਲੱਭਣ ਵਿੱਚ ਸਾਡੀ ਮਦਦ ਕਰੋ',
    name: 'ਪੂਰਾ ਨਾਮ',
    age: 'ਉਮਰ',
    state: 'ਰਾਜ',
    occupation: 'ਪੇਸ਼ਾ',
    income: 'ਸਾਲਾਨਾ ਆਮਦਨ (₹)',
    category: 'ਵਰਗ',
    documents: 'ਦਸਤਾਵੇਜ਼',
    save: 'ਸੇਵ ਕਰੋ ਅਤੇ ਯੋਜਨਾਵਾਂ ਲੱਭੋ',
    saving: 'ਯੋਜਨਾਵਾਂ ਲੱਭੀਆਂ ਜਾ ਰਹੀਆਂ ਹਨ...',
    namePh: 'ਆਪਣਾ ਨਾਮ ਦਰਜ ਕਰੋ',
    agePh: 'ਜਿਵੇਂ 25',
    occupationPh: 'ਜਿਵੇਂ ਕਿਸਾਨ, ਵਿਦਿਆਰਥੀ',
    incomePh: 'ਜਿਵੇਂ 1,50,000',
    selectState: 'ਰਾਜ ਚੁਣੋ',
    selectCategory: 'ਵਰਗ ਚੁਣੋ',
    uploadDoc: 'ਦਸਤਾਵੇਜ਼ ਅਪਲੋਡ ਕਰੋ',
    noDoc: 'ਅਜੇ ਕੋਈ ਦਸਤਾਵੇਜ਼ ਨਹੀਂ',
  },
  gu: {
    title: 'તમારી પ્રોફાઇલ',
    subtitle: 'સાચી યોજનાઓ શોધવામાં અમારી મદદ કરો',
    name: 'પૂरું नाम',
    age: 'ઉંમर',
    state: 'राज्य',
    occupation: 'व्यवसाय',
    income: 'वार्षिक आय (₹)',
    category: 'श्रेणी',
    documents: 'दस्तावेज',
    save: 'सेव करो अने योजना शोधो',
    saving: 'योजनाओ शोधाई रही छे...',
    namePh: 'तमारुं नाम लखो',
    agePh: 'जेवा के 25',
    occupationPh: 'जेवा के ખेडूत, विद्यार्थी',
    incomePh: 'जेवा के 1,50,000',
    selectState: 'राज्य पसंद करो',
    selectCategory: 'श्रेणी पसंद करो',
    uploadDoc: 'दस्तावेज अपलोड करो',
    noDoc: 'हजी कोई दस्तावेज नथी',
  },
};

const CATEGORIES: Record<Language, string[]> = {
  en: ['General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
  hi: ['सामान्य', 'OBC', 'SC', 'ST', 'अल्पसंख्यक', 'EWS'],
  pa: ['ਸਧਾਰਣ', 'OBC', 'SC', 'ST', 'ਘੱਟ ਗਿਣਤੀ', 'EWS'],
  gu: ['સામान્ય', 'OBC', 'SC', 'ST', 'લઘુમતી', 'EWS'],
};

export const ProfileForm: React.FC<ProfileFormProps> = ({ profile, setProfile, onSave, language, isSaving }) => {
  const L = LABELS[language];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const fileName = e.target.files[0].name;
      if (!profile.documents.includes(fileName)) {
        setProfile({ ...profile, documents: [...profile.documents, fileName] });
      }
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-sm font-medium bg-white/80";
  const labelClass = "block text-xs font-black uppercase tracking-wider text-gray-400 mb-1.5";

  const fieldVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06 } }),
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: 'name', label: L.name, type: 'text', placeholder: L.namePh, icon: '👤' },
          { name: 'age', label: L.age, type: 'number', placeholder: L.agePh, icon: '🎂' },
          { name: 'occupation', label: L.occupation, type: 'text', placeholder: L.occupationPh, icon: '💼' },
          { name: 'income', label: L.income, type: 'text', placeholder: L.incomePh, icon: '💰' },
        ].map((field, i) => (
          <motion.div key={field.name} custom={i} variants={fieldVariants} initial="hidden" animate="visible">
            <label className={labelClass}>{field.icon} {field.label}</label>
            <input
              name={field.name}
              type={field.type}
              value={(profile as any)[field.name]}
              onChange={handleChange}
              className={inputClass}
              placeholder={field.placeholder}
            />
          </motion.div>
        ))}

        <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
          <label className={labelClass}>🗺️ {L.state}</label>
          <select name="state" value={profile.state} onChange={handleChange} className={inputClass}>
            <option value="">{L.selectState}</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </motion.div>

        <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible">
          <label className={labelClass}>🏷️ {L.category}</label>
          <select name="category" value={profile.category} onChange={handleChange} className={inputClass}>
            <option value="">{L.selectCategory}</option>
            {CATEGORIES[language].map((c, i) => (
              <option key={i} value={CATEGORIES.en[i]}>{c}</option>
            ))}
          </select>
        </motion.div>
      </div>

      {/* Documents */}
      <motion.div custom={6} variants={fieldVariants} initial="hidden" animate="visible">
        <label className={labelClass}>📄 {L.documents}</label>
        <div className="flex flex-wrap gap-2 p-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 min-h-16">
          {profile.documents.length === 0 && (
            <p className="text-sm text-gray-400 self-center">{L.noDoc}</p>
          )}
          {profile.documents.map(doc => (
            <div key={doc} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ background: '#EDE9FE', color: '#6D28D9' }}>
              📎 {doc}
              <button onClick={() => setProfile({ ...profile, documents: profile.documents.filter(d => d !== doc) })}
                className="hover:text-red-500 transition-colors">
                <X size={12} />
              </button>
            </div>
          ))}
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all hover:scale-105"
            style={{ background: '#FFF7ED', color: '#D97706', border: '1px dashed #F59E0B' }}>
            <Upload size={14} />
            {L.uploadDoc}
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </motion.div>

      {/* Save button */}
      <motion.button
        onClick={onSave}
        disabled={isSaving}
        className="w-full py-4 rounded-2xl font-black text-white text-base transition-all flex items-center justify-center gap-3 shadow-lg relative overflow-hidden"
        style={{ background: isSaving ? '#9CA3AF' : 'linear-gradient(135deg, #FF6B35, #F59E0B)', fontFamily: "'Baloo 2', cursive" }}
        whileHover={{ scale: isSaving ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        custom={7} variants={fieldVariants} initial="hidden" animate="visible"
      >
        {isSaving ? (
          <>
            <motion.div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white"
              animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
            {L.saving}
          </>
        ) : (
          <>
            <Save size={20} />
            {L.save}
          </>
        )}
        {!isSaving && (
          <motion.div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity" />
        )}
      </motion.button>
    </div>
  );
};
