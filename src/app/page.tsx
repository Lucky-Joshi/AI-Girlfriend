'use client';

import { AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/store/appStore';
import TopBar from '@/components/ui/TopBar';
import EmotionSidebar from '@/components/ui/EmotionSidebar';
import ChatInterface from '@/components/chat/ChatInterface';
import BackgroundEffects from '@/components/ui/BackgroundEffects';
import FloatingParticles from '@/components/ui/FloatingParticles';
import RainEffect from '@/components/ui/RainEffect';
import VoiceControls from '@/components/voice/VoiceControls';
import GreetingAnimation from '@/components/ui/GreetingAnimation';

const TaraImage = dynamic(() => import('@/components/tara/TaraImage'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 animate-pulse border border-white/10" />
    </div>
  ),
});

export default function Home() {
  const { showGreeting, isLoaded } = useAppStore();

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#0a0a0f] text-white relative">
      <BackgroundEffects />
      <FloatingParticles />
      <RainEffect />

      <AnimatePresence>
        {showGreeting && <GreetingAnimation />}
      </AnimatePresence>

      <div
        className={`relative z-10 h-full flex flex-col transition-opacity duration-1000 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <TopBar />

        <div className="flex-1 flex overflow-hidden">
          <EmotionSidebar />

          <div className="flex-1 flex flex-col lg:flex-row">
            <div className="hidden lg:flex lg:w-[42%] xl:w-[38%] relative">
              <div className="w-full h-full">
                <TaraImage />
              </div>
            </div>

            <div className="flex-1 flex flex-col" style={{
              background: 'linear-gradient(90deg, rgba(0,0,0,0.2) 0%, transparent 5%)',
              borderLeft: '1px solid rgba(255,255,255,0.03)',
            }}>
              <div className="lg:hidden p-2 border-b border-white/5">
                <div className="h-24 rounded-xl overflow-hidden border border-white/5">
                  <TaraImage />
                </div>
              </div>

              <div className="hidden lg:flex items-center justify-between px-4 py-1.5 border-b border-white/5">
                <VoiceControls />
                <p className="text-[10px] text-white/20">Enter to send, Shift+Enter for new line</p>
              </div>

              <div className="flex-1 overflow-hidden">
                <ChatInterface />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
