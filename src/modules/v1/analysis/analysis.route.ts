import { Router } from 'express';
import { AnalysisController } from './analysis.controller';
import { validateRequest } from '../../../../core/middlewares/validation.middleware';
import { authGuard } from '../../../../core/middlewares/auth.middleware';
import { createAnalysisSchema } from './dto/analysis.dto';

const router = Router();
const analysisController = new AnalysisController();

router.use(authGuard);

router.post(
  '/sync',
  validateRequest(createAnalysisSchema),
  analysisController.createSnapshot
);

export default router;
