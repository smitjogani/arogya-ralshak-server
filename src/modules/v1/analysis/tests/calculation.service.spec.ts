import { describe, it, expect } from 'vitest';
import { CalculationService } from '../services/calculation.service';

describe('CalculationService - Deterministic Math Engine', () => {
  it('should calculate standard out-of-pocket correctly', () => {
    const result = CalculationService.calculate({
      totalBilled: 100000,
      nonPayableItems: 5000, // Consumables
      sumInsured: 500000,
      roomRentLimit: 0,
      actualRoomRent: 0,
      coPayPercentage: 10,
      deductible: 5000,
    });

    // Eligible: 100k - 5k = 95k
    // Deductible: 95k - 5k = 90k
    // CoPay: 10% of 90k = 9k
    // Approved: 90k - 9k = 81k
    // OutOfPocket: 100k - 81k = 19k (5k non-payable + 5k deductible + 9k copay)
    
    expect(result.approvedInsuranceAmount).toBe(81000);
    expect(result.outOfPocket).toBe(19000);
    expect(result.coPayAmount).toBe(9000);
    expect(result.roomRentDeduction).toBe(0);
  });

  it('should apply proportionate room rent deductions correctly', () => {
    const result = CalculationService.calculate({
      totalBilled: 100000,
      nonPayableItems: 0,
      sumInsured: 500000,
      roomRentLimit: 5000,
      actualRoomRent: 10000, // Double the limit
      coPayPercentage: 0,
      deductible: 0,
    });

    // Room Rent Proportion: 5000 / 10000 = 0.5
    // Deduction: 100000 * (1 - 0.5) = 50000
    
    expect(result.roomRentDeduction).toBe(50000);
    expect(result.approvedInsuranceAmount).toBe(50000);
    expect(result.outOfPocket).toBe(50000);
  });

  it('should strictly cap the approved amount to the Sum Insured limit', () => {
    const result = CalculationService.calculate({
      totalBilled: 800000, // 8 Lakhs
      nonPayableItems: 0,
      sumInsured: 500000,  // Capped at 5 Lakhs
      roomRentLimit: 0,
      actualRoomRent: 0,
      coPayPercentage: 0,
      deductible: 0,
    });

    expect(result.approvedInsuranceAmount).toBe(500000);
    expect(result.outOfPocket).toBe(300000);
  });
});
