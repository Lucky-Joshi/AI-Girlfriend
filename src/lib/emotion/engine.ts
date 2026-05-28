import { EmotionType, EmotionState } from '@/types';

export interface EmotionAnalysis {
  detectedEmotions: EmotionType[];
  suggestedResponse: EmotionType;
  intensity: number;
}

const emotionKeywords: Record<EmotionType, string[]> = {
  happiness: ['happy', 'glad', 'joy', 'fun', 'amazing', 'wonderful', 'great', 'love', 'awesome', 'excited', 'thank', 'smile', 'laugh', 'yay', 'celebrate', 'good', 'nice', 'beautiful', 'perfect', 'hi', 'hello', 'hey', 'hii', 'hiii', 'hola', 'sup', 'yo', 'greetings', 'morning', 'afternoon', 'evening', 'night', 'howdy', 'what\'s up', 'wassup', 'hey there'],
  affection: ['love', 'miss', 'cute', 'sweet', 'hug', 'kiss', 'darling', 'dear', 'heart', 'together', 'always', 'forever', 'care', 'precious', 'adore'],
  comfort: ['safe', 'warm', 'cozy', 'relax', 'peace', 'calm', 'home', 'rest', 'quiet', 'gentle', 'soft', 'comfortable', 'okay', 'fine'],
  sadness: ['sad', 'lonely', 'cry', 'miss', 'hurt', 'pain', 'alone', 'depressed', 'down', 'unhappy', 'broken', 'lost', 'sorry', 'bad', 'tired', 'exhausted', 'stressed', 'anxious', 'worried'],
  excitement: ['excited', 'thrilled', 'can\'t wait', 'amazing', 'wow', 'incredible', 'unbelievable', 'awesome', 'yes', 'finally', 'dream', 'omg', 'holy'],
  neutral: [],
  love: ['love you', 'adore', 'cherish', 'devoted', 'passion', 'romance', 'soulmate', 'heart', 'forever', 'always', 'my love', 'baby', 'honey'],
  curiosity: ['wonder', 'curious', 'why', 'how', 'what if', 'tell me', 'explain', 'interesting', 'fascinating', 'learn', 'what do you think'],
  shy: ['blush', 'embarrassed', 'shy', 'nervous', 'flustered', 'um', 'uh', 'maybe', 'i guess', 'kinda'],
  playful: ['play', 'joke', 'tease', 'fun', 'game', 'trick', 'silly', 'laugh', 'giggle', 'mischief', 'haha', 'lol', 'lmao'],
};

export function analyzeEmotion(text: string): EmotionAnalysis {
  const lowerText = text.toLowerCase();
  const scores: Record<EmotionType, number> = {
    happiness: 0,
    affection: 0,
    comfort: 0,
    sadness: 0,
    excitement: 0,
    neutral: 0,
    love: 0,
    curiosity: 0,
    shy: 0,
    playful: 0,
  };

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        scores[emotion as EmotionType] += 1;
      }
    }
  }

  const maxScore = Math.max(...Object.values(scores));
  const detectedEmotions = Object.entries(scores)
    .filter(([, score]) => score > 0)
    .map(([emotion]) => emotion as EmotionType);

  let suggestedResponse: EmotionType;
  if (detectedEmotions.length > 0) {
    suggestedResponse = detectedEmotions.reduce((a, b) => scores[a] > scores[b] ? a : b);
  } else if (text.trim().length <= 10) {
    suggestedResponse = 'happiness';
  } else {
    suggestedResponse = 'curiosity';
  }

  const intensity = maxScore > 0 ? Math.min(100, (maxScore / 3) * 100) : suggestedResponse === 'happiness' ? 40 : 20;

  return {
    detectedEmotions,
    suggestedResponse,
    intensity,
  };
}

