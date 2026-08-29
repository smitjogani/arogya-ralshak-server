import { prisma } from '../../../config/prisma';
import { CreateAnalysisDto } from './dto/analysis.dto';
import { encryptText } from '../../../utils/crypto.util';



export class AnalysisService {
  async createSnapshot(userId: string, data: CreateAnalysisDto) {
    const encryptedJson = encryptText(JSON.stringify(data.jsonSummary));

    // Execute in a transaction to guarantee ACID properties
    const analysis = await prisma.$transaction(async (tx) => {
      const result = await tx.financialAnalysis.create({
        data: {
          userId,
          policyId: data.policyId,
          hospitalName: data.hospitalName,
          totalBilledAmount: data.totalBilledAmount,
          estimatedInsuranceCover: data.estimatedInsuranceCover,
          estimatedOutOfPocket: data.estimatedOutOfPocket,
          encryptedJsonSummary: encryptedJson,
          status: 'COMPLETED',
          lineItems: {
            create: data.lineItems.map(item => ({
              description: item.description,
              amount: item.amount,
              category: item.category,
              isCovered: item.isCovered,
              reasonIfNotCovered: item.reasonIfNotCovered
            }))
          },
          redFlags: data.redFlags ? {
            create: data.redFlags.map(flag => ({
              severity: flag.severity,
              description: flag.description
            }))
          } : undefined,
          suggestedQuestions: data.suggestedQuestions ? {
            create: data.suggestedQuestions.map(q => ({
              questionText: q.questionText,
              context: q.context
            }))
          } : undefined
        },
        include: {
          lineItems: true,
          redFlags: true,
          suggestedQuestions: true,
        }
      });
      return result;
    });

    return analysis;
  }
}
