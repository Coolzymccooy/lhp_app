import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initDb } from './db/schema';
import { initWebPush } from './services/webPush';
import authRouter from './routes/auth';
import formsRouter from './routes/forms';
import adminRouter from './routes/admin';
import aiRouter from './routes/ai';

dotenv.config({ path: path.join(__dirname, '../../.env') });

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is required');
  process.exit(1);
}

const app = express();
const PORT = parseInt(process.env.PORT ?? '5000', 10);

const allowedOrigins = [
  process.env.CLIENT_URL ?? 'http://localhost:5173',
  'http://lighthousechurchburyrccg.co.uk',
  'https://lighthousechurchburyrccg.co.uk',
  'https://www.lighthousechurchburyrccg.co.uk',
  'http://localhost:5173',
  'http://localhost:3000',
  `http://localhost:${process.env.PORT ?? '5000'}`,
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin/no-origin and allow-listed origins with CORS headers.
    // For any other origin, deny CORS headers WITHOUT throwing — throwing here
    // would turn every cross-origin (and same-origin asset) request into a 500.
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/forms', formsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/ai', aiRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve built client (single-origin)
const clientDist = path.resolve(path.join(__dirname, '../../client/dist'));
const indexHtmlPath = path.join(clientDist, 'index.html');
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');

// Serve uploaded files BEFORE the SPA catch-all.
// In production set DATA_DIR to a persistent volume so uploads survive redeploys;
// locally this defaults to server/uploads (matches the gallery route's save dir).
const uploadsDir = process.env.DATA_DIR
  ? path.join(process.env.DATA_DIR, 'uploads')
  : path.join(__dirname, '../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

app.use(express.static(clientDist));

// SPA fallback: serve index.html for any route that hasn't been handled by static or API
app.use((_req, res) => {
  if (!res.headersSent) {
    res.type('html').send(indexHtmlContent);
  }
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Init DB + web push then start
initDb();
initWebPush();
app.listen(PORT, () => {
  console.log(`🚀 LHP Server running on http://localhost:${PORT}`);
});
