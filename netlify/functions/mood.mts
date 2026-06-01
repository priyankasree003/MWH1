import { getDb } from '../../db/index.ts';
import { moodEntries } from '../../db/schema.ts';
import { desc } from 'drizzle-orm';

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const db = getDb();

  if (req.method === 'POST') {
    const { mood_score, notes } = await req.json();
    if (!mood_score || mood_score < 1 || mood_score > 10) {
      return new Response(JSON.stringify({ error: 'mood_score must be 1-10' }), { status: 400, headers: jsonHeaders() });
    }
    const [row] = await db.insert(moodEntries).values({ mood_score, notes: notes ?? null }).returning();
    return new Response(JSON.stringify(row), { headers: jsonHeaders() });
  }

  if (req.method === 'GET') {
    const rows = await db.select().from(moodEntries).orderBy(desc(moodEntries.created_at)).limit(30);
    return new Response(JSON.stringify(rows), { headers: jsonHeaders() });
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
}

export const config = { path: '/api/mood' };

function corsHeaders() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' };
}
function jsonHeaders() {
  return { 'Content-Type': 'application/json', ...corsHeaders() };
}
