import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { STATES, Language } from '../types';

const LABELS: Record<Language, Record<string, string>> = {
  en: {
    title: 'Help us find the best schemes for you',
    nameQuestion: 'What is your name?',
    namePlaceholder: 'Enter your name',
    genderQuestion: 'Tell us about yourself, you are a...',
    ageQuestion: 'and your age is',
    years: 'years',
    maritalQuestion: 'and your marital status is...',
    stateQuestion: 'Please select your state',
    residenceQuestion: 'Please select your area of residence',
    categoryQuestion: 'You belong to...',
    disabilityQuestion: 'Do you identify as a person with a disability?',
    minorityQuestion: 'Do you belong to a minority community?',
    studentQuestion: 'Are you a student?',
    employmentQuestion: 'What is your current employment status?',
    governmentQuestion: 'Are you currently working as a government employee?',
    annualIncomeQuestion: 'What is your annual income?',
    familyIncomeQuestion: "What is your family's annual income?",
    select: 'Select',
    skip: 'Skip & Move to Results ⏭️',
    reset: '↺ Reset Form',
    back: '← Back',
    next: 'Next →',
    submit: 'Submit',
  },
  hi: {
    title: 'हमें आपके लिए सबसे अच्छी योजनाएं खोजने में मदद करें',
    nameQuestion: 'आपका नाम क्या है?',
    namePlaceholder: 'अपना नाम दर्ज करें',
    genderQuestion: 'अपने बारे में बताइए, आप...',
    ageQuestion: 'और आपकी आयु है',
    maritalQuestion: 'और आपकी वैवाहिक स्थिति है...',
    stateQuestion: 'कृपया अपना राज्य चुनें',
    residenceQuestion: 'कृपया अपना निवास क्षेत्र चुनें',
    categoryQuestion: 'आप किस श्रेणी से हैं...',
    disabilityQuestion: 'क्या आप विकलांगता वाले व्यक्ति के रूप में पहचानते हैं?',
    minorityQuestion: 'क्या आप अल्पसंख्यक समुदाय से हैं?',
    studentQuestion: 'क्या आप छात्र हैं?',
    employmentQuestion: 'आपकी वर्तमान रोज़गार स्थिति क्या है?',
    governmentQuestion: 'क्या आप वर्तमान में सरकारी कर्मचारी हैं?',
    annualIncomeQuestion: 'आपकी वार्षिक आय क्या है?',
    familyIncomeQuestion: 'आपके परिवार की वार्षिक आय क्या है?',
    select: 'चुनें',
    skip: 'छोड़ें और परिणाम देखें ⏭️',
    reset: '↺ फॉर्म रीसेट करें',
    back: '← वापस',
    next: 'आगे →',
    submit: 'सबमिट',
  },
  pa: {
    title: 'ਸਾਨੂੰ ਤੁਹਾਡੇ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਯੋਜਨਾਵਾਂ ਲੱਭਣ ਵਿੱਚ ਮਦਦ ਕਰੋ',
    nameQuestion: 'ਤੁਹਾਡਾ ਨਾਮ ਕੀ ਹੈ?',
    namePlaceholder: 'ਆਪਣਾ ਨਾਮ ਦਰਜ ਕਰੋ',
    genderQuestion: 'ਸਾਡੇ ਨੂੰ ਦੱਸੋ, ਤੁਸੀਂ...',
    ageQuestion: 'ਅਤੇ ਤੁਹਾਡੀ ਉਮਰ ਹੈ',
    maritalQuestion: 'ਅਤੇ ਤੁਹਾਡੀ ਵਿਆਹੀ ਸਥਿਤੀ ਹੈ...',
    stateQuestion: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਰਾਜ ਚੁਣੋ',
    residenceQuestion: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਰਹਿਣ ਵਾਲਾ ਖੇਤਰ ਚੁਣੋ',
    categoryQuestion: 'ਤੁਸੀਂ ਕਿਸ ਵਰਗ ਨਾਲ ਹੋ...',
    disabilityQuestion: 'ਕੀ ਤੁਸੀਂ ਆਪਣੇ ਆਪ ਨੂੰ ਅਪੰਗਤਾ ਵਾਲੇ ਵਿਅਕਤੀ ਸਮਝਦੇ ਹੋ?',
    minorityQuestion: 'ਕੀ ਤੁਸੀਂ ਘੱਟ ਗਿਣਤੀ ਵਾਲੀ ਸਮੁਦਾਇਕ ਤਰਬੀਅਤ ਨਾਲ ਹੋ?',
    studentQuestion: 'ਕੀ ਤੁਸੀਂ ਵਿਦਿਆਰਥੀ ਹੋ?',
    employmentQuestion: 'ਤੁਹਾਡੀ ਵਰਤਮਾਨ ਰੋਜ਼ਗਾਰ ਸਥਿਤੀ ਕੀ ਹੈ?',
    governmentQuestion: 'ਕੀ ਤੁਸੀਂ ਇਸ ਸਮੇਂ ਸਰਕਾਰੀ ਕਰਮਚਾਰੀ ਹੋ?',
    annualIncomeQuestion: 'ਤੁਹਾਡੀ ਸਾਲਾਨਾ ਆਮਦਨ ਕੀ ਹੈ?',
    familyIncomeQuestion: 'ਤੁਹਾਡੇ ਪਰਿਵਾਰ ਦੀ ਸਾਲਾਨਾ ਆਮਦਨ ਕੀ ਹੈ?',
    select: 'ਚੁਣੋ',
    skip: 'ਛੱਡੋ ਅਤੇ ਨਤੀਜਿਆਂ ਵੱਲ ਵਧੋ ⏭️',
    reset: '↺ ਫਾਰਮ ਰੀਸੈੱਟ ਕਰੋ',
    back: '← ਵਾਪਸ',
    next: 'ਅੱਗੇ →',
    submit: 'ਜਮ੍ਹਾਂ ਕਰੋ',
  },
  gu: {
    title: 'અમને તમારા માટે શ્રેષ્ઠ યોજનાઓ શોધવામાં મદદ કરો',
    nameQuestion: 'તમારું નામ શું છે?',
    namePlaceholder: 'તમારું નામ દાખલ કરો',
    genderQuestion: 'અમને જણાવો, તમે...',
    ageQuestion: 'અને તમારી ઉંમર છે',
    maritalQuestion: 'અને તમારી વૈવાહિક સ્થિતિ છે...',
    stateQuestion: 'કૃપા કરીને તમારો રાજ્ય પસંદ કરો',
    residenceQuestion: 'કૃપા કરીને તમારો રહેણાંક વિસ્તાર પસંદ કરો',
    categoryQuestion: 'તમે કયા વર્ગના છો...',
    disabilityQuestion: 'શું તમે સ્વયંને વિકલાંગ વ્યક્તિનો ભાગ માનો છો?',
    minorityQuestion: 'શું તમે અಲ್ಪસંખ્યક સમુદાયમાં આવો છો?',
    studentQuestion: 'શું તમે વિદ્યાર્થી છો?',
    employmentQuestion: 'તમારી વર્તમાન રોજગાર સ્થિતિ શું છે?',
    governmentQuestion: 'શું તમે હાલમાં સરકારી કર્મચારી તરીકે કામ કરો છો?',
    annualIncomeQuestion: 'તમારી વાર્ષિક આવક કેટલી છે?',
    familyIncomeQuestion: 'તમારા પરિવારમાંની વાર્ષિક આવક કેટલી છે?',
    select: 'પસંદ કરો',
    skip: 'છોડો અને પરિણામો જુઓ ⏭️',
    reset: '↺ ફોર્મ રીસેટ કરો',
    back: '← પાછો',
    next: 'આગળ →',
    submit: 'જમાવો',
  },
};

