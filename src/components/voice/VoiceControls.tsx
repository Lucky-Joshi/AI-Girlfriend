'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2 } from 'lucide-react';
import { useVoiceStore } from '@/store/voiceStore';

export default function VoiceControls() {
  const { isListening, isSpeaking, transcript } = useVoiceStore();

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Mic size={12} className="text-red-400" />
            </motion.div>
            <span className="text-[10px] text-red-300/80">Listening</span>
          </motion.div>
        )}

        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Volume2 size={12} className="text-cyan-400" />
            </motion.div>
            <span className="text-[10px] text-cyan-300/80">Speaking</span>
          </motion.div>
        )}
      </AnimatePresence>

      {transcript && !isListening && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] text-white/30 italic max-w-[120px] truncate"
        >
          &quot;{transcript}&quot;
        </motion.p>
      )}
    </div>
  );
}
