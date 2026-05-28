import { useVoiceStore } from '@/store/voiceStore';

let recognition: SpeechRecognition | null = null;
let synthesis: SpeechSynthesis | null = null;
let preferredVoice: SpeechSynthesisVoice | null = null;
let voicesInitialized = false;

const FEMALE_VOICE_HINTS = [
  'female',
  'woman',
  'girl',
  'samantha',
  'zira',
  'aria',
  'jenny',
  'ava',
  'emma',
  'susan',
  'serena',
  'joanna',
  'ivy',
  'karen',
  'moira',
  'sonia',
  'libby',
  'hazel',
  'allison',
  'luna',
  'raveena',
  'neural',
];

function getVoiceStore() {
  return useVoiceStore.getState();
}

function getSynthesis(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null;
  if (!synthesis) synthesis = window.speechSynthesis;
  return synthesis;
}

function refreshPreferredVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  preferredVoice = getPreferredVoice(synth) ?? null;
  return preferredVoice;
}

function initVoices(synth: SpeechSynthesis): void {
  if (voicesInitialized) return;

  voicesInitialized = true;
  refreshPreferredVoice(synth);

  const handleVoicesChanged = () => {
    refreshPreferredVoice(synth);
  };

  synth.addEventListener?.('voiceschanged', handleVoicesChanged);
  synth.onvoiceschanged = handleVoicesChanged;
}

function scoreVoice(voice: SpeechSynthesisVoice): number {
  const lowerName = voice.name.toLowerCase();
  let score = 0;

  if (voice.lang.toLowerCase().startsWith('en')) score += 10;
  if (voice.localService) score += 1;

  for (const hint of FEMALE_VOICE_HINTS) {
    if (lowerName.includes(hint)) {
      score += 8;
    }
  }

  if (lowerName.includes('male')) {
    score -= 10;
  }

  return score;
}

function getPreferredVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | undefined {
  const voices = synth.getVoices();
  if (voices.length === 0) return undefined;

  return [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
}

function stripStageDirections(text: string): string {
  return text
    .replace(/\*[^*]*\*/g, ' ')
    .replace(/_[^_]*_/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/^[\s"'`]+|[\s"'`]+$/g, ' ');
}

export function sanitizeSpeechText(text: string): string {
  const plainText = stripStageDirections(text)
    .replace(/[#>*~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return plainText;
}

export function initSpeechRecognition(): SpeechRecognition | null {
  if (typeof window === 'undefined') return null;

  const BrowserSpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!BrowserSpeechRecognition) {
    console.warn('Speech Recognition not supported in this browser');
    return null;
  }

  if (recognition) return recognition;

  recognition = new BrowserSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }

    getVoiceStore().setTranscript(transcript);
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    console.error('Speech recognition error:', event.error);
    const { setError, setListening } = getVoiceStore();
    setError(event.error);
    setListening(false);
  };

  recognition.onend = () => {
    getVoiceStore().setListening(false);
  };

  return recognition;
}

export function startListening(): void {
  if (!recognition) {
    recognition = initSpeechRecognition();
  }

  if (!recognition) return;

  try {
    const { setListening, setTranscript } = getVoiceStore();
    setListening(true);
    setTranscript('');
    recognition.start();
  } catch (error) {
    console.error('Failed to start listening:', error);
    getVoiceStore().setListening(false);
  }
}

export function stopListening(): void {
  if (!recognition) return;

  try {
    recognition.stop();
  } catch {
    // Already stopped.
  }

  getVoiceStore().setListening(false);
}

export function speak(text: string, onEnd?: () => void): void {
  const synth = getSynthesis();
  if (!synth) return;

  initVoices(synth);

  const spokenText = sanitizeSpeechText(text);
  if (!spokenText) return;

  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(spokenText);
  utterance.rate = 0.98;
  utterance.pitch = 1.22;
  utterance.volume = 1.0;

  const selectedVoice = preferredVoice ?? refreshPreferredVoice(synth);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;
  } else if (synth.getVoices().length === 0) {
    const retrySpeak = () => {
      synth.onvoiceschanged = null;
      preferredVoice = refreshPreferredVoice(synth);
      speak(spokenText, onEnd);
    };

    synth.onvoiceschanged = retrySpeak;
    window.setTimeout(() => {
      if (!preferredVoice) {
        retrySpeak();
      }
    }, 250);
    return;
  } else {
    utterance.lang = 'en-US';
  }

  utterance.onstart = () => {
    getVoiceStore().setSpeaking(true);
  };

  utterance.onend = () => {
    getVoiceStore().setSpeaking(false);
    onEnd?.();
  };

  utterance.onerror = () => {
    getVoiceStore().setSpeaking(false);
  };

  synth.speak(utterance);
}

export function stopSpeaking(): void {
  const synth = getSynthesis();
  if (!synth) return;

  synth.cancel();
  getVoiceStore().setSpeaking(false);
}

export function cleanup(): void {
  stopListening();
  stopSpeaking();
  recognition = null;
}
