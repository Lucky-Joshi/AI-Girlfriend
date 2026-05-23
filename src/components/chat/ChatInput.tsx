'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, StopCircle, Trash2 } from 'lucide-react';
import { startListening, stopListening } from '@/lib/voice/utils';
import { useVoiceStore } from '@/store/voiceStore';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isStreaming: boolean;
  onStopGeneration: () => void;
  onClearHistory: () => void;
}

export default function ChatInput({
  onSendMessage,
  isLoading,
  isStreaming,
  onStopGeneration,
  onClearHistory,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isListening, transcript } = useVoiceStore();

  useEffect(() => {
    if (transcript && !isListening) {
      const frame = requestAnimationFrame(() => {
        setInput(transcript);
      });

      return () => cancelAnimationFrame(frame);
    }
  }, [transcript, isListening]);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleClearHistory = () => {
    const confirmed = window.confirm('Clear the current chat from both the screen and database?');
    if (!confirmed) return;
    onClearHistory();
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <motion.div
      className="p-3 md:p-4"
      style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <form onSubmit={handleSubmit} className="flex items-end gap-2 max-w-3xl mx-auto">
        <motion.button
          type="button"
          onClick={toggleVoice}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`p-2.5 md:p-3 rounded-xl transition-all duration-300 flex-shrink-0 ${
            isListening
              ? 'bg-red-500/20 text-red-400 border border-red-400/30'
              : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60 border border-white/10'
          }`}
        >
          {isListening ? (
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
              <Mic size={18} />
            </motion.div>
          ) : (
            <Mic size={18} />
          )}
        </motion.button>

        <motion.button
          type="button"
          onClick={handleClearHistory}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2.5 md:p-3 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-red-300 border border-white/10 transition-all duration-300 flex-shrink-0"
          title="Clear chat history"
        >
          <Trash2 size={18} />
        </motion.button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Talk to Tara..."
            rows={1}
            className="w-full px-4 py-2.5 md:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-cyan-400/30 focus:ring-1 focus:ring-cyan-400/20 resize-none transition-all duration-300 text-sm"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
        </div>

        <AnimatePresence mode="wait">
          {isStreaming ? (
            <motion.button
              key="stop"
              type="button"
              onClick={onStopGeneration}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 md:p-3 rounded-xl bg-red-500/20 text-red-400 border border-red-400/30 flex-shrink-0"
            >
              <StopCircle size={18} />
            </motion.button>
          ) : (
            <motion.button
              key="send"
              type="submit"
              disabled={!input.trim() || isLoading}
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 md:p-3 rounded-xl bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-cyan-400 border border-cyan-400/30 disabled:opacity-20 disabled:cursor-not-allowed flex-shrink-0 transition-all duration-300"
            >
              <Send size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}
