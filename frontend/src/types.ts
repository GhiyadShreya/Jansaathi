export interface UserProfile {
  gender: any;
  name: string;
  age: string;
  occupation: string;
  state: string;
  income: string;
  category: string;
  documents: string[];
}

export interface Scheme {
  id: string;
  title: string;
  description: string;
  eligibility: string;
  benefits: string;
  category: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'scheme' | 'reminder' | 'alert';
  timestamp: string;
  read: boolean;
}

export type Language = 'en' | 'hi' | 'pa' | 'gu';

export type AppStep = 'genie' | 'language' | 'action' | 'dashboard';

export const LANGUAGES: Record<Language, { name: string; native: string; ttsLang: string; greeting: string; tagline: string }> = {
  en: { name: 'English', native: 'English', ttsLang: 'en-IN', greeting: 'Hello! How can I help you today?', tagline: 'Your Government Companion' },
  hi: { name: 'Hindi', native: 'हिंदी', ttsLang: 'hi-IN', greeting: 'नमस्ते! मैं आपकी कैसे मदद कर सकती हूँ?', tagline: 'आपका सरकारी साथी' },
  pa: { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', ttsLang: 'pa-IN', greeting: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦੀ ਹਾਂ?', tagline: 'ਤੁਹਾਡਾ ਸਰਕਾਰੀ ਸਾਥੀ' },
  gu: { name: 'Gujarati', native: 'ગુજરાતી', ttsLang: 'gu-IN', greeting: 'નમસ્તે! હું આજે તમારી કેવી રીતે મદદ કરી શકું?', tagline: 'તમારો સરકારી સાથી' },
};

export const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Chandigarh", "Puducherry"
];

export const DEMO_SCHEMES: Scheme[] = [
  {
    id: "pmkisan",
    title: "PM-Kisan Samman Nidhi",
    description: "Direct income support of ₹6,000/year to small and marginal farmers.",
    eligibility: "Farmers with less than 2 hectares land",
    benefits: "₹6,000/year in 3 installments",
    category: "Agriculture"
  },
  {
    id: "ayushman",
    title: "Ayushman Bharat PM-JAY",
    description: "Health coverage of ₹5 lakh per family per year for secondary and tertiary care.",
    eligibility: "BPL families as per SECC data",
    benefits: "₹5 lakh health cover",
    category: "Health"
  },
  {
    id: "scholarship",
    title: "Post-Matric Scholarship (SC/ST/OBC)",
    description: "Financial assistance for students from reserved categories studying at post-matric level.",
    eligibility: "SC/ST/OBC students, income below ₹2.5L",
    benefits: "Tuition + maintenance allowance",
    category: "Education"
  },
  {
    id: "ujjwala",
    title: "PM Ujjwala Yojana",
    description: "Free LPG connection to women from BPL households.",
    eligibility: "BPL women, no existing LPG",
    benefits: "Free LPG connection + cylinder",
    category: "Energy"
  },
  {
    id: "mudra",
    title: "PM Mudra Yojana",
    description: "Collateral-free loans up to ₹10 lakh for micro and small enterprises.",
    eligibility: "Small business owners, entrepreneurs",
    benefits: "Loans ₹50K – ₹10L",
    category: "Business"
  }
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "PM-Kisan Installment Released!",
    body: "The 16th installment of PM-Kisan has been released. Check your bank account.",
    type: "scheme",
    timestamp: "2 hours ago",
    read: false
  },
  {
    id: "n2",
    title: "New Scholarship for Students",
    body: "Post-Matric scholarship applications open for 2024-25. Apply before March 31.",
    type: "reminder",
    timestamp: "1 day ago",
    read: false
  },
  {
    id: "n3",
    title: "Ayushman Card Drive",
    body: "Free Ayushman Bharat card registration camp in your area this weekend.",
    type: "alert",
    timestamp: "2 days ago",
    read: true
  },
  {
    id: "n4",
    title: "Ration Card Update Reminder",
    body: "Update your ration card details before end of month to avoid disruption.",
    type: "reminder",
    timestamp: "3 days ago",
    read: true
  }
];
