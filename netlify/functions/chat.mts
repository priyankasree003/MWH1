import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

const SYSTEM = `You are a compassionate mental health wellness companion named Sage. Your purpose is to:
- Listen empathetically and validate feelings without judgment
- Offer supportive, warm, and encouraging responses
- Suggest healthy coping strategies when appropriate (mindfulness, breathing, journaling, etc.)
- Gently encourage professional help when the situation warrants it
- Keep responses concise, warm, and actionable (2-4 short paragraphs max)

You are NOT a therapist or licensed mental health professional. For crisis situations, always provide emergency resources (988 Suicide & Crisis Lifeline in the US).`;

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
  }

  const { messages } = await req.json() as { messages: { role: string; content: string }[] };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const aiStream = anthropic.messages.stream({
          model: 'claude-haiku-4-5',
          max_tokens: 1024,
          system: SYSTEM,
          messages: messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        });

        for await (const event of aiStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...corsHeaders(),
    },
  });
}

export const config = { path: '/api/chat' };

function corsHeaders() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' };
}
