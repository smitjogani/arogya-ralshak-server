import { prisma } from '../../../../config/prisma';
import { CreatePolicyDto, UpdatePolicyDto } from './dto/policy.dto';
import { AppError } from '../../../../core/errors/app.error';

export class PolicyService {
  async createPolicy(userId: string, data: CreatePolicyDto) {
    const existing = await prisma.policy.findUnique({
      where: {
        userId_policyNumber: { userId, policyNumber: data.policyNumber }
      }
    });

    if (existing) {
      throw new AppError('Policy with this number already exists for the user', 400);
    }

    return prisma.policy.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async getPolicies(userId: string) {
    return prisma.policy.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getPolicyById(userId: string, policyId: string) {
    const policy = await prisma.policy.findFirst({
      where: { id: policyId, userId }
    });

    if (!policy) {
      throw new AppError('Policy not found', 404);
    }

    return policy;
  }

  async updatePolicy(userId: string, policyId: string, data: UpdatePolicyDto) {
    await this.getPolicyById(userId, policyId); 

    return prisma.policy.update({
      where: { id: policyId },
      data,
    });
  }

  async deletePolicy(userId: string, policyId: string) {
    await this.getPolicyById(userId, policyId);

    return prisma.policy.delete({
      where: { id: policyId }
    });
  }
}
