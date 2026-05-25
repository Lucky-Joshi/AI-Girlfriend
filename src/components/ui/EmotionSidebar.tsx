'use client';

import { motion } from 'framer-motion';
import { useEmotionStore } from '@/store/emotionStore';
import { getEmotionColor } from '@/lib/emotion/engine';
import { Heart, Sparkles, Zap, Droplets, Brain } from 'lucide-react';

const emotionConfig = [
  { name: 'Happiness', key: 'happiness', icon: Sparkles },
  { name: 'Affection', key: 'affection', icon: Heart },
  { name: 'Comfort', key: 'comfort', icon: Droplets },
  { name: 'Sadness', key: 'sadness', icon: Droplets },
  { name: 'Excitement', key: 'excitement', icon: Zap },
];

export default function EmotionSidebar() {
  const { happiness, affection, comfort, sadness, excitement, dominant } = useEmotionStore();

  const emotionValues: Record<string, number> = { happiness, affection, comfort, sadness, excitement };

  const emotions = emotionConfig.map((e) => ({
    ...e,
    value: emotionValues[e.key] || 0,
  }));

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="hidden lg:flex w-64 flex-col border-r border-white/5"
      style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="p-4 border-b border-white/5">
        <h2 className="text-white/60 font-medium text-xs flex items-center gap-2 mb-4 uppercase tracking-wider">
          <Brain size={14} className="text-cyan-400" />
          Tara&apos;s Feelings
        </h2>

        <div className="space-y-3">
          {emotions.map((emotion) => {
            const color = getEmotionColor(emotion.key as any);
            const isDominant = dominant === emotion.key;
            const Icon = emotion.icon;

            return (
              <motion.div
                key={emotion.name}
                className="space-y-1.5"
                animate={isDominant ? { scale: 1.02 } : { scale: 1 }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50 flex items-center gap-1.5">
                    <Icon size={12} style={{ color }} />
                    {emotion.name}
                  </span>
                  <motion.span style={{ color }} className="font-medium">
                    {Math.round(emotion.value)}%
                  </motion.span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${emotion.value}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 p-4">
        <div
          className="p-3 rounded-xl text-center"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Dominant Mood</p>
          <motion.p
            className="text-sm font-medium capitalize"
            style={{ color: getEmotionColor(dominant) }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {dominant}
          </motion.p>
        </div>
      </div>

      <div className="p-4 border-t border-white/5">
        <div
          className="p-3 rounded-xl text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(0,206,209,0.05), rgba(168,85,247,0.05))',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <p className="text-[10px] text-white/25">Powered by NVIDIA</p>
        </div>
      </div>
    </motion.aside>
  );
}
