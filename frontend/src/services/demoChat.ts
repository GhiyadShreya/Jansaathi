import { Language } from '../types';

const QUICK_PROMPT_RESPONSES: Record<Language, Record<string, string>> = {
  en: {
    'What schemes am I eligible for?': 'Based on your profile, the most relevant options are usually Ayushman Bharat for health cover, PM-Kisan if you are a farmer, and Post-Matric Scholarship if you are studying. Open your profile and scheme cards to confirm the exact eligibility details for your state and income level.',
    'How to apply for Ayushman Bharat?': 'To apply for Ayushman Bharat PM-JAY, first check whether your family is listed as eligible, then visit the nearest CSC or empanelled hospital with Aadhaar and ration card details. Once verified, your Ayushman card can be generated and used for cashless treatment at listed hospitals.',
    'Farming subsidies in my state': 'Common farming support includes PM-Kisan income support, crop insurance under PM Fasal Bima Yojana, and subsidy schemes for irrigation, seeds, or equipment run by your state agriculture department. Your district agriculture office or CSC can tell you which of these is currently active in your area.',
  },
  hi: {
    'मेरे लिए कौन सी योजनाएँ हैं?': 'आपकी प्रोफ़ाइल के आधार पर आम तौर पर आयुष्मान भारत, किसान सम्मान निधि और पोस्ट मैट्रिक छात्रवृत्ति जैसी योजनाएँ उपयोगी हो सकती हैं। सही पात्रता आपकी आय, राज्य, पेशा और दस्तावेज़ों पर निर्भर करेगी, इसलिए प्रोफ़ाइल और योजना कार्ड ज़रूर देखें।',
    'आयुष्मान भारत के लिए कैसे आवेदन करें?': 'आयुष्मान भारत पीएम-जय के लिए पहले अपनी पात्रता जाँचें, फिर नज़दीकी CSC या सूचीबद्ध अस्पताल में आधार और राशन कार्ड जैसी जानकारी के साथ जाएँ। सत्यापन के बाद आपका आयुष्मान कार्ड बनाया जा सकता है और आप सूचीबद्ध अस्पतालों में कैशलेस इलाज ले सकते हैं।',
    'किसान सम्मान निधि की जानकारी': 'पीएम-किसान योजना के तहत पात्र किसानों को सालाना 6000 रुपये तीन किस्तों में मिलते हैं। आवेदन के लिए आधार, बैंक खाता और भूमि रिकॉर्ड जैसी जानकारी सही होना जरूरी है, और स्थिति आप पोर्टल या CSC के माध्यम से जाँच सकते हैं।',
  },
  pa: {
    'ਮੇਰੇ ਲਈ ਕਿਹੜੀਆਂ ਯੋਜਨਾਵਾਂ ਹਨ?': 'ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਦੇ ਅਧਾਰ ਤੇ ਆਮ ਤੌਰ ਤੇ ਆਯੁਸ਼ਮਾਨ ਭਾਰਤ, ਪੀਐਮ ਕਿਸਾਨ ਅਤੇ ਪੋਸਟ ਮੈਟ੍ਰਿਕ ਸਕਾਲਰਸ਼ਿਪ ਵਰਗੀਆਂ ਯੋਜਨਾਵਾਂ ਲਾਭਦਾਇਕ ਹੋ ਸਕਦੀਆਂ ਹਨ। ਪੱਕੀ ਯੋਗਤਾ ਤੁਹਾਡੀ ਆਮਦਨ, ਰਾਜ, ਕੰਮ ਅਤੇ ਦਸਤਾਵੇਜ਼ਾਂ ਉੱਤੇ ਨਿਰਭਰ ਕਰੇਗੀ, ਇਸ ਲਈ ਪ੍ਰੋਫਾਈਲ ਅਤੇ ਸਕੀਮ ਕਾਰਡ ਜ਼ਰੂਰ ਵੇਖੋ।',
    'ਕਿਸਾਨ ਸਨਮਾਨ ਨਿਧੀ ਬਾਰੇ': 'ਪੀਐਮ ਕਿਸਾਨ ਯੋਜਨਾ ਹੇਠ ਯੋਗ ਕਿਸਾਨਾਂ ਨੂੰ ਸਾਲਾਨਾ 6000 ਰੁਪਏ ਤਿੰਨ ਕਿਸ਼ਤਾਂ ਵਿੱਚ ਮਿਲਦੇ ਹਨ। ਆਧਾਰ, ਬੈਂਕ ਖਾਤਾ ਅਤੇ ਜ਼ਮੀਨ ਦੇ ਰਿਕਾਰਡ ਠੀਕ ਹੋਣੇ ਚਾਹੀਦੇ ਹਨ, ਅਤੇ ਤੁਸੀਂ ਪੋਰਟਲ ਜਾਂ CSC ਰਾਹੀਂ ਆਪਣੀ ਸਥਿਤੀ ਚੈਕ ਕਰ ਸਕਦੇ ਹੋ।',
    'ਸਿਹਤ ਕਾਰਡ ਕਿਵੇਂ ਬਣਾਈਏ?': 'ਆਯੁਸ਼ਮਾਨ ਜਾਂ ਹੋਰ ਸਿਹਤ ਕਾਰਡ ਲਈ ਪਹਿਲਾਂ ਯੋਗਤਾ ਚੈਕ ਕਰੋ, ਫਿਰ ਨੇੜਲੇ CSC ਜਾਂ ਮਨਜ਼ੂਰਸ਼ੁਦਾ ਹਸਪਤਾਲ ਤੇ ਆਧਾਰ ਅਤੇ ਪਰਿਵਾਰਕ ਵੇਰਵਿਆਂ ਨਾਲ ਜਾਓ। ਵੇਰਵੇ ਸਹੀ ਹੋਣ ਤੇ ਕਾਰਡ ਬਣ ਜਾਂਦਾ ਹੈ ਅਤੇ ਲਿਸਟ ਕੀਤੇ ਹਸਪਤਾਲਾਂ ਵਿਚ ਕੈਸ਼ਲੈੱਸ ਇਲਾਜ ਮਿਲ ਸਕਦਾ ਹੈ।',
  },
  gu: {
    'મારા માટે કઈ યોજનાઓ છે?': 'તમારી પ્રોફાઇલ મુજબ સામાન્ય રીતે આયુષ્માન ભારત, પીએમ કિસાન અને પોસ્ટ મેટ્રિક સ્કોલરશિપ જેવી યોજનાઓ ઉપયોગી થઈ શકે છે. ચોક્કસ પાત્રતા તમારી આવક, રાજ્ય, વ્યવસાય અને દસ્તાવેજો પર આધાર રાખે છે, એટલે પ્રોફાઇલ અને યોજના કાર્ડ જરૂર તપાસો.',
    'આયુષ્માન ભારત માટે કેવી રીતે અરજી કરવી?': 'આયુષ્માન ભારત પીએમ-જય માટે પહેલા તમારી પાત્રતા તપાસો, પછી નજીકના CSC અથવા યાદીબદ્ધ હોસ્પિટલમાં આધાર અને રેશન કાર્ડ જેવી વિગતો સાથે જાઓ. ચકાસણી પછી આયુષ્માન કાર્ડ બનાવી શકાય છે અને યાદીબદ્ધ હોસ્પિટલોમાં કેશલેસ સારવાર મળી શકે છે.',
    'ખેડૂત માટે સહાયતા': 'ખેડૂતો માટે સામાન્ય સહાયમાં પીએમ કિસાનની આવક સહાય, પીએમ ફસલ બીમા યોજનાની પાક વીમા સહાય અને રાજ્ય કૃષિ વિભાગની સિંચાઈ, બીજ કે સાધનો પરની સબસિડી સામેલ હોય છે. તમારા જિલ્લામાં હાલ કઈ યોજના સક્રિય છે તે CSC અથવા કૃષિ કચેરીથી જાણી શકાય છે.',
  },
};

export function getQuickPromptResponse(message: string, language: Language): string | null {
  return QUICK_PROMPT_RESPONSES[language][message.trim()] ?? null;
}
