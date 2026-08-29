import multer from 'multer';
import { AppError } from '../errors/app.error';

const storage = multer.memoryStorage(); // Process in memory to pipe directly to Google Vision API

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new AppError('Only images and PDFs are allowed', 400));
    }
  },
});
