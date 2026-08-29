import { Response, NextFunction } from 'express';
import { AnalysisService } from './analysis.service';
import { OcrService } from './services/ocr.service';
import { AiService } from './services/ai.service';
import { CalculationService } from './services/calculation.service';
import { PolicyService } from '../policy/policy.service';
import { ApiResponse } from '../../../core/utils/api-response';
import { AuthRequest } from '../../../core/middlewares/auth.middleware';
import { AppError } from '../../../core/errors/app.error';

export class AnalysisController {
  private analysisService = new AnalysisService();
  private ocrService = new OcrService();
  private aiService = new AiService();
  private policyService = new PolicyService();

  createSnapshot = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id; 
      const snapshot = await this.analysisService.createSnapshot(userId, req.body);
      ApiResponse.success(res, 'Emergency snapshot securely synced', snapshot, 201);
    } catch (error) {
      next(error);
    }
  };

  processDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const policyId = req.body.policyId; // Passed as form-data text field

      if (!req.file) {
        throw new AppError('Image file is required', 400);
      }
      if (!policyId) {
        throw new AppError('Policy ID is required', 400);
      }

      // 1. Fetch User's Policy Limits
      const policy = await this.policyService.getPolicyById(userId, policyId);

      // 2. OCR Extraction
      const ocrText = await this.ocrService.extractTextFromBuffer(req.file.buffer);
      if (!ocrText) {
        throw new AppError('Could not extract text from the provided image', 400);
      }

      // 3. AI Entity Extraction (JSON format)
      const aiResult = await this.aiService.extractEntities(ocrText);
      const totalBilledAmount = Number(aiResult.totalBilledAmount) || 0;
      
      // Calculate nonPayableItems based on AI categorization
      const nonPayableItems = (aiResult.lineItems || []).reduce((sum: number, item: any) => {
        return sum + (item.isPotentiallyNonPayable ? Number(item.amount) : 0);
      }, 0);

      // 4. Deterministic Math Engine
      const calcResult = CalculationService.calculate({
        totalBilled: totalBilledAmount,
        nonPayableItems,
        sumInsured: Number(policy.sumInsured),
        roomRentLimit: Number(policy.roomRentLimit),
        actualRoomRent: 0, // Simplified for this implementation
        coPayPercentage: Number(policy.coPayPercentage),
        deductible: Number(policy.deductible),
      });

      // 5. Construct Final DTO and Sync
      const finalDto = {
        policyId: policy.id,
        hospitalName: aiResult.hospitalName || 'Unknown Hospital',
        totalBilledAmount: totalBilledAmount,
        estimatedInsuranceCover: calcResult.approvedInsuranceAmount,
        estimatedOutOfPocket: calcResult.outOfPocket,
        jsonSummary: aiResult,
        lineItems: (aiResult.lineItems || []).map((item: any) => ({
          description: item.description || 'Unknown',
          amount: Number(item.amount) || 0,
          category: item.category || 'Other',
          isCovered: !item.isPotentiallyNonPayable
        })),
        redFlags: [
          { severity: 'HIGH', description: 'This is an AI-generated estimate and requires verification with your provider.' }
        ]
      };

      const snapshot = await this.analysisService.createSnapshot(userId, finalDto as any);
      
      ApiResponse.success(res, 'Document processed successfully', snapshot, 201);
    } catch (error) {
      next(error);
    }
  };
}
