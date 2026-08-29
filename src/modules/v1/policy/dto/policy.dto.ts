import { z } from 'zod';

export const createPolicySchema = z.object({
  body: z.object({
    providerName: z.string().min(2),
    policyNumber: z.string().min(2),
    sumInsured: z.number().positive(),
    roomRentLimit: z.number().nonnegative(),
    coPayPercentage: z.number().min(0).max(100),
    deductible: z.number().nonnegative(),
  }),
});

export const updatePolicySchema = z.object({
  body: z.object({
    providerName: z.string().min(2).optional(),
    sumInsured: z.number().positive().optional(),
    roomRentLimit: z.number().nonnegative().optional(),
    coPayPercentage: z.number().min(0).max(100).optional(),
    deductible: z.number().nonnegative().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  })
});

export type CreatePolicyDto = z.infer<typeof createPolicySchema>['body'];
export type UpdatePolicyDto = z.infer<typeof updatePolicySchema>['body'];
