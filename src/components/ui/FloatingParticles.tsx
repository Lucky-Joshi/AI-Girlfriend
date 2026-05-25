'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  color: string;
}

const COLORS = ['#00CED1', '#A855F7', '#FF1493', '#06B6D4', '#DDA0DD'];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 8,
    opacity: Math.random() * 0.4 + 0.1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));
}

export default function FloatingParticles() {
  const [mounted, setMounted] = useState(false);
  const particles = useMemo(() => generateParticles(40), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          animate={{
            y: [0, -80 - particle.id % 60, 0],
            x: [0, (particle.id % 40) - 20, 0],
            opacity: [particle.opacity, particle.opacity * 0.2, particle.opacity],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
