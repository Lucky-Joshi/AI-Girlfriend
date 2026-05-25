'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';

const greetings = [
  'Hey there... ✨',
  'I\'ve been waiting for you~',
  '*smiles softly* Hi...',
];

export default function GreetingAnimation() {
  const [step, setStep] = useState(0);
  const setShowGreeting = useAppStore((s) => s.setShowGreeting);
  const setLoaded = useAppStore((s) => s.setLoaded);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 1600),
      setTimeout(() => setStep(3), 2800),
      setTimeout(() => {
        setShowGreeting(false);
        setLoaded(true);
      }, 4200),
    ];

    return () => timers.forEach(clearTimeout);
  }, [setShowGreeting, setLoaded]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f]"
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={step >= 0 ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <span className="text-4xl">🌸</span>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step >= 1 && (
            <motion.h1
              key="name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              Tara
            </motion.h1>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step >= 2 && (
            <motion.p
              key="greeting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-xl md:text-2xl text-white/70 font-light"
            >
              {greetings[Math.floor(Math.random() * greetings.length)]}
            </motion.p>
          )}
        </AnimatePresence>

        {step >= 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8"
          >
            <motion.div
              className="w-48 h-0.5 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              animate={{ scaleX: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
