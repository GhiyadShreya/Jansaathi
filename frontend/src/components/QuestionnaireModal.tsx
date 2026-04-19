import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { STATES } from '../types';

interface QuestionnaireModalProps {
  onComplete: (data: any) => void;
  onClose: () => void;
}

export const QuestionnaireModal: React.FC<QuestionnaireModalProps> = ({ onComplete, onClose }) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

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

  const compileData = () => ({
    gender,
    age: age ? Number(age) : undefined,
    maritalStatus,
    state,
    residence,
    category,
    isDisability,
    isMinority,
    isStudent,
    employmentStatus,
    isGovtEmployee,
    annualIncome: annualIncome ? Number(annualIncome) : undefined,
    familyIncome: familyIncome ? Number(familyIncome) : undefined
  });

  const handleSkip = () => {
    onComplete(compileData());
  };

  const handleNext = () => {
    if (step === 1 && (!age || (age > 18 && !maritalStatus))) return;
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
        {isSubmit ? 'Submit' : 'Next →'}
      </button>
      {showSkip ? (
        <button
          onClick={handleSkip}
          className="w-full py-3 rounded-2xl font-bold text-green-600 bg-green-50 border-2 border-green-100 hover:bg-green-200 transition-all"
        >
          Skip & Move to Results ⏭️
        </button>
      ) : (
        <button
          onClick={handleReset}
          className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors mx-auto mt-2"
        >
          ↺ Reset Form
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
          Help us find the best schemes for you
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
                ← Back
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
              
              {/* Q1: Gender Selection */}
              <div className="mb-6">
                <label className="block font-bold text-gray-800 mb-3">
                  Tell us about yourself, you are a... <span className="text-red-500">*</span>
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

              {/* Q2: Age Dropdown */}
              <div className="mb-6 flex items-center flex-wrap gap-2 text-gray-800 font-medium text-lg">
                <span>and your age is</span>
                <select
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  className="font-bold text-xl text-gray-900 border-2 border-gray-300 rounded-xl px-3 py-1 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white"
                >
                  <option value="" disabled>Select</option>
                  {Array.from({ length: 115 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
                <span>years</span>
              </div>

              {/* Q3: Marital Status (Conditional) */}
              <AnimatePresence>
                {typeof age === 'number' && age > 18 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="block font-bold text-gray-800 mb-3">
                      and your marital status is... <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      {[
                        { id: 'Single', icon: '👤' },
                        { id: 'Married', icon: '💍' },
                        { id: 'Widowed', icon: '🕊️' },
                        { id: 'Divorced', icon: '💔' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setMaritalStatus(m.id)}
                          className={`flex-1 py-3 px-1 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${
                            maritalStatus === m.id 
                              ? 'border-green-500 bg-green-50 text-green-700 shadow-md' 
                              : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-xl mb-1">{m.icon}</span>
                          <span className="text-xs font-semibold">{m.id}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {renderActionButtons(!age || (age > 18 && !maritalStatus), false, false)}
            </div>
          )}

          {/* Step 2 Content */}
          {step === 2 && (
            <div className="flex-1 flex flex-col">
              <div className="mb-6">
                <label className="block font-bold text-gray-800 mb-3">
                  Please select your state <span className="text-red-500">*</span>
                </label>
                <select
                  value={state}
                  onChange={(e) => setStateVal(e.target.value)}
                  className="w-full font-bold text-lg text-gray-900 border-2 border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white"
                >
                  <option value="" disabled>Select State</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="mb-6">
                <label className="block font-bold text-gray-800 mb-3 mt-4">
                  Please select your area of residence <span className="text-red-500">*</span>
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
                  You belong to... <span className="text-red-500">*</span>
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
                  Do you identify as a person with a disability? <span className="text-red-500">*</span>
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
                  Do you belong to minority? <span className="text-red-500">*</span>
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
                  Are you a student? <span className="text-red-500">*</span>
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
                      What is your current employment status? <span className="text-red-500">*</span>
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
                      Are you currently working as a government employee? <span className="text-red-500">*</span>
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
                  What is your annual income? <span className="text-red-500">*</span>
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
                  What is your family's annual income? <span className="text-red-500">*</span>
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