import { z } from 'zod';

export const createAnalysisSchema = z.object({
  body: z.object({
    policyId: z.string().uuid(),
    hospitalName: z.string().min(1),
    totalBilledAmount: z.number().min(0),
    estimatedInsuranceCover: z.number().min(0),
    estimatedOutOfPocket: z.number().min(0),
    jsonSummary: z.record(z.unknown()), // The raw JSON output from deterministic math
    lineItems: z.array(
      z.object({
        description: z.string(),
        amount: z.number().min(0),
        category: z.string(),
        isCovered: z.boolean(),
        reasonIfNotCovered: z.string().optional(),
      })
    ),
    redFlags: z.array(
      z.object({
        severity: z.string(),
        description: z.string(),
      })
    ).optional(),
    suggestedQuestions: z.array(
      z.object({
        questionText: z.string(),
        context: z.string(),
      })
    ).optional(),
  }),
});

export type CreateAnalysisDto = z.infer<typeof createAnalysisSchema>['body'];
