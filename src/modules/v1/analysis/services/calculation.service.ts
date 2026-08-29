export class CalculationService {
  /**
   * Pure deterministic calculation function ported from Dart.
   */
  static calculate(params: {
    totalBilled: number;
    nonPayableItems: number;
    sumInsured: number;
    roomRentLimit: number;
    actualRoomRent: number;
    coPayPercentage: number;
    deductible: number;
  }) {
    let eligibleAmount = params.totalBilled - params.nonPayableItems;

    let roomRentDeduction = 0;
    if (params.roomRentLimit > 0 && params.actualRoomRent > params.roomRentLimit) {
      const proportion = params.roomRentLimit / params.actualRoomRent;
      roomRentDeduction = eligibleAmount * (1 - proportion);
      eligibleAmount -= roomRentDeduction;
    }

    let amountAfterDeductible = eligibleAmount - params.deductible;
    if (amountAfterDeductible < 0) amountAfterDeductible = 0;

    const coPayAmount = amountAfterDeductible * (params.coPayPercentage / 100);
    let approvedInsuranceAmount = amountAfterDeductible - coPayAmount;

    if (approvedInsuranceAmount > params.sumInsured) {
      approvedInsuranceAmount = params.sumInsured;
    }

    const finalOutOfPocket = params.totalBilled - approvedInsuranceAmount;

    return {
      approvedInsuranceAmount,
      outOfPocket: finalOutOfPocket,
      roomRentDeduction,
      coPayAmount,
    };
  }
}
