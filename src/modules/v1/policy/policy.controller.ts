import { Response, NextFunction } from 'express';
import { PolicyService } from './policy.service';
import { ApiResponse } from '../../../core/utils/api-response';
import { AuthRequest } from '../../../core/middlewares/auth.middleware';

export class PolicyController {
  private policyService: PolicyService;

  constructor() {
    this.policyService = new PolicyService();
  }

  createPolicy = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const policy = await this.policyService.createPolicy(req.user!.id, req.body);
      ApiResponse.success(res, 'Policy created successfully', policy, 201);
    } catch (error) {
      next(error);
    }
  };

  getPolicies = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const policies = await this.policyService.getPolicies(req.user!.id);
      ApiResponse.success(res, 'Policies retrieved successfully', policies);
    } catch (error) {
      next(error);
    }
  };

  getPolicyById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const policy = await this.policyService.getPolicyById(req.user!.id, req.params.id);
      ApiResponse.success(res, 'Policy retrieved successfully', policy);
    } catch (error) {
      next(error);
    }
  };

  updatePolicy = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const policy = await this.policyService.updatePolicy(req.user!.id, req.params.id, req.body);
      ApiResponse.success(res, 'Policy updated successfully', policy);
    } catch (error) {
      next(error);
    }
  };

  deletePolicy = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.policyService.deletePolicy(req.user!.id, req.params.id);
      ApiResponse.success(res, 'Policy deleted successfully', null, 204);
    } catch (error) {
      next(error);
    }
  };
}
