import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
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
  'http://localhost:5173',
  'http://localhost:3000',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
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

// ── Serve built client (single-origin) ────────────────────────────────────────
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
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
