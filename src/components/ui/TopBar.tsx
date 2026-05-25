'use client';

import { motion } from 'framer-motion';
import { Settings, Heart, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useEmotionStore } from '@/store/emotionStore';
import { useAppStore } from '@/store/appStore';
import { getEmotionColor } from '@/lib/emotion/engine';

export default function TopBar() {
  const { dominant, affection } = useEmotionStore();
  const { ollamaConnected, ollamaChecking } = useAppStore();
  const glowColor = getEmotionColor(dominant);

  const relationshipLevel = Math.floor(affection / 10) + 1;
  const relationshipTitles = [
    'Stranger',
    'Acquaintance',
    'Friend',
    'Close Friend',
    'Companion',
    'Trusted Partner',
    'Beloved',
    'Soulmate',
    'Eternal Bond',
    'Inseparable',
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/5"
      style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <motion.div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${glowColor}60, ${glowColor}20)`,
              boxShadow: `0 0 20px ${glowColor}50`,
            }}
            animate={{
              boxShadow: [
                `0 0 20px ${glowColor}50`,
                `0 0 30px ${glowColor}70`,
                `0 0 20px ${glowColor}50`,
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className="text-lg">🌸</span>
          </motion.div>
          <motion.div
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black/80"
            style={{
              backgroundColor: ollamaChecking ? '#fbbf24' : ollamaConnected ? '#4ade80' : '#f87171',
            }}
            animate={{
              boxShadow: ollamaChecking
                ? ['0 0 4px rgba(251, 191, 36, 0.4)', '0 0 8px rgba(251, 191, 36, 0.8)', '0 0 4px rgba(251, 191, 36, 0.4)']
                : ollamaConnected
                  ? ['0 0 4px rgba(74, 222, 128, 0.4)', '0 0 8px rgba(74, 222, 128, 0.8)', '0 0 4px rgba(74, 222, 128, 0.4)']
                  : ['0 0 4px rgba(248, 113, 113, 0.4)', '0 0 8px rgba(248, 113, 113, 0.8)', '0 0 4px rgba(248, 113, 113, 0.4)'],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        <div>
          <h1 className="text-white font-semibold text-sm flex items-center gap-2">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Tara
            </span>
            <motion.span
              className="text-[10px] px-2 py-0.5 rounded-full border"
              style={{
                borderColor: `${glowColor}50`,
                color: glowColor,
                background: `${glowColor}10`,
              }}
            >
              {relationshipTitles[Math.min(relationshipLevel - 1, 9)]}
            </motion.span>
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            {ollamaChecking ? (
              <>
                <Loader2 size={10} className="text-yellow-400 animate-spin" />
                <span>Connecting to local AI...</span>
              </>
            ) : ollamaConnected ? (
              <>
                <Wifi size={10} className="text-green-400" />
                <span>Local AI Running</span>
              </>
            ) : (
              <>
                <WifiOff size={10} className="text-red-400" />
                <span>Ollama Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <motion.div
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(236, 72, 153, 0.1)',
            border: '1px solid rgba(236, 72, 153, 0.2)',
          }}
          whileHover={{ scale: 1.05 }}
        >
          <Heart size={12} className="text-pink-400" fill="currentColor" />
          <span className="text-xs text-pink-300/80">Lv.{relationshipLevel}</span>
        </motion.div>

        <motion.div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium"
          style={{
            background: ollamaConnected ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
            border: `1px solid ${ollamaConnected ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`,
            color: ollamaConnected ? 'rgba(74, 222, 128, 0.8)' : 'rgba(248, 113, 113, 0.8)',
          }}
          whileHover={{ scale: 1.05 }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: ollamaConnected ? '#4ade80' : '#f87171',
              boxShadow: ollamaConnected ? '0 0 6px rgba(74, 222, 128, 0.6)' : '0 0 6px rgba(248, 113, 113, 0.6)',
            }}
          />
          {ollamaConnected ? 'Local AI' : 'Offline'}
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-xl text-white/40 hover:text-white/80 transition-colors"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Settings size={16} />
        </motion.button>
      </div>
    </motion.header>
  );
}
