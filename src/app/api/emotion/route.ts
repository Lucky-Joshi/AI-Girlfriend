import { analyzeEmotion, getEmotionResponseStyle } from '@/lib/emotion/engine';

export async function POST(req: Request) {
  try {
    const { text, currentEmotions } = await req.json();

    if (!text) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    const analysis = analyzeEmotion(text);

    const updatedEmotions = { ...currentEmotions };
    if (analysis.detectedEmotions.length > 0) {
      const primaryEmotion = analysis.suggestedResponse;
      const boost = analysis.intensity * 0.3;

      if (primaryEmotion in updatedEmotions) {
        updatedEmotions[primaryEmotion] = Math.min(
          100,
          (updatedEmotions[primaryEmotion] || 50) + boost
        );
      }

      if (primaryEmotion === 'sadness') {
        updatedEmotions.comfort = Math.max(0, (updatedEmotions.comfort || 60) - boost * 0.5);
        updatedEmotions.affection = Math.min(100, (updatedEmotions.affection || 30) + boost * 0.3);
      }

      if (primaryEmotion === 'happiness' || primaryEmotion === 'excitement') {
        updatedEmotions.happiness = Math.min(100, (updatedEmotions.happiness || 50) + boost * 0.5);
      }
    }

    const responseStyle = getEmotionResponseStyle(analysis.suggestedResponse);

    return Response.json({
      analysis,
      updatedEmotions,
      responseStyle,
    });
  } catch (error) {
    console.error('Emotion API error:', error);
    return Response.json({ error: 'Failed to analyze emotion' }, { status: 500 });
  }
}
