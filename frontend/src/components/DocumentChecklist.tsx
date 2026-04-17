import React from 'react';
import { Language } from '../types';
import { CheckCircle, XCircle, ShieldCheck, UploadCloud } from 'lucide-react';

interface DocumentChecklistProps {
  requiredDocs: string[];
  userDocs: string[];
  language: Language;
}

/**
 * Identifies which required documents are missing from the user's documents.
 * A user document is considered a match if its name (case-insensitive) contains
 * the core name of the required document (e.g., "Aadhaar" matches "Aadhaar Card").
 */
function findMissingDocs(requiredDocs: string[], userDocs: string[]): string[] {
  const missing: string[] = [];
  const userDocNames = userDocs.map(d => d.toLowerCase());

  for (const reqDoc of requiredDocs) {
    const coreName = reqDoc.split(' ')[0].toLowerCase(); // e.g., "aadhaar" from "Aadhaar Card"
    const isFound = userDocNames.some(userDoc => userDoc.includes(coreName));
    if (!isFound) {
      missing.push(reqDoc);
    }
  }
  return missing;
}

const LABELS: Record<Language, { required: string; uploaded: string; missingMsg: (n: number) => string; uploadManual: string; digilocker: string }> = {
  en: {
    required: 'Documents Required',
    uploaded: '(Uploaded)',
    missingMsg: (n) => `You are missing ${n} document(s). You can upload them in your profile or connect DigiLocker.`,
    uploadManual: 'Upload Manually',
    digilocker: 'OR verify with DigiLocker',
  },
  hi: {
    required: 'आवश्यक दस्तावेज़',
    uploaded: '(अपलोड किया गया)',
    missingMsg: (n) => `आपके पास ${n} दस्तावेज़ कम हैं। आप उन्हें अपनी प्रोफ़ाइल में अपलोड कर सकते हैं या DigiLocker कनेक्ट कर सकते हैं।`,
    uploadManual: 'मैन्युअल रूप से अपलोड करें',
    digilocker: 'या DigiLocker से सत्यापित करें',
  },
  pa: {
    required: 'ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼',
    uploaded: '(ਅਪਲੋਡ ਕੀਤਾ ਗਿਆ)',
    missingMsg: (n) => `ਤੁਹਾਡੇ ਕੋਲ ${n} ਦਸਤਾਵੇਜ਼ ਘੱਟ ਹਨ। ਤੁਸੀਂ ਉਹਨਾਂ ਨੂੰ ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਵਿੱਚ ਅਪਲੋਡ ਕਰ ਸਕਦੇ ਹੋ ਜਾਂ DigiLocker ਕਨੈਕਟ ਕਰ ਸਕਦੇ ਹੋ।`,
    uploadManual: 'ਖੁਦ ਅਪਲੋਡ ਕਰੋ',
    digilocker: 'ਜਾਂ DigiLocker ਨਾਲ ਪ੍ਰਮਾਣਿਤ ਕਰੋ',
  },
  gu: {
    required: 'જરૂરી દસ્તાવેજો',
    uploaded: '(અપલોડ કરેલ)',
    missingMsg: (n) => `તમારે ${n} દસ્તાવેજ(જો) ખૂટે છે. તમે તેમને તમારી પ્રોફાઇલમાં અપલોડ કરી શકો છો અથવા DigiLocker કનેક્ટ કરી શકો છો.`,
    uploadManual: 'જાતે અપલોડ કરો',
    digilocker: 'અથવા DigiLocker થી ચકાસો',
  },
};

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({ requiredDocs, userDocs, language }) => {
  const missingDocs = findMissingDocs(requiredDocs, userDocs);
  const L = LABELS[language] || LABELS.en;

  const hasDoc = (docName: string) => !missingDocs.includes(docName);

  return (
    <div className="space-y-4 pt-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">{L.required}</p>
        <div className="mt-2 space-y-2">
          {requiredDocs.map(doc => (
            <div key={doc} className="flex items-center gap-2">
              {hasDoc(doc) ? (
                <CheckCircle size={16} className="text-green-500 shrink-0" />
              ) : (
                <XCircle size={16} className="text-red-400 shrink-0" />
              )}
              <span className={`text-sm font-medium ${hasDoc(doc) ? 'text-gray-700' : 'text-red-600'}`}>
                {doc}
              </span>
              {hasDoc(doc) && <span className="text-xs text-green-600 font-bold">{L.uploaded}</span>}
            </div>
          ))}
        </div>
      </div>

      {missingDocs.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
          <p className="text-xs font-bold text-amber-800">
            {L.missingMsg(missingDocs.length)}
          </p>
          <div className="flex flex-col gap-2">
            <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
              <UploadCloud size={14} />
              {L.uploadManual}
            </button>
            <a
              href="https://www.digilocker.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all hover:opacity-90 cursor-pointer shadow-sm border border-[#173F5F]"
              style={{ background: 'linear-gradient(to right, #0F2027, #203A43, #2C5364)', color: 'white' }}>
              <ShieldCheck size={16} className="text-blue-400" />
              {L.digilocker}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};