'use client';

import { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useAppStore } from '@/store/appStore';
import { useEmotionStore } from '@/store/emotionStore';
import { getEmotionColor } from '@/lib/emotion/engine';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';
import { useChat } from '@/hooks/useChat';

export default function ChatInterface() {
  const { messages, isLoading, isStreaming, currentStreamingMessage, error } = useChatStore();
  const { showGreeting, ollamaConnected, ollamaChecking, setOllamaConnected } = useAppStore();
  const { dominant } = useEmotionStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, stopGeneration, clearHistory } = useChat();

  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch('/api/chat');
      const data = await response.json();
      setOllamaConnected(data.connected);
    } catch {
      setOllamaConnected(false);
    }
  }, [setOllamaConnected]);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 15000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, currentStreamingMessage]);

  const accentColor = getEmotionColor(dominant);

  return (
    <div className="flex flex-col h-full">
      <AnimatePresence>
        {!ollamaConnected && !ollamaChecking && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-3 mt-2 px-3 py-2 rounded-xl border flex items-center justify-between gap-2"
            style={{
              background: 'rgba(248, 113, 113, 0.08)',
              border: '1px solid rgba(248, 113, 113, 0.2)',
            }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-300/80">
                Ollama is not running. Start Ollama and pull llama3 model to chat with Tara.
              </p>
            </div>
            <button
              onClick={checkConnection}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-red-300 hover:text-red-200 hover:bg-red-400/10 transition-colors flex-shrink-0"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {!showGreeting && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col items-center justify-center h-full text-center px-4"
          >
            <motion.div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6 border border-white/10"
              style={{
                background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}05)`,
                boxShadow: `0 0 30px ${accentColor}30`,
              }}
              animate={{
                boxShadow: [`0 0 20px ${accentColor}20`, `0 0 40px ${accentColor}40`, `0 0 20px ${accentColor}20`],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="text-4xl">🌸</span>
            </motion.div>
            <motion.p
              className="text-white/60 text-base mb-2 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Say something to Tara...
            </motion.p>
            <motion.p
              className="text-white/30 text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              She&apos;s always happy to hear from you
            </motion.p>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} index={index} />
          ))}
        </AnimatePresence>

        {isLoading && !isStreaming && <TypingIndicator />}

        {isStreaming && currentStreamingMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-4 pl-9"
          >
            <div
              className="max-w-[75%] md:max-w-[65%] px-4 py-3 rounded-2xl rounded-bl-md"
              style={{
                background: 'rgba(168, 85, 247, 0.06)',
                border: '1px solid rgba(168, 85, 247, 0.12)',
                boxShadow: `0 0 20px rgba(168, 85, 247, 0.05)`,
              }}
            >
              <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">{currentStreamingMessage}</p>
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-1.5 h-4 bg-purple-400/60 ml-0.5 align-middle rounded-sm"
              />
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-red-400/60 text-xs py-2 px-4"
          >
            {error}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSendMessage={sendMessage}
        isLoading={isLoading}
        isStreaming={isStreaming}
        onStopGeneration={stopGeneration}
        onClearHistory={clearHistory}
      />
    </div>
  );
}
