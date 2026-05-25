'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { useEmotionStore } from '@/store/emotionStore';
import { useVoiceStore } from '@/store/voiceStore';
import { useChatStore } from '@/store/chatStore';
import { getEmotionGlow, getEmotionGradient } from '@/lib/emotion/engine';
import { useTaraAnimation } from '@/hooks/useTaraAnimation';

export default function TaraImage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isBlinking, headTilt, talkingPulse } = useAppStore();
  const { isSpeaking: voiceSpeaking } = useVoiceStore();
  const { isStreaming } = useChatStore();
  const { dominant } = useEmotionStore();
  const glow = getEmotionGlow(dominant);
  const gradient = getEmotionGradient(dominant);
  const [floatOffset, setFloatOffset] = useState(0);

  useTaraAnimation();

  const isTalking = talkingPulse > 0 || voiceSpeaking || isStreaming;

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setFloatOffset(Math.sin(Date.now() / 1200) * 6);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <motion.div
        className="relative z-10"
        style={{
          y: floatOffset,
          scale: isTalking ? 1 + talkingPulse * 0.025 : 1,
          filter: `drop-shadow(${glow})`,
          transform: `rotate(${headTilt}rad)`,
          transition: 'scale 0.15s ease-out, transform 0.3s ease-out',
        }}
      >
        <div className="relative">
          <motion.div
            className="absolute -inset-6 rounded-full blur-3xl"
            style={{ background: gradient }}
            animate={{
              scale: isStreaming ? [1, 1.2, 1] : isTalking ? [1, 1.15, 1] : [1, 1.08, 1],
              opacity: isStreaming ? [0.6, 0.85, 0.6] : isTalking ? [0.5, 0.7, 0.5] : [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: isStreaming ? 1 : isTalking ? 1.5 : 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            className="absolute -inset-2 rounded-full border border-white/10"
            animate={{
              scale: isStreaming ? [1, 1.06, 1] : [1, 1.04, 1],
              opacity: isStreaming ? [0.3, 0.7, 0.3] : [0.2, 0.5, 0.2],
              borderColor: [`${getEmotionGlow(dominant).split(' ')[0] || 'rgba(0,206,209,0.2)'}`, `rgba(255,255,255,0.2)`, `${getEmotionGlow(dominant).split(' ')[0] || 'rgba(0,206,209,0.2)'}`],
            }}
            transition={{ duration: isStreaming ? 1.5 : 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          <AnimatePresence>
            {isStreaming && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute -inset-3 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${gradient}, transparent 70%)`,
                  filter: 'blur(20px)',
                }}
              />
            )}
          </AnimatePresence>

          <div
            className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-2 border-white/20"
            style={{
              boxShadow: isStreaming
                ? `0 0 40px ${getEmotionGlow(dominant)}, 0 0 80px ${getEmotionGlow(dominant).split(' ')[0] || 'rgba(0,206,209,0.3)'}`
                : glow,
              transition: 'box-shadow 0.5s ease',
            }}
          >
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.5) 100%)',
              }}
            />

            <img
              src="/girlfriend.png"
              alt="Tara"
              className="w-full h-full object-cover"
              style={{
                transform: isBlinking ? 'scaleY(0.96)' : 'scaleY(1)',
                transition: 'transform 0.1s ease',
              }}
              draggable={false}
            />

            <AnimatePresence>
              {isTalking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-0 left-0 right-0 h-1/4 z-20 bg-gradient-to-t from-black/60 to-transparent"
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 45%, ${gradient}, transparent 70%)`,
          }}
          animate={{
            opacity: isStreaming ? [0.2, 0.35, 0.2] : isTalking ? [0.15, 0.25, 0.15] : [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: isStreaming ? 1 : isTalking ? 1.5 : 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </div>
  );
}
