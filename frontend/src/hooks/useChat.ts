import { useState, useEffect, useRef } from 'react';
import { Language, UserProfile } from '../types';
import { getChatResponse } from '../services/api';
import { speak, stopSpeaking, replayLast, registerSpeakingCallback, initSpeechRecognition } from '../services/tts';
import { storage } from '../services/storage';

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

export function useChat(profile: UserProfile, language: Language) {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(storage.getChatHistory());
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const stopRecordingRef = useRef<(() => void) | null>(null);

  useEffect(() => { registerSpeakingCallback(setIsSpeaking); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);
  useEffect(() => { storage.saveChatHistory(chatHistory); }, [chatHistory]);

  const sendMessage = async (overrideText?: string) => {
    const text = overrideText || inputText;
    if (!text.trim()) return;
    stopSpeaking();
    setChatHistory(prev => [...prev, { role: 'user', text }]);
    setInputText('');
    setIsThinking(true);
    const reply = await getChatResponse(text, profile, language);
    setIsThinking(false);
    setChatHistory(prev => [...prev, { role: 'ai', text: reply }]);
    speak(reply, language);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecordingRef.current?.();
      setIsRecording(false);
    } else {
      const stop = initSpeechRecognition(
        language,
        (transcript) => {
          setIsRecording(false);
          setInputText(transcript);
          setTimeout(() => sendMessage(transcript), 300);
        },
        () => setIsRecording(false)
      );
      if (stop) {
        stopRecordingRef.current = stop;
        setIsRecording(true);
      } else {
        speak(
          language === 'hi' ? 'यह ब्राउज़र वॉइस का समर्थन नहीं करता।' : 'Voice not supported in this browser.',
          language
        );
      }
    }
  };

  const clearHistory = () => {
    stopSpeaking();
    setChatHistory([]);
    storage.saveChatHistory([]);
  };

  return {
    chatHistory,
    inputText, setInputText,
    isSpeaking,
    isThinking,
    isRecording,
    chatEndRef,
    sendMessage,
    toggleRecording,
    clearHistory,
    replayLast,
    stopSpeaking,
  };
}