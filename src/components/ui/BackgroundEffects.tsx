'use client';

import { motion } from 'framer-motion';
import { useEmotionStore } from '@/store/emotionStore';
import { getEmotionColor } from '@/lib/emotion/engine';

export default function BackgroundEffects() {
  const { dominant } = useEmotionStore();
  const glowColor = getEmotionColor(dominant);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            `radial-gradient(ellipse at 20% 50%, ${glowColor}08 0%, transparent 50%)`,
            `radial-gradient(ellipse at 80% 50%, ${glowColor}08 0%, transparent 50%)`,
            `radial-gradient(ellipse at 50% 20%, ${glowColor}08 0%, transparent 50%)`,
            `radial-gradient(ellipse at 20% 50%, ${glowColor}08 0%, transparent 50%)`,
          ],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `
          linear-gradient(90deg, ${glowColor} 1px, transparent 1px),
          linear-gradient(0deg, ${glowColor} 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />

      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[100px]"
        style={{ background: `${glowColor}10` }}
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[80px]"
        style={{ background: `${glowColor}08` }}
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px]"
        style={{ background: `${glowColor}05` }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
