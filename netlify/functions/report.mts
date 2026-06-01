import Anthropic from '@anthropic-ai/sdk';
import { getDb } from '../../db/index.ts';
import { feedback, moodEntries } from '../../db/schema.ts';
import { desc } from 'drizzle-orm';

const anthropic = new Anthropic();

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const db = getDb();
  const [recentFeedback, recentMoods] = await Promise.all([
    db.select().from(feedback).orderBy(desc(feedback.created_at)).limit(20),
    db.select().from(moodEntries).orderBy(desc(moodEntries.created_at)).limit(30),
  ]);

  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
  let scoreSum = 0;
  for (const f of recentFeedback) {
    const s = f.sentiment as keyof typeof sentimentCounts;
    if (s in sentimentCounts) sentimentCounts[s]++;
    scoreSum += f.score ?? 0.5;
  }
  const avgSentiment = recentFeedback.length ? scoreSum / recentFeedback.length : 0.5;
  const avgMood = recentMoods.length
    ? recentMoods.reduce((sum, m) => sum + m.mood_score, 0) / recentMoods.length
    : null;

  const entrySummary = recentFeedback
    .map(f => `[${f.sentiment ?? 'unknown'}] ${f.text.slice(0, 120)}`)
    .join('\n') || 'No journal entries yet.';

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Based on these recent mental health journal entries, generate a compassionate wellness report as a JSON object:
{
  "overall_wellness": "excellent"|"good"|"fair"|"needs_attention",
  "key_themes": ["theme1","theme2","theme3"],
  "strengths": ["strength1","strength2"],
  "areas_for_growth": ["area1","area2"],
  "recommendations": ["tip1","tip2","tip3","tip4"],
  "message": "Warm 2-sentence encouraging message for the user."
}

Journal entries:
${entrySummary}

Return ONLY the JSON object, no other text.`
    }],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '{}';
  let insights: Record<string, unknown>;
  try {
    insights = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? raw);
  } catch {
    insights = {
      overall_wellness: 'good',
      key_themes: ['self-reflection', 'growth'],
      strengths: ['showing up for yourself'],
      areas_for_growth: ['consistency'],
      recommendations: ['Practice daily mindfulness', 'Keep journaling regularly'],
      message: 'Keep taking care of yourself. Every small step matters.',
    };
  }

  return new Response(JSON.stringify({
    stats: {
      total_entries: recentFeedback.length,
      avg_sentiment_score: avgSentiment,
      sentiment_distribution: sentimentCounts,
      avg_mood: avgMood,
      recent_moods: recentMoods.slice(0, 7).map(m => ({ score: m.mood_score, date: m.created_at })),
    },
    insights,
  }), { headers: jsonHeaders() });
}

export const config = { path: '/api/report', method: 'GET' };

function corsHeaders() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' };
}
function jsonHeaders() {
  return { 'Content-Type': 'application/json', ...corsHeaders() };
}
