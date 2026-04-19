import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Scheme, Language, UserProfile } from '../types';
import { ExternalLink, CheckCircle2, ChevronDown } from 'lucide-react';
import { DocumentChecklist } from './DocumentChecklist';

interface SchemeListProps {
  schemes: Scheme[];
  isLoading: boolean;
  language: Language;
  profile: UserProfile;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  Agriculture: { bg: '#D1FAE5', text: '#065F46', icon: '🌾' },
  Health: { bg: '#FCE7F3', text: '#9D174D', icon: '🏥' },
  Education: { bg: '#DBEAFE', text: '#1E40AF', icon: '📚' },
  Energy: { bg: '#FEF3C7', text: '#92400E', icon: '⚡' },
  Business: { bg: '#EDE9FE', text: '#4C1D95', icon: '💼' },
  Housing: { bg: '#FEE2E2', text: '#991B1B', icon: '🏠' },
  Women: { bg: '#FCE7F3', text: '#831843', icon: '👩' },
  Default: { bg: '#F3F4F6', text: '#374151', icon: '📋' },
};

const HINDI_CATEGORY_TO_ENGLISH: Record<string, keyof typeof CATEGORY_COLORS> = {
  कृषि: 'Agriculture',
  स्वास्थ्य: 'Health',
  शिक्षा: 'Education',
  ऊर्जा: 'Energy',
  व्यवसाय: 'Business',
  आवास: 'Housing',
  महिला: 'Women',
};

const CATEGORY_LABELS: Record<string, string> = {
  Agriculture: 'कृषि',
  Health: 'स्वास्थ्य',
  Education: 'शिक्षा',
  Energy: 'ऊर्जा',
  Business: 'व्यवसाय',
  Housing: 'आवास',
  Women: 'महिला',
  Default: 'योजना',
};

const HINDI_SCHEME_COPY: Record<string, Partial<Scheme>> = {
  pmkisan: {
    title: 'पीएम-किसान सम्मान निधि',
    description: 'छोटे और सीमांत किसानों को प्रतिवर्ष ₹6,000 की प्रत्यक्ष आय सहायता।',
    eligibility: '2 हेक्टेयर से कम भूमि वाले किसान',
    benefits: '3 किस्तों में ₹6,000 प्रति वर्ष',
    category: 'कृषि',
  },
  ayushman: {
    title: 'आयुष्मान भारत पीएम-जय',
    description: 'प्रति परिवार प्रति वर्ष ₹5 लाख तक का स्वास्थ्य बीमा कवर।',
    eligibility: 'SECC डेटा के अनुसार बीपीएल परिवार',
    benefits: '₹5 लाख तक स्वास्थ्य कवर',
    category: 'स्वास्थ्य',
  },
  scholarship: {
    title: 'पोस्ट-मैट्रिक छात्रवृत्ति',
    description: 'आरक्षित वर्गों के छात्रों के लिए उच्च कक्षाओं की पढ़ाई हेतु वित्तीय सहायता।',
    eligibility: 'SC/ST/OBC छात्र, आय ₹2.5 लाख से कम',
    benefits: 'ट्यूशन फीस और रखरखाव भत्ता',
    category: 'शिक्षा',
  },
  ujjwala: {
    title: 'पीएम उज्ज्वला योजना',
    description: 'बीपीएल परिवारों की महिलाओं को निःशुल्क एलपीजी कनेक्शन।',
    eligibility: 'बीपीएल महिला, पहले से एलपीजी कनेक्शन न हो',
    benefits: 'मुफ्त एलपीजी कनेक्शन और सिलेंडर सहायता',
    category: 'ऊर्जा',
  },
  mudra: {
    title: 'पीएम मुद्रा योजना',
    description: 'सूक्ष्म और छोटे उद्यमों के लिए ₹10 लाख तक बिना गारंटी ऋण।',
    eligibility: 'छोटे व्यवसायी और उद्यमी',
    benefits: '₹50 हजार से ₹10 लाख तक ऋण',
    category: 'व्यवसाय',
  },
};

function getDisplayScheme(scheme: Scheme, language: Language): Scheme {
  if (language !== 'hi') return scheme;

  const localized = HINDI_SCHEME_COPY[scheme.id];
  const category = localized?.category || CATEGORY_LABELS[scheme.category] || scheme.category;

  return {
    ...scheme,
    ...localized,
    category,
  };
}

function getColorKey(category: string): keyof typeof CATEGORY_COLORS {
  return HINDI_CATEGORY_TO_ENGLISH[category] || (CATEGORY_COLORS[category] ? category as keyof typeof CATEGORY_COLORS : 'Default');
}

export const SchemeList: React.FC<SchemeListProps> = ({ schemes, isLoading, language, profile }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl overflow-hidden">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-full" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3 mt-1" />
          </div>
        ))}
      </div>
    );
  }

  if (schemes.length === 0) {
    return (
      <div className="text-center py-12 rounded-3xl border-2 border-dashed border-orange-200 bg-orange-50/30">
        <div className="text-4xl mb-3">🔍</div>
        <p className="font-bold text-gray-500 text-sm">
          {language === 'hi'
            ? 'प्रोफ़ाइल पूरा करें - योजनाएं मिलेंगी!'
            : language === 'pa'
            ? 'ਪ੍ਰੋਫਾਈਲ ਭਰੋ - ਯੋਜਨਾਵਾਂ ਮਿਲਣਗੀਆਂ!'
            : language === 'gu'
            ? 'પ્રોફાઇલ ભરો - યોજનાઓ મળશે!'
            : 'Complete your profile to see matching schemes!'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {schemes.map((scheme, i) => {
        const displayScheme = getDisplayScheme(scheme, language);
        const colors = CATEGORY_COLORS[getColorKey(displayScheme.category)];
        const isOpen = expanded === scheme.id;

        return (
          <motion.div
            key={scheme.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl overflow-hidden border transition-all"
            style={{ borderColor: isOpen ? '#F59E0B' : '#F3F4F6', background: 'white' }}
          >
            <button
              className="w-full p-4 text-left flex items-start gap-3"
              onClick={() => setExpanded(isOpen ? null : scheme.id)}
            >
              <span className="text-2xl mt-0.5">{colors.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{displayScheme.title}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {displayScheme.category}
                    </span>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={14} className="text-gray-400" />
                    </motion.div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{displayScheme.description}</p>
              </div>
            </button>

            <motion.div
              initial={false}
              animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
                <div className="flex items-start gap-2 pt-3">
                  <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      {language === 'hi' ? 'लाभ' : 'Benefits'}
                    </p>
                    <p className="text-sm font-semibold text-gray-700">{displayScheme.benefits}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm mt-0.5">✅</span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      {language === 'hi' ? 'पात्रता' : 'Eligibility'}
                    </p>
                    <p className="text-sm text-gray-600">{displayScheme.eligibility}</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <DocumentChecklist
                    requiredDocs={scheme.required_documents || []}
                    userDocs={profile?.documents || []}
                    language={language}
                  />
                </div>

                <button
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
                  style={{ background: '#FFF7ED', color: '#D97706' }}
                >
                  <ExternalLink size={12} />
                  {language === 'hi' ? 'विवरण देखें और आवेदन करें' : 'View Details & Apply'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};