interface QuestionnaireModalProps {
  language: Language;
  onComplete: (data: any) => void;
  onClose: () => void;
}

export const QuestionnaireModal: React.FC<QuestionnaireModalProps> = ({ language, onComplete, onClose }) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const [name, setName] = useState('');
  const [gender, setGender] = useState('Female');
  const [age, setAge] = useState<number | ''>('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [state, setStateVal] = useState('');
  const [residence, setResidence] = useState('');
  const [category, setCategory] = useState('');
  const [isDisability, setIsDisability] = useState('');
  const [isMinority, setIsMinority] = useState('');
  const [isStudent, setIsStudent] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [isGovtEmployee, setIsGovtEmployee] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [familyIncome, setFamilyIncome] = useState('');

  const text = LABELS[language] || LABELS.en;

  const compileData = () => ({
    name: name.trim(),
    gender,
    age: age ? String(age) : '',
    occupation: employmentStatus,
    income: annualIncome ? String(annualIncome) : '',
    maritalStatus,
    state,
    residence,
    category,
    isDisability,
    isMinority,
    isStudent,
    employmentStatus,
    isGovtEmployee,
    annualIncome: annualIncome ? String(annualIncome) : '',
    familyIncome: familyIncome ? String(familyIncome) : '',
  });

  const handleSkip = () => {
    onComplete(compileData());
  };

  const handleNext = () => {
    if (step === 1 && (!name.trim() || !age || (age > 18 && !maritalStatus))) return;
    if (step === 2 && (!state || !residence)) return;
    if (step === 3 && !category) return;
    if (step === 4 && (!isDisability || !isMinority)) return;
    if (step === 5) {
      if (!isStudent) return;
      if (isStudent === 'No') {
        if (!employmentStatus) return;
        if (employmentStatus === 'Employed' && !isGovtEmployee) return;
      }
    }
    if (step === 6 && (!annualIncome || !familyIncome)) return;

    if (step < 6) {
      setDirection(1);
      setStep(s => s + 1);
    } else {
      onComplete(compileData());
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(s => s - 1);
  };

  const handleReset = () => {
    setGender('Female');
    setAge('');
    setMaritalStatus('');
    setStateVal('');
    setResidence('');
    setCategory('');
    setIsDisability('');
    setIsMinority('');
    setIsStudent('');
    setEmploymentStatus('');
    setIsGovtEmployee('');
    setAnnualIncome('');
    setFamilyIncome('');
    setDirection(-1);
    setStep(1);
  };

  const renderActionButtons = (disableNext: boolean, isSubmit = false, showSkip = true) => (
    <div className="mt-auto pt-8 flex flex-col gap-3">
      <button
        onClick={handleNext}
        disabled={disableNext}
        className="w-full py-4 rounded-2xl font-black text-white text-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
      >
        {isSubmit ? text.submit : text.next}
      </button>
      {showSkip ? (
        <button
          onClick={handleSkip}
          className="w-full py-3 rounded-2xl font-bold text-green-600 bg-green-50 border-2 border-green-100 hover:bg-green-200 transition-all"
        >
          {text.skip}
        </button>
      ) : (
        <button
          onClick={handleReset}
          className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors mx-auto mt-2"
        >
          {text.reset}
        </button>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {/* Heading */}
        <h2 className="text-gray-500 font-semibold text-lg sm:text-xl mb-4 text-center">
          {text.title}
        </h2>
        
        {/* Main Card */}
        <motion.div 
          className="bg-white rounded-3xl shadow-2xl w-full sm:w-7/12 flex flex-col p-6 sm:p-8"
          style={{ minHeight: '550px' }}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
        >
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8 relative">
            {step > 1 && (
              <button 
                onClick={() => setStep(s => s - 1)}
                className="absolute left-0 text-sm text-gray-400 hover:text-gray-600 font-medium"
              >
                {text.back}
              </button>
            )}
            <div className="flex items-center w-[55%] justify-between">
              {[1, 2, 3, 4, 5, 6].map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 transition-colors ${s <= step ? 'bg-green-500' : 'bg-gray-200'}`} />
                  {i < 5 && (
                    <div className={`h-1 flex-1 mx-1 transition-colors ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step 1 Content */}
          {step === 1 && (
            <div className="flex-1 flex flex-col">
              <div className="mb-6">
                <label className="block font-bold text-gray-800 mb-3">
                  {text.nameQuestion} <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={text.namePlaceholder}
                  className="w-full text-lg text-gray-900 border-2 border-gray-300 rounded-2xl px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white"
                />
              </div>

              <div className="mb-6">
                <label className="block font-bold text-gray-800 mb-3">
                  {text.genderQuestion} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {[
                    { id: 'Male', icon: '👨' },
                    { id: 'Female', icon: '👩' },
                    { id: 'Transgender', icon: '⚧️' }
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGender(g.id)}
                      className={`flex-1 py-4 px-2 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${
                        gender === g.id 
                          ? 'border-green-500 bg-green-50 text-green-700 shadow-md' 
                          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl mb-1">{g.icon}</span>
                      <span className="text-sm font-semibold">{g.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6 flex items-center flex-wrap gap-2 text-gray-800 font-medium text-lg">
                <span>{text.ageQuestion}</span>
                <select
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  className="font-bold text-xl text-gray-900 border-2 border-gray-300 rounded-xl px-3 py-1 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white"
                >
                  <option value="" disabled>{text.select}</option>
                  {Array.from({ length: 115 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
                <span>{text.years}</span>
              </div>

              <AnimatePresence>
                {typeof age === 'number' && age > 18 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="block font-bold text-gray-800 mb-3">
                      {text.maritalQuestion} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      {['Single', 'Married', 'Widowed', 'Divorced'].map((m) => (
                        <button
                          key={m}
                          onClick={() => setMaritalStatus(m)}
                          className={`flex-1 py-4 rounded-xl flex items-center justify-center border-2 transition-all ${
                            maritalStatus === m 
                              ? 'border-green-500 bg-green-50 text-green-700 shadow-md' 
                              : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-sm font-semibold">{m}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {renderActionButtons(!name.trim() || !age || (age > 18 && !maritalStatus), false, false)}
            </div>
          )}

          {/* Step 2 Content */}
          {step === 2 && (
            <div className="flex-1 flex flex-col">
              <div className="mb-6">
                <label className="block font-bold text-gray-800 mb-3">
                  {text.stateQuestion} <span className="text-red-500">*</span>
                </label>
                <select
                  value={state}
                  onChange={(e) => setStateVal(e.target.value)}
                  className="w-full font-bold text-lg text-gray-900 border-2 border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white"
                >
                  <option value="" disabled>{text.select}</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="mb-6">
                <label className="block font-bold text-gray-800 mb-3 mt-4">
                  {text.residenceQuestion} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {['Urban', 'Rural'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setResidence(r)}
                      className={`flex-1 py-4 px-2 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${
                        residence === r 
                          ? 'border-green-500 bg-green-50 text-green-700 shadow-md' 
                          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl mb-1">{r === 'Urban' ? '🏙️' : '🌾'}</span>
                      <span className="text-sm font-semibold">{r}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {renderActionButtons(!state || !residence, false, true)}
            </div>
          )}

          {/* Step 3 Content */}
          {step === 3 && (
            <div className="flex-1 flex flex-col">
              <div className="mb-6">
                <label className="block font-bold text-gray-800 mb-3">
                  {text.categoryQuestion} <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'General', label: 'General' },
                    { id: 'OBC', label: 'Other Backward Class (OBC)' },
                    { id: 'PVTG', label: 'Particularly Vulnerable Tribal Group (PVTG)' },
                    { id: 'SC', label: 'Scheduled Caste (SC)' },
                    { id: 'ST', label: 'Scheduled Tribe (ST)' },
                    { id: 'DNT', label: 'De-Notified, Nomadic, and Semi-Nomadic (DNT) communities' }
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCategory(c.id)}
                      className={`w-full py-3 px-4 rounded-xl flex items-center text-left border-2 transition-all ${
                        category === c.id 
                          ? 'border-green-500 bg-green-50 text-green-700 shadow-md' 
                          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-bold text-gray-700">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {renderActionButtons(!category, false, true)}
            </div>
          )}

          {/* Step 4 Content */}
          {step === 4 && (
            <div className="flex-1 flex flex-col">
              <div className="mb-6">
                <label className="block font-bold text-gray-800 mb-3">
                  {text.disabilityQuestion} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {['Yes', 'No'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setIsDisability(opt)}
                      className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
                        isDisability === opt ? 'border-green-500 bg-green-50 text-green-700 shadow-md' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-bold text-gray-800 mb-3 mt-4">
                  {text.minorityQuestion} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {['Yes', 'No'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setIsMinority(opt)}
                      className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
                        isMinority === opt ? 'border-green-500 bg-green-50 text-green-700 shadow-md' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {renderActionButtons(!isDisability || !isMinority, false, true)}
            </div>
          )}

          {/* Step 5 Content */}
          {step === 5 && (
            <div className="flex-1 flex flex-col">
              <div className="mb-6">
                <label className="block font-bold text-gray-800 mb-3">
                  {text.studentQuestion} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {['Yes', 'No'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setIsStudent(opt);
                        if (opt === 'Yes') {
                          setEmploymentStatus('');
                          setIsGovtEmployee('');
                        }
                      }}
                      className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
                        isStudent === opt ? 'border-green-500 bg-green-50 text-green-700 shadow-md' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {isStudent === 'No' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="block font-bold text-gray-800 mb-3">
                      {text.employmentQuestion} <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {['Employed', 'Unemployed', 'Self-Employed/Entrepreneur'].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setEmploymentStatus(status);
                            if (status !== 'Employed') setIsGovtEmployee('');
                          }}
                          className={`w-full py-3 px-2 rounded-xl text-xs font-bold border-2 transition-all ${
                            employmentStatus === status ? 'border-green-500 bg-green-50 text-green-700 shadow-md' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {employmentStatus === 'Employed' && isStudent === 'No' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="block font-bold text-gray-800 mb-3">
                      {text.governmentQuestion} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      {['Yes', 'No'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setIsGovtEmployee(opt)}
                          className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
                            isGovtEmployee === opt ? 'border-green-500 bg-green-50 text-green-700 shadow-md' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {renderActionButtons(
                !isStudent || 
                (isStudent === 'No' && (!employmentStatus || (employmentStatus === 'Employed' && !isGovtEmployee))), 
                false, true
              )}
            </div>
          )}

          {/* Step 6 Content */}
          {step === 6 && (
            <div className="flex-1 flex flex-col">
              <div className="mb-6">
                <label className="block font-bold text-gray-800 mb-3">
                  {text.annualIncomeQuestion} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                  <input
                    type="number"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    placeholder="Enter here"
                    className="w-full font-bold text-lg text-gray-900 border-2 border-gray-300 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-bold text-gray-800 mb-3 mt-4">
                  {text.familyIncomeQuestion} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                  <input
                    type="number"
                    value={familyIncome}
                    onChange={(e) => setFamilyIncome(e.target.value)}
                    placeholder="Enter here"
                    className="w-full font-bold text-lg text-gray-900 border-2 border-gray-300 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white"
                  />
                </div>
              </div>

              {renderActionButtons(!annualIncome || !familyIncome, true, true)}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
