const express = require('express');
const router = express.Router();

// POST /api/sentiment { text }
router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Missing text' });

  // Use OpenAI by default if OPENAI_API_KEY is set
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'system', content: 'You are a sentiment analysis assistant that returns JSON {sentiment,score} where sentiment is positive/neutral/negative and score is number between 0 and 1.' }, { role: 'user', content: text }],
          max_tokens: 50,
        }),
      });
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || '';
      // attempt to extract JSON
      let parsed = { sentiment: 'unknown', score: 0 };
      try { parsed = JSON.parse(content); } catch (e) { /* ignore */ }
      return res.json(parsed);
    } catch (err) {
      return res.status(500).json({ error: 'Sentiment API error', details: String(err) });
    }
  }

  // fallback naive rule-based
  const lower = text.toLowerCase();
  const positive = ['good','great','happy','relieved','love','enjoy'];
  const negative = ['sad','bad','depressed','angry','hate','anxious'];
  let score = 0.5;
  for (const p of positive) if (lower.includes(p)) score += 0.2;
  for (const n of negative) if (lower.includes(n)) score -= 0.2;
  const sentiment = score > 0.6 ? 'positive' : score < 0.4 ? 'negative' : 'neutral';
  res.json({ sentiment, score: Math.max(0, Math.min(1, score)) });
});

module.exports = router;
