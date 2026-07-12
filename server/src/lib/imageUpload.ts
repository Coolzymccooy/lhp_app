import { Request, Response, NextFunction, RequestHandler } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_IMAGE_MIME = /^image\/(jpe?g|png|webp|gif)$/;

class UnsupportedImageTypeError extends Error {
  constructor(readonly mimetype: string) {
    super(`Unsupported image type: ${mimetype}`);
  }
}

// Single-'image'-field upload into `dir`, with the two common rejection cases
// mapped to specific statuses (413 too large, 415 wrong format) so the client
// can show a useful message instead of a generic failure.
export function imageUploadMiddleware(dir: string): RequestHandler {
  fs.mkdirSync(dir, { recursive: true });

  const single = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, dir),
      filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname).toLowerCase()}`),
    }),
    limits: { fileSize: MAX_IMAGE_BYTES },
    fileFilter: (_req, file, cb) => {
      if (ACCEPTED_IMAGE_MIME.test(file.mimetype)) cb(null, true);
      else cb(new UnsupportedImageTypeError(file.mimetype));
    },
  }).single('image');

  return (req: Request, res: Response, next: NextFunction) => {
    single(req, res, (err: unknown) => {
      if (!err) {
        next();
        return;
      }
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        res.status(413).json({ success: false, error: 'Image is too large — maximum size is 8MB.' });
        return;
      }
      if (err instanceof UnsupportedImageTypeError) {
        res.status(415).json({ success: false, error: 'Unsupported image format — use a JPG, PNG, WebP or GIF.' });
        return;
      }
      next(err instanceof Error ? err : new Error(String(err)));
    });
  };
}
