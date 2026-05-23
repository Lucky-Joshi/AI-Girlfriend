'use client';

import { motion } from 'framer-motion';
import { Message } from '@/types';
import { getEmotionColor } from '@/lib/emotion/engine';
import { marked } from 'marked';
import { useEffect, useState, useMemo } from 'react';

interface MessageBubbleProps {
  message: Message;
  index: number;
}

export default function MessageBubble({ message, index }: MessageBubbleProps) {
  const [renderedContent, setRenderedContent] = useState('');
  const isUser = message.role === 'user';
  const emotionColor = useMemo(
    () => (message.emotion ? getEmotionColor(message.emotion) : isUser ? '#00CED1' : '#A855F7'),
    [message.emotion, isUser]
  );

  useEffect(() => {
    if (message.content) {
      let cancelled = false;
      const render = async () => {
        const html = await marked(message.content);
        if (!cancelled) setRenderedContent(html);
      };
      render();
      return () => { cancelled = true; };
    }
  }, [message.content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.35,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center mr-2 mt-1 flex-shrink-0 shadow-lg shadow-cyan-500/20">
          <span className="text-xs">🌸</span>
        </div>
      )}

      <div
        className={`max-w-[75%] md:max-w-[65%] px-4 py-3 rounded-2xl transition-all duration-300 ${
          isUser
            ? 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-400/20 rounded-br-md'
            : 'bg-white/[0.03] border border-white/10 rounded-bl-md'
        }`}
        style={{
          boxShadow: isUser
            ? `0 4px 20px rgba(0, 206, 209, 0.08)`
            : `0 4px 20px rgba(168, 85, 247, 0.04)`,
        }}
      >
        {!isUser && message.emotion && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: emotionColor }}
              animate={{
                boxShadow: [`0 0 4px ${emotionColor}`, `0 0 8px ${emotionColor}`, `0 0 4px ${emotionColor}`],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[10px] text-white/30 capitalize">{message.emotion}</span>
          </div>
        )}
        <div
          className="text-sm text-white/85 leading-relaxed prose prose-sm prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
        <div className={`text-[10px] mt-2 ${isUser ? 'text-cyan-300/30' : 'text-white/20'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}
