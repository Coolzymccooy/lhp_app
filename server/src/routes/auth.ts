import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { getDb } from '../db/schema';
import { validate } from '../middleware/validate';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

router.post('/login', validate(loginSchema), (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const db = getDb();

  const admin = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email) as {
    id: string; email: string; password_hash: string; name: string; role: string;
  } | undefined;

  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    res.status(401).json({ success: false, error: 'Invalid email or password' });
    return;
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );

  res.json({ success: true, token, admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } });
});

router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ success: true, admin: req.admin });
});

router.post('/change-password', requireAuth, validate(changePasswordSchema), (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
  const db = getDb();

  const admin = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.admin!.id) as { password_hash: string } | undefined;
  if (!admin || !bcrypt.compareSync(currentPassword, admin.password_hash)) {
    res.status(400).json({ success: false, error: 'Current password is incorrect' });
    return;
  }

  const newHash = bcrypt.hashSync(newPassword, 12);
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(newHash, req.admin!.id);
  res.json({ success: true, message: 'Password changed successfully' });
});

export default router;
