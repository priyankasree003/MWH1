import { getDb } from '../../db/index.ts';
import { feedback } from '../../db/schema.ts';
import { desc } from 'drizzle-orm';

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const db = getDb();

  if (req.method === 'POST') {
    const body = await req.json();
    const { text, sentiment: s, score, emotions } = body;
    if (!text?.trim()) {
      return new Response(JSON.stringify({ error: 'Missing text' }), { status: 400, headers: jsonHeaders() });
    }
    const [row] = await db.insert(feedback).values({
      text,
      sentiment: s ?? null,
      score: score ?? null,
      emotions: emotions ? JSON.stringify(emotions) : null,
    }).returning();
    return new Response(JSON.stringify(row), { headers: jsonHeaders() });
  }

  if (req.method === 'GET') {
    const rows = await db.select().from(feedback).orderBy(desc(feedback.created_at)).limit(50);
    return new Response(JSON.stringify(rows), { headers: jsonHeaders() });
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
}

export const config = { path: '/api/feedback' };

function corsHeaders() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' };
}
function jsonHeaders() {
  return { 'Content-Type': 'application/json', ...corsHeaders() };
}
