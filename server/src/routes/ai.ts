import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { chatResponse, getNextStep } from '../services/aiChat';
import { getDb } from '../db/schema';

const router = Router();

const chatSchema = z.object({
  query: z.string().min(1).max(500),
});

router.post('/chat', validate(chatSchema), (req: Request, res: Response) => {
  void (async () => {
    const { query } = req.body as { query: string };
    try {
      const result = await chatResponse(query);
      res.json({ success: true, ...result });
    } catch {
      res.json({ success: true, answer: 'Sorry, I had trouble just then. Please try again, or use the Contact page.', url: '/contact' });
    }
  })();
});

const nextStepSchema = z.object({
  lifeStage: z.enum(['new', 'growing', 'serving', 'family']),
  need: z.enum(['community', 'prayer', 'counselling', 'learning']),
});

router.post('/next-step', validate(nextStepSchema), (req: Request, res: Response) => {
  const { lifeStage, need } = req.body as z.infer<typeof nextStepSchema>;
  const result = getNextStep(lifeStage, need);
  res.json({ success: true, ...result });
});

// Latest YouTube video via RSS (no API key needed)
router.get('/latest-video', async (_req: Request, res: Response) => {
  const channelId = process.env.YOUTUBE_CHANNEL_ID?.trim();
  if (!channelId) {
    return res.json({ success: true, videoId: null, channelId: null });
  }
  try {
    const rssRes = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) }
    );
    const xml = await rssRes.text();
    const match = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const videoId = match ? match[1] : null;
    res.json({ success: true, videoId, channelId });
  } catch {
    res.json({ success: true, videoId: null, channelId });
  }
});

// Public sermon search — weighted scoring
router.get('/sermons', (req: Request, res: Response) => {
  const { q } = req.query as { q?: string };
  const db = getDb();
  const rows = db.prepare('SELECT * FROM sermons ORDER BY date DESC').all() as Array<Record<string, unknown>>;

  const parsed = rows.map(s => ({ ...s, scriptures: JSON.parse(String(s.scriptures)) }));

  if (!q || !q.trim()) {
    return res.json({ success: true, data: parsed });
  }

  const terms = q.toLowerCase().trim().split(/\s+/);

  function score(s: Record<string, unknown>): number {
    let total = 0;
    for (const term of terms) {
      if (String(s.title ?? '').toLowerCase().includes(term)) total += 3;
      if (String(s.topic ?? '').toLowerCase().includes(term)) total += 2;
      if (String(s.speaker ?? '').toLowerCase().includes(term)) total += 1.5;
      if (String(s.summary ?? '').toLowerCase().includes(term)) total += 1;
      const scriptures = (s.scriptures as string[]) ?? [];
      if (scriptures.some((sc: string) => sc.toLowerCase().includes(term))) total += 1;
    }
    return total;
  }

  const scored = parsed
    .map(s => ({ ...s, _score: score(s) }))
    .filter(s => s._score > 0)
    .sort((a, b) => b._score - a._score)
    .map(({ _score: _, ...s }) => s);

  res.json({ success: true, data: scored });
});

export default router;
