import { useCallback, useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useEmotionStore } from '@/store/emotionStore';
import { useAppStore } from '@/store/appStore';
import { useVoiceStore } from '@/store/voiceStore';
import { EmotionState, Message } from '@/types';
import { analyzeEmotion } from '@/lib/emotion/engine';
import { speak } from '@/lib/voice/utils';
import { getRecentMessages } from '@/lib/memory/utils';
import { v4 as uuidv4 } from 'uuid';

export function useChat() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const messageHistoryRef = useRef<Message[]>([]);
  const hasLoadedHistoryRef = useRef(false);
  const { addMessage, setMessages, setStreaming, setLoading, updateStreamingContent, setError } = useChatStore();
  const { updateEmotions } = useEmotionStore();
  const { setStreaming: setAppStreaming } = useAppStore();
  const { isSpeaking } = useVoiceStore();

  const isTrackedEmotion = (
    emotion: string
  ): emotion is keyof Omit<EmotionState, 'dominant'> =>
    ['happiness', 'affection', 'comfort', 'sadness', 'excitement'].includes(emotion);

  useEffect(() => {
    if (hasLoadedHistoryRef.current) return;
    hasLoadedHistoryRef.current = true;

    let cancelled = false;

    const loadHistory = async () => {
      const recentMessages = await getRecentMessages(50);
      if (cancelled || recentMessages.length === 0) return;

      const hydratedMessages: Message[] = recentMessages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.createdAt,
        emotion: message.emotion as Message['emotion'],
      }));

      messageHistoryRef.current = hydratedMessages;
      setMessages(hydratedMessages);
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [setMessages]);

  const sendMessage = useCallback(async (messageText: string) => {
    const text = messageText.trim();
    if (!text) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    messageHistoryRef.current = [...messageHistoryRef.current, userMessage];

    setLoading(true);
    setStreaming(true);
    setAppStreaming(true);
    updateStreamingContent('');

    try {
      const emotionAnalysis = analyzeEmotion(text);
      const state = useEmotionStore.getState();
      const boost = 15 + emotionAnalysis.intensity * 0.3;

      const emotionUpdates: Partial<Record<keyof Omit<EmotionState, 'dominant'>, number>> = {};

      if (isTrackedEmotion(emotionAnalysis.suggestedResponse)) {
        emotionUpdates[emotionAnalysis.suggestedResponse] = Math.min(
          100,
          (state[emotionAnalysis.suggestedResponse] || 50) + boost
        );
      }

      if (emotionAnalysis.suggestedResponse === 'happiness' || emotionAnalysis.suggestedResponse === 'excitement') {
        emotionUpdates.affection = Math.min(100, (state.affection || 30) + 5);
      }

      if (emotionAnalysis.suggestedResponse === 'sadness') {
        emotionUpdates.comfort = Math.max(0, (state.comfort || 60) - 10);
        emotionUpdates.affection = Math.min(100, (state.affection || 30) + 8);
      }

      updateEmotions(emotionUpdates);

      const apiMessages = messageHistoryRef.current.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          emotionState: { dominant: state.dominant },
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('Ollama server is not running. Start Ollama to chat with Tara.');
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Server error ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                updateStreamingContent(fullContent);
              }
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (error: unknown) {
              if (error instanceof Error && error.message !== 'Unexpected token') throw error;
            }
          }
        }
      }

      if (fullContent) {
        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: fullContent,
          timestamp: new Date(),
          emotion: emotionAnalysis.suggestedResponse,
        };

        addMessage(assistantMessage);
        messageHistoryRef.current = [...messageHistoryRef.current, assistantMessage];

        if (fullContent && !isSpeaking) {
          speak(fullContent);
        }
      }
    } catch (error: unknown) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        console.error('Chat error:', error);
        setError(error instanceof Error ? error.message : 'Something went wrong...');
      }
    } finally {
      updateStreamingContent('');
      setStreaming(false);
      setAppStreaming(false);
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [addMessage, setStreaming, setLoading, updateStreamingContent, setError, updateEmotions, setAppStreaming, isSpeaking]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    updateStreamingContent('');
    setStreaming(false);
    setAppStreaming(false);
    setLoading(false);
  }, [setStreaming, setLoading, setAppStreaming, updateStreamingContent]);

  const clearHistory = useCallback(() => {
    const run = async () => {
      try {
        const response = await fetch('/api/chat', {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || `Server error ${response.status}`);
        }

        messageHistoryRef.current = [];
        setMessages([]);
      } catch (error) {
        console.error('Clear chat error:', error);
        setError(error instanceof Error ? error.message : 'Failed to clear chat history');
      }
    };

    void run();
  }, [setMessages, setError]);

  return {
    sendMessage,
    stopGeneration,
    clearHistory,
  };
}
