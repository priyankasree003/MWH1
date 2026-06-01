import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
  }

  const { text } = await req.json();
  if (!text?.trim()) {
    return new Response(JSON.stringify({ error: 'Missing text' }), { status: 400, headers: jsonHeaders() });
  }

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `Analyze the sentiment and emotions in this text. Respond ONLY with a valid JSON object using this exact format:
{"sentiment":"positive","score":0.8,"emotions":["hopeful","grateful"],"summary":"One empathetic sentence about how the person is feeling."}

Sentiment must be "positive", "neutral", or "negative".
Score is a float from 0.0 (very negative) to 1.0 (very positive), 0.5 is neutral.
Emotions is an array of 1-4 specific emotions detected.

Text to analyze: """${text}"""`
    }],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '{}';
  let parsed: { sentiment: string; score: number; emotions: string[]; summary: string };
  try {
    parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? raw);
  } catch {
    parsed = { sentiment: 'neutral', score: 0.5, emotions: [], summary: 'Unable to analyze sentiment.' };
  }

  return new Response(JSON.stringify(parsed), { headers: jsonHeaders() });
}

export const config = { path: '/api/sentiment' };

function corsHeaders() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' };
}
function jsonHeaders() {
  return { 'Content-Type': 'application/json', ...corsHeaders() };
}
