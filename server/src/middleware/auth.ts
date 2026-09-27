import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/schema';

export interface AuthRequest extends Request {
  admin?: { id: string; email: string; name: string; role: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthRequest['admin'];

    // A valid signature is not enough: tokens last 24 hours, so verifying only
    // the signature means removing an administrator does not actually revoke
    // their access until the token expires on its own. Anyone who had signed
    // in with the old published default credentials would have kept working
    // admin access for a day after that account was deleted. The id and email
    // must still agree, so a reused id cannot inherit an old token.
    const admin = getDb()
      .prepare('SELECT id, email, name, role FROM admin_users WHERE id = ? AND email = ?')
      .get(payload?.id, payload?.email) as AuthRequest['admin'] | undefined;

    if (!admin) {
      res.status(401).json({ success: false, error: 'Invalid or expired token' });
      return;
    }

    req.admin = admin;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}
