import { Router } from 'express';
import { AnalysisController } from './analysis.controller';
import { validateRequest } from '../../../core/middlewares/validation.middleware';
import { authGuard } from '../../../core/middlewares/auth.middleware';
import { uploadMiddleware } from '../../../core/middlewares/upload.middleware';
import { createAnalysisSchema } from './dto/analysis.dto';

const router = Router();
const analysisController = new AnalysisController();

router.use(authGuard);

// Original JSON Sync route
router.post(
  '/sync',
  validateRequest(createAnalysisSchema),
  analysisController.createSnapshot
);

// New AI Document Processing Route
router.post(
  '/process-document',
  uploadMiddleware.single('image'), // Expects 'image' in multipart/form-data
  analysisController.processDocument
);

export default router;
