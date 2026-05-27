'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';

export function useTaraAnimation() {
  const frameRef = useRef<number | undefined>(undefined);
  const blinkTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const { setBlinking, setHeadTilt } = useAppStore();
  const isStreaming = useAppStore((s) => s.isStreaming);

  const triggerBlink = useCallback(() => {
    setBlinking(true);
    blinkTimeoutRef.current = setTimeout(() => {
      setBlinking(false);
      scheduleNextBlink();
    }, 120);
  }, [setBlinking]);

  const scheduleNextBlink = useCallback(() => {
    const delay = isStreaming ? 1500 + Math.random() * 2000 : 2500 + Math.random() * 3500;
    blinkTimeoutRef.current = setTimeout(triggerBlink, delay);
  }, [triggerBlink, isStreaming]);

  useEffect(() => {
    let lastHeadTilt = 0;
    let lastTalkingPulse = 0;

    const animate = () => {
      const time = Date.now() / 1000;
      const headTilt = Math.sin(time * 0.6) * 0.03;
      const talkingPulse = isStreaming ? Math.sin(time * 8) * 0.5 + 0.5 : 0;

      if (Math.abs(headTilt - lastHeadTilt) > 0.001) {
        setHeadTilt(headTilt);
        lastHeadTilt = headTilt;
      }

      useAppStore.setState({ talkingPulse });

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    scheduleNextBlink();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
    };
  }, [isStreaming, setHeadTilt, scheduleNextBlink]);
}
