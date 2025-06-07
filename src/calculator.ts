import {CalculationParameters, DEFAULT_PARAMETERS} from './constants';
import {calculateBaseComponent, getDurationCategory} from './components/base';
import {
  calculateMileageComponent,
  getMileageBreakdown,
} from './components/mileage';
import {
  calculateReceiptComponent,
  getReceiptEfficiencyCategory,
} from './components/receipts';
import {
  calculateEfficiencyBonus,
  getEfficiencyCategory,
  isInKevinsSweetSpot,
} from './components/efficiency';
import {
  applySpecialBonuses,
  applyDurationModifiers,
  getModifierDescription,
} from './components/modifiers';

export interface CalculationBreakdown {
  input: {
    days: number;
    miles: number;
    receipts: number;
  };
  components: {
    base: number;
    mileage: number;
    receipts: number;
    efficiency: number;
    modifiers: number;
  };
  categories: {
    duration: string;
    efficiency: string;
    receipts: string;
  };
  analysis: {
    efficiencyRatio: number;
    isInKevinsSweetSpot: boolean;
    appliedModifiers: string[];
  };
  total: number;
}

export class ReimbursementCalculator {
  private parameters: CalculationParameters;

  constructor(parameters: CalculationParameters = DEFAULT_PARAMETERS) {
    this.parameters = parameters;
  }

  /**
   * Main calculation method - implements the multi-component formula
   * Formula: Base + Mileage + Receipt + Efficiency_Bonus + Duration_Modifiers
   */
  public calculateReimbursement(
    days: number,
    miles: number,
    receipts: number,
  ): number {
    // Input validation
    if (days <= 0 || miles < 0 || receipts < 0) {
      throw new Error('Invalid input parameters');
    }

    // 1. Calculate Base Component
    const baseComponent = calculateBaseComponent(days, this.parameters);

    // 2. Calculate Mileage Component
    const mileageComponent = calculateMileageComponent(miles, this.parameters);

    // 3. Calculate Receipt Component
    const receiptComponent = calculateReceiptComponent(
      receipts,
      days,
      this.parameters,
    );

    // 4. Calculate subtotal before efficiency bonus
    const subtotal = baseComponent + mileageComponent + receiptComponent;

    // 5. Apply Efficiency Bonus
    const efficiencyBonus = calculateEfficiencyBonus(
      miles,
      days,
      subtotal,
      this.parameters,
    );

    // 6. Apply Duration Modifiers
    const withDurationModifiers = applyDurationModifiers(
      subtotal + efficiencyBonus,
      days,
    );

    // 7. Apply Special Bonuses
    const finalAmount = applySpecialBonuses(
      withDurationModifiers,
      days,
      miles,
      receipts,
      this.parameters,
    );

    // 8. Round to 2 decimal places
    return Math.round(finalAmount * 100) / 100;
  }

  /**
   * Get detailed breakdown of the calculation
   */
  public getCalculationBreakdown(
    days: number,
    miles: number,
    receipts: number,
  ): CalculationBreakdown {
    // Calculate components
    const baseComponent = calculateBaseComponent(days, this.parameters);
    const mileageComponent = calculateMileageComponent(miles, this.parameters);
    const receiptComponent = calculateReceiptComponent(
      receipts,
      days,
      this.parameters,
    );
    const subtotal = baseComponent + mileageComponent + receiptComponent;
    const efficiencyBonus = calculateEfficiencyBonus(
      miles,
      days,
      subtotal,
      this.parameters,
    );

    const withDurationModifiers = applyDurationModifiers(
      subtotal + efficiencyBonus,
      days,
    );

    const finalAmount = applySpecialBonuses(
      withDurationModifiers,
      days,
      miles,
      receipts,
      this.parameters,
    );

    const modifiers =
      withDurationModifiers -
      subtotal -
      efficiencyBonus +
      (finalAmount - withDurationModifiers);

    return {
      input: {days, miles, receipts},
      components: {
        base: baseComponent,
        mileage: mileageComponent,
        receipts: receiptComponent,
        efficiency: efficiencyBonus,
        modifiers: modifiers,
      },
      categories: {
        duration: getDurationCategory(days),
        efficiency: getEfficiencyCategory(miles, days),
        receipts: getReceiptEfficiencyCategory(receipts),
      },
      analysis: {
        efficiencyRatio: miles / days,
        isInKevinsSweetSpot: isInKevinsSweetSpot(miles, days),
        appliedModifiers: getModifierDescription(days, miles),
      },
      total: Math.round(finalAmount * 100) / 100,
    };
  }

  /**
   * Update calculation parameters for tuning
   */
  public updateParameters(newParameters: Partial<CalculationParameters>): void {
    this.parameters = {...this.parameters, ...newParameters};
  }

  /**
   * Get current parameters
   */
  public getParameters(): CalculationParameters {
    return {...this.parameters};
  }

  /**
   * Validate a calculation against expected output
   */
  public validateCalculation(
    days: number,
    miles: number,
    receipts: number,
    expected: number,
    tolerance = 0.01,
  ): {isMatch: boolean; error: number; breakdown: CalculationBreakdown} {
    const calculated = this.calculateReimbursement(days, miles, receipts);
    const error = Math.abs(calculated - expected);
    const breakdown = this.getCalculationBreakdown(days, miles, receipts);

    return {
      isMatch: error <= tolerance,
      error: error,
      breakdown: breakdown,
    };
  }
}
