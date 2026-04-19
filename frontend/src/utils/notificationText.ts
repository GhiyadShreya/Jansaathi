import { Language, Notification } from '../types';

const NOTIFICATION_COPY: Record<string, Record<Language, { title: string; body: string; timestamp: string }>> = {
  n1: {
    en: {
      title: 'PM-Kisan Installment Released!',
      body: 'The 16th installment of PM-Kisan has been released. Check your bank account.',
      timestamp: '2 hours ago',
    },
    hi: {
      title: 'पीएम-किसान की किस्त जारी हुई!',
      body: 'पीएम-किसान की 16वीं किस्त जारी हो गई है। अपना बैंक खाता जांचें।',
      timestamp: '2 घंटे पहले',
    },
    pa: {
      title: 'ਪੀਐਮ-ਕਿਸਾਨ ਦੀ ਕਿਸ਼ਤ ਜਾਰੀ ਹੋ ਗਈ!',
      body: 'ਪੀਐਮ-ਕਿਸਾਨ ਦੀ 16ਵੀਂ ਕਿਸ਼ਤ ਜਾਰੀ ਹੋ ਚੁੱਕੀ ਹੈ। ਆਪਣਾ ਬੈਂਕ ਖਾਤਾ ਚੈਕ ਕਰੋ।',
      timestamp: '2 ਘੰਟੇ ਪਹਿਲਾਂ',
    },
    gu: {
      title: 'PM-કિસાનની કિસ્ત જારી થઈ!',
      body: 'PM-કિસાનની 16મી કિસ્ત જારી થઈ ગઈ છે. તમારું બેંક ખાતું તપાસો.',
      timestamp: '2 કલાક પહેલા',
    },
  },
  n2: {
    en: {
      title: 'New Scholarship for Students',
      body: 'Post-Matric scholarship applications open for 2024-25. Apply before March 31.',
      timestamp: '1 day ago',
    },
    hi: {
      title: 'छात्रों के लिए नई छात्रवृत्ति',
      body: 'पोस्ट-मैट्रिक छात्रवृत्ति 2024-25 के आवेदन शुरू हैं। 31 मार्च से पहले आवेदन करें।',
      timestamp: '1 दिन पहले',
    },
    pa: {
      title: 'ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਨਵੀਂ ਸਕਾਲਰਸ਼ਿਪ',
      body: 'ਪੋਸਟ-ਮੈਟ੍ਰਿਕ ਸਕਾਲਰਸ਼ਿਪ 2024-25 ਲਈ ਅਰਜ਼ੀਆਂ ਖੁੱਲ੍ਹੀਆਂ ਹਨ। 31 ਮਾਰਚ ਤੋਂ ਪਹਿਲਾਂ ਅਪਲਾਈ ਕਰੋ।',
      timestamp: '1 ਦਿਨ ਪਹਿਲਾਂ',
    },
    gu: {
      title: 'વિદ્યાર્થીઓ માટે નવી સ્કોલરશિપ',
      body: 'પોસ્ટ-મેટ્રિક સ્કોલરશિપ 2024-25 માટે અરજીઓ શરૂ છે. 31 માર્ચ પહેલાં અરજી કરો.',
      timestamp: '1 દિવસ પહેલા',
    },
  },
  n3: {
    en: {
      title: 'Ayushman Card Drive',
      body: 'Free Ayushman Bharat card registration camp in your area this weekend.',
      timestamp: '2 days ago',
    },
    hi: {
      title: 'आयुष्मान कार्ड अभियान',
      body: 'इस सप्ताहांत आपके क्षेत्र में मुफ्त आयुष्मान भारत कार्ड पंजीकरण शिविर है।',
      timestamp: '2 दिन पहले',
    },
    pa: {
      title: 'ਆਯੁਸ਼ਮਾਨ ਕਾਰਡ ਮੁਹਿੰਮ',
      body: 'ਇਸ ਵੀਕਐਂਡ ਤੁਹਾਡੇ ਇਲਾਕੇ ਵਿੱਚ ਮੁਫ਼ਤ ਆਯੁਸ਼ਮਾਨ ਭਾਰਤ ਕਾਰਡ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਕੈਂਪ ਹੈ।',
      timestamp: '2 ਦਿਨ ਪਹਿਲਾਂ',
    },
    gu: {
      title: 'આયુષ્માન કાર્ડ અભિયાન',
      body: 'આ વીકએન્ડ તમારા વિસ્તારમાં મફત આયુષ્માન ભારત કાર્ડ નોંધણી કેમ્પ છે.',
      timestamp: '2 દિવસ પહેલા',
    },
  },
  n4: {
    en: {
      title: 'Ration Card Update Reminder',
      body: 'Update your ration card details before end of month to avoid disruption.',
      timestamp: '3 days ago',
    },
    hi: {
      title: 'राशन कार्ड अपडेट याद दिलाना',
      body: 'सेवा में रुकावट से बचने के लिए महीने के अंत से पहले राशन कार्ड विवरण अपडेट करें।',
      timestamp: '3 दिन पहले',
    },
    pa: {
      title: 'ਰਾਸ਼ਨ ਕਾਰਡ ਅਪਡੇਟ ਯਾਦ ਦਿਹਾਣੀ',
      body: 'ਸੇਵਾ ਵਿੱਚ ਰੁਕਾਵਟ ਤੋਂ ਬਚਣ ਲਈ ਮਹੀਨੇ ਦੇ ਅਖੀਰ ਤੋਂ ਪਹਿਲਾਂ ਰਾਸ਼ਨ ਕਾਰਡ ਵੇਰਵੇ ਅਪਡੇਟ ਕਰੋ।',
      timestamp: '3 ਦਿਨ ਪਹਿਲਾਂ',
    },
    gu: {
      title: 'રેશન કાર્ડ અપડેટ યાદ અપાવવું',
      body: 'સેવામાં ખલેલ ટાળવા માટે મહિના પૂર્ણ થાય તે પહેલાં રેશન કાર્ડની વિગતો અપડેટ કરો.',
      timestamp: '3 દિવસ પહેલા',
    },
  },
};

export function getNotificationCopy(notification: Notification, language: Language) {
  return NOTIFICATION_COPY[notification.id]?.[language] ?? notification;
}
