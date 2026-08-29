import { Response, NextFunction } from 'express';
import { AnalysisService } from './analysis.service';
import { ApiResponse } from '../../../../core/utils/api-response';
import { AuthRequest } from '../../../../core/middlewares/auth.middleware';

export class AnalysisController {
  private analysisService: AnalysisService;

  constructor() {
    this.analysisService = new AnalysisService();
  }

  createSnapshot = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id; // Guaranteed by authGuard
      const snapshot = await this.analysisService.createSnapshot(userId, req.body);
      ApiResponse.success(res, 'Emergency snapshot securely synced', snapshot, 201);
    } catch (error) {
      next(error);
    }
  };
}