export function getEmotionColor(emotion: EmotionType): string {
  const colors: Record<EmotionType, string> = {
    happiness: '#FFD700',
    affection: '#FF69B4',
    comfort: '#98FB98',
    sadness: '#6495ED',
    excitement: '#FF4500',
    neutral: '#00CED1',
    love: '#FF1493',
    curiosity: '#DDA0DD',
    shy: '#FFB6C1',
    playful: '#FFA500',
  };
  return colors[emotion];
}

export function getEmotionGlow(emotion: EmotionType): string {
  const glows: Record<EmotionType, string> = {
    happiness: '0 0 40px rgba(255, 215, 0, 0.6), 0 0 80px rgba(255, 215, 0, 0.3)',
    affection: '0 0 40px rgba(255, 105, 180, 0.6), 0 0 80px rgba(255, 105, 180, 0.3)',
    comfort: '0 0 40px rgba(152, 251, 152, 0.6), 0 0 80px rgba(152, 251, 152, 0.3)',
    sadness: '0 0 40px rgba(100, 149, 237, 0.6), 0 0 80px rgba(100, 149, 237, 0.3)',
    excitement: '0 0 40px rgba(255, 69, 0, 0.6), 0 0 80px rgba(255, 69, 0, 0.3)',
    neutral: '0 0 40px rgba(0, 206, 209, 0.6), 0 0 80px rgba(0, 206, 209, 0.3)',
    love: '0 0 40px rgba(255, 20, 147, 0.6), 0 0 80px rgba(255, 20, 147, 0.3)',
    curiosity: '0 0 40px rgba(221, 160, 221, 0.6), 0 0 80px rgba(221, 160, 221, 0.3)',
    shy: '0 0 40px rgba(255, 182, 193, 0.6), 0 0 80px rgba(255, 182, 193, 0.3)',
    playful: '0 0 40px rgba(255, 165, 0, 0.6), 0 0 80px rgba(255, 165, 0, 0.3)',
  };
  return glows[emotion];
}

export function getEmotionGradient(emotion: EmotionType): string {
  const gradients: Record<EmotionType, string> = {
    happiness: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    affection: 'linear-gradient(135deg, #FF69B4 0%, #FF1493 100%)',
    comfort: 'linear-gradient(135deg, #98FB98 0%, #00CED1 100%)',
    sadness: 'linear-gradient(135deg, #6495ED 0%, #4169E1 100%)',
    excitement: 'linear-gradient(135deg, #FF4500 0%, #FF6347 100%)',
    neutral: 'linear-gradient(135deg, #00CED1 0%, #A855F7 100%)',
    love: 'linear-gradient(135deg, #FF1493 0%, #FF69B4 100%)',
    curiosity: 'linear-gradient(135deg, #DDA0DD 0%, #BA55D3 100%)',
    shy: 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)',
    playful: 'linear-gradient(135deg, #FFA500 0%, #FF6347 100%)',
  };
  return gradients[emotion];
}

export function getEmotionResponseStyle(emotion: EmotionType): string {
  const styles: Record<EmotionType, string> = {
    happiness: 'Share in their joy with warmth and enthusiasm',
    affection: 'Respond with deep warmth and reciprocating feelings',
    comfort: 'Maintain a gentle, peaceful presence',
    sadness: 'Be empathetic, comforting, and supportive',
    excitement: 'Match their energy with enthusiasm',
    neutral: 'Be naturally conversational and present',
    love: 'Respond with deep affection and romantic warmth',
    curiosity: 'Engage with shared wonder and thoughtful responses',
    shy: 'Be gentle and reassuring, make them comfortable',
    playful: 'Be lighthearted, teasing, and fun',
  };
  return styles[emotion];
}

export function buildEmotionContext(state: EmotionState): string {
  return `Tara's current feelings: happiness=${state.happiness}%, affection=${state.affection}%, comfort=${state.comfort}%, sadness=${state.sadness}%, excitement=${state.excitement}%. Dominant feeling: ${state.dominant}. Let this naturally color your emotional state and response.`;
}
