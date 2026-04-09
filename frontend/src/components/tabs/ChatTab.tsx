import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Send, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { Language, UserProfile } from '../../types';
import { Avatar } from '../Avatar';
import { PlayStopButton } from '../ui/PlayStopButton';
import { QUICK_PROMPTS } from '../../constants/quickPrompts';
import { useChat } from '../../hooks/useChat';

interface ChatTabProps {
  language: Language;
  profile: UserProfile;
  chat: ReturnType<typeof useChat>;
}

export const ChatTab: React.FC<ChatTabProps> = ({ language, profile, chat }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
    className="rounded-3xl overflow-hidden flex flex-col"
    style={{ background: 'white', border: '1px solid #F0EDE8', height: 'calc(100vh - 200px)', minHeight: 500 }}
  >
    {/* Header */}
    <div
      className="flex items-center justify-between px-6 py-4 border-b"
      style={{ background: 'linear-gradient(135deg, #FFF7ED, #FFFBEB)', borderColor: '#F0EDE8' }}
    >
      <div className="flex items-center gap-3">
        <Avatar
          isSpeaking={chat.isSpeaking}
          mood={chat.isThinking ? 'thinking' : chat.isRecording ? 'listening' : 'neutral'}
          language={language}
          size="sm"
        />
        <div>
          <h3 className="font-black text-gray-900">
            {language === 'hi' ? 'साथी AI' : language === 'pa' ? 'ਸਾਥੀ AI' : 'Saathi AI'}
          </h3>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Online</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <PlayStopButton
          isSpeaking={chat.isSpeaking}
          onPlay={chat.replayLast}
          onStop={chat.stopSpeaking}
          language={language}
          size="sm"
        />
        <button
          onClick={chat.clearHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
          style={{ background: '#FEE2E2', color: '#DC2626' }}
        >
          <X size={12} />
          {language === 'hi' ? 'साफ करें' : 'Clear'}
        </button>
      </div>
    </div>

    {/* Messages area */}
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {chat.chatHistory.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center gap-5">
          <div className="text-6xl">🧞‍♀️</div>
          <div>
            <h4 className="text-lg font-black text-gray-800" style={{ fontFamily: "'Baloo 2', cursive" }}>
              {language === 'hi' ? 'नमस्ते! मैं Saathi हूँ' : "Namaste! I'm Saathi"}
            </h4>
            <p className="text-sm text-gray-400 mt-1">
              {language === 'hi' ? 'मुझसे किसी भी सरकारी योजना के बारे में पूछें' : 'Ask me anything about government schemes'}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-sm">
            {QUICK_PROMPTS[language].map(q => (
              <button
                key={q}
                onClick={() => chat.setInputText(q)}
                className="px-4 py-2 rounded-2xl text-xs font-medium transition-all hover:scale-105"
                style={{ background: '#FFF7ED', color: '#D97706', border: '1px solid #FED7AA' }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {chat.chatHistory.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
        >
          {msg.role === 'ai' && (
            <div className="w-8 h-8 rounded-2xl shrink-0 flex items-center justify-center text-base"
              style={{ background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)' }}>🧞‍♀️</div>
          )}
          <div
            className={`max-w-[75%] px-5 py-3 rounded-3xl text-sm leading-relaxed ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
            style={{
              background: msg.role === 'user' ? 'linear-gradient(135deg, #FF6B35, #F59E0B)' : '#FBF8F4',
              color: msg.role === 'user' ? 'white' : '#374151',
              border: msg.role === 'ai' ? '1px solid #F0EDE8' : 'none',
            }}
          >
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
          {msg.role === 'user' && (
            <div
              className="w-8 h-8 rounded-2xl shrink-0 flex items-center justify-center font-black text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #FF6B35, #F59E0B)' }}
            >
              {profile.name ? profile.name[0].toUpperCase() : 'U'}
            </div>
          )}
        </motion.div>
      ))}

      {chat.isThinking && (
        <div className="flex justify-start gap-3">
          <div className="w-8 h-8 rounded-2xl flex items-center justify-center text-base"
            style={{ background: '#FFF7ED' }}>🧞‍♀️</div>
          <div className="px-5 py-3 rounded-3xl rounded-tl-sm flex gap-2 items-center"
            style={{ background: '#FBF8F4', border: '1px solid #F0EDE8' }}>
            {[0, 0.2, 0.4].map((d, i) => (
              <motion.div key={i} className="w-2 h-2 rounded-full"
                style={{ background: '#D97706' }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: d }}
              />
            ))}
          </div>
        </div>
      )}
      <div ref={chat.chatEndRef} />
    </div>

    {/* Input area */}
    <div className="p-5 border-t" style={{ borderColor: '#F0EDE8', background: '#FFFAF6' }}>
      <div className="relative max-w-3xl mx-auto">
        <textarea
          value={chat.inputText}
          onChange={e => chat.setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), chat.sendMessage())}
          placeholder={language === 'hi' ? 'अपना सवाल लिखें...' : language === 'pa' ? 'ਆਪਣਾ ਸਵਾਲ ਲਿਖੋ...' : 'Type your question here...'}
          rows={1}
          className="w-full pl-5 pr-28 py-4 rounded-3xl text-sm outline-none resize-none"
          style={{ background: 'white', border: '2px solid #F0EDE8', color: '#374151' }}
          onFocus={e => (e.target.style.borderColor = '#FF6B35')}
          onBlur={e => (e.target.style.borderColor = '#F0EDE8')}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            onClick={chat.toggleRecording}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: chat.isRecording ? '#FEE2E2' : '#F5F0EB', color: chat.isRecording ? '#DC2626' : '#9CA3AF' }}
          >
            <Mic size={18} />
          </button>
          <button
            onClick={() => chat.sendMessage()}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #FF6B35, #F59E0B)', color: 'white' }}
          >
            <Send size={16} />
            {language === 'hi' ? 'भेजें' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);