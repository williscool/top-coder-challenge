import {ReimbursementCalculator} from './calculator';
import {DEFAULT_PARAMETERS} from './constants';

describe('ReimbursementCalculator', () => {
  let calculator: ReimbursementCalculator;

  beforeEach(() => {
    calculator = new ReimbursementCalculator();
  });

  describe('Basic Functionality', () => {
    it('should create calculator with default parameters', () => {
      expect(calculator.getParameters()).toEqual(DEFAULT_PARAMETERS);
    });

    it('should update parameters correctly', () => {
      const newParams = {
        baseRatePerDay: 150,
        durationMultipliers: {'1': 9.0},
      };
      calculator.updateParameters(newParams);
      const updatedParams = calculator.getParameters();
      expect(updatedParams.baseRatePerDay).toBe(150);
      expect(updatedParams.durationMultipliers['1']).toBe(9.0);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => calculator.calculateReimbursement(0, 100, 50)).toThrow(
        'Invalid input parameters',
      );
      expect(() => calculator.calculateReimbursement(1, -1, 50)).toThrow(
        'Invalid input parameters',
      );
      expect(() => calculator.calculateReimbursement(1, 100, -1)).toThrow(
        'Invalid input parameters',
      );
    });
  });

  describe('Component Calculations', () => {
    it('should calculate correct base component for 1-day trip', () => {
      const breakdown = calculator.getCalculationBreakdown(1, 100, 200);
      expect(breakdown.components.base).toBeGreaterThan(0);
      expect(breakdown.categories.duration).toBe('1-day');
    });

    it('should calculate correct mileage component', () => {
      const breakdown = calculator.getCalculationBreakdown(1, 250, 200);
      expect(breakdown.components.mileage).toBeGreaterThan(0);
    });

    it('should calculate correct receipt component', () => {
      const breakdown = calculator.getCalculationBreakdown(1, 100, 600);
      expect(breakdown.components.receipts).toBeGreaterThan(0);
      expect(breakdown.categories.receipts).toBeDefined();
    });

    it('should apply efficiency bonus correctly', () => {
      const breakdown = calculator.getCalculationBreakdown(1, 200, 200);
      expect(breakdown.analysis.efficiencyRatio).toBe(200);
      expect(breakdown.components.efficiency).toBeDefined();
    });
  });

  describe('Special Cases', () => {
    it("should handle Kevin's sweet spot correctly", () => {
      const breakdown = calculator.getCalculationBreakdown(1, 200, 200);
      expect(breakdown.analysis.isInKevinsSweetSpot).toBe(true);
    });

    it('should apply 5-day bonus correctly', () => {
      const breakdown = calculator.getCalculationBreakdown(5, 1000, 800);
      expect(breakdown.analysis.appliedModifiers).toContain(
        "5-day trip bonus (Lisa's observation)",
      );
    });

    it('should apply long trip penalty correctly', () => {
      const breakdown = calculator.getCalculationBreakdown(9, 1000, 800);
      expect(breakdown.analysis.appliedModifiers).toContain(
        'Long trip penalty (8+ days)',
      );
    });
  });

  describe('Validation', () => {
    it('should validate calculations against expected output', () => {
      const result = calculator.validateCalculation(1, 100, 200, 500, 0.01);
      expect(result).toHaveProperty('isMatch');
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('breakdown');
    });

    it('should handle exact matches correctly', () => {
      const result = calculator.validateCalculation(1, 100, 200, 500, 0.01);
      if (result.isMatch) {
        expect(result.error).toBeLessThanOrEqual(0.01);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long trips', () => {
      const breakdown = calculator.getCalculationBreakdown(30, 5000, 3000);
      expect(breakdown.total).toBeGreaterThan(0);
    });

    it('should handle very high mileage', () => {
      const breakdown = calculator.getCalculationBreakdown(1, 1000, 200);
      expect(breakdown.total).toBeGreaterThan(0);
    });

    it('should handle very high receipts', () => {
      const breakdown = calculator.getCalculationBreakdown(1, 100, 2000);
      expect(breakdown.total).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    it('should calculate total correctly from all components', () => {
      const breakdown = calculator.getCalculationBreakdown(1, 100, 200);
      const expectedTotal =
        breakdown.components.base +
        breakdown.components.mileage +
        breakdown.components.receipts +
        breakdown.components.efficiency +
        breakdown.components.modifiers;
      expect(breakdown.total).toBe(Math.round(expectedTotal * 100) / 100);
    });

    it('should maintain consistency between calculate and breakdown', () => {
      const days = 1;
      const miles = 100;
      const receipts = 200;
      const calculated = calculator.calculateReimbursement(
        days,
        miles,
        receipts,
      );
      const breakdown = calculator.getCalculationBreakdown(
        days,
        miles,
        receipts,
      );
      expect(calculated).toBe(breakdown.total);
    });
  });
});
