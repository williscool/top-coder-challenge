/**
 * Lookup Table Calculator
 * Uses direct mapping from diagnostic analysis findings
 * Based on observed per-day rates, mileage tiers, and receipt multipliers
 */

export class LookupReimbursementCalculator {
  
  // Based on diagnostic analysis of real per-day rates
  private readonly dayRates = new Map<number, number>([
    [1, 873.55],   // Extremely high single-day rate
    [2, 523.12],   // High short-trip rate  
    [3, 336.85],   // Standard rate
    [4, 304.49],   // Slightly lower
    [5, 254.52],   // Lower (penalty, not bonus)
    [6, 227.75],   // Multi-day standard
    [7, 217.35],   // Multi-day standard
    [8, 180.33],   // Long trip penalty
    [9, 159.85],   // Long trip penalty
    [10, 149.61],  // Long trip penalty
    [11, 145.51],  // Long trip penalty
    [12, 134.62],  // Long trip penalty
    [13, 128.90],  // Long trip penalty
  ]);

  // Based on diagnostic analysis mileage rates
  private readonly mileageTiers = [
    { min: 0, max: 100, rate: 4.0 },     // Reduced from 19.70 (likely included base rate)
    { min: 101, max: 300, rate: 2.5 },   // Based on 5.38/mile pattern but adjusted
    { min: 301, max: 500, rate: 1.5 },   // Based on 3.079/mile pattern
    { min: 501, max: 1000, rate: 0.8 },  // Based on 1.943/mile pattern
    { min: 1001, max: Infinity, rate: 0.5 }, // Based on 1.452/mile pattern
  ];

  // Based on diagnostic analysis receipt multipliers (but more conservative)
  private readonly receiptTiers = [
    { min: 0, max: 200, multiplier: 1.5 },     // Reduced from 8.18x (too high)
    { min: 201, max: 600, multiplier: 0.8 },   // Based on 2.08x but adjusted
    { min: 601, max: 800, multiplier: 0.6 },   // Based on 1.63x
    { min: 801, max: 1500, multiplier: 0.4 },  // Based on 1.36x
    { min: 1501, max: Infinity, multiplier: 0.3 }, // Based on 0.82x
  ];

  /**
   * Calculate reimbursement using lookup tables
   */
  public calculateReimbursement(days: number, miles: number, receipts: number): number {
    // Input validation
    if (days <= 0 || miles < 0 || receipts < 0) {
      throw new Error('Invalid input parameters');
    }

    // 1. Get base rate from day lookup (this might already include everything)
    let baseAmount = this.getDayRate(days) * days;

    // 2. Try different combination strategies
    
    // Strategy A: Day rate is complete (just scale down and add small components)
    const strategyA = this.calculateStrategyA(days, miles, receipts);
    
    // Strategy B: Day rate is base + add mileage and receipt components  
    const strategyB = this.calculateStrategyB(days, miles, receipts);
    
    // Strategy C: Weighted combination based on trip characteristics
    const strategyC = this.calculateStrategyC(days, miles, receipts);

    // For now, use Strategy C (weighted combination)
    return Math.round(strategyC * 100) / 100;
  }

  /**
   * Strategy A: Day rate includes most components, minimal additions
   */
  private calculateStrategyA(days: number, miles: number, receipts: number): number {
    const dayRate = this.getDayRate(days);
    
    // Scale down the day rate since it includes everything
    const scaledBase = dayRate * days * 0.7; // Reduce by 30%
    
    // Add small mileage component
    const mileageComponent = this.calculateMileageComponent(miles) * 0.3;
    
    // Add small receipt component
    const receiptComponent = this.calculateReceiptComponent(receipts) * 0.3;
    
    return scaledBase + mileageComponent + receiptComponent;
  }

  /**
   * Strategy B: Day rate is base, add full components
   */
  private calculateStrategyB(days: number, miles: number, receipts: number): number {
    // Use a smaller base rate
    const baseRate = 50; // Much smaller base
    const baseComponent = baseRate * days;
    
    // Add full mileage component
    const mileageComponent = this.calculateMileageComponent(miles);
    
    // Add full receipt component  
    const receiptComponent = this.calculateReceiptComponent(receipts);
    
    // Add day scaling factor
    const dayMultiplier = this.getDayMultiplier(days);
    
    return (baseComponent + mileageComponent + receiptComponent) * dayMultiplier;
  }

  /**
   * Strategy C: Weighted combination based on trip characteristics
   */
  private calculateStrategyC(days: number, miles: number, receipts: number): number {
    const strategyA = this.calculateStrategyA(days, miles, receipts);
    const strategyB = this.calculateStrategyB(days, miles, receipts);
    
    // Weight based on trip characteristics
    // Short trips: favor strategy A (day rates are more complete)
    // Long trips with high miles/receipts: favor strategy B (component-based)
    
    const complexity = (miles / 100) + (receipts / 500) + Math.max(0, days - 3);
    const weightA = 1.0 / (1.0 + complexity * 0.2);
    const weightB = 1.0 - weightA;
    
    return strategyA * weightA + strategyB * weightB;
  }

  /**
   * Get per-day rate with interpolation for unseen values
   */
  private getDayRate(days: number): number {
    // Direct lookup for known values
    if (this.dayRates.has(days)) {
      return this.dayRates.get(days)!;
    }
    
    // Interpolation for unknown values
    if (days >= 14) {
      return 121.93; // Very long trip penalty
    }
    
    // Find surrounding values for interpolation
    const sortedDays = Array.from(this.dayRates.keys()).sort((a, b) => a - b);
    const lower = sortedDays.filter(d => d < days).pop();
    const upper = sortedDays.filter(d => d > days).shift();
    
    if (lower && upper) {
      const lowerRate = this.dayRates.get(lower)!;
      const upperRate = this.dayRates.get(upper)!;
      const ratio = (days - lower) / (upper - lower);
      return lowerRate + (upperRate - lowerRate) * ratio;
    }
    
    // Fallback
    return 200;
  }

  /**
   * Get day multiplier for strategy B
   */
  private getDayMultiplier(days: number): number {
    if (days === 1) return 2.5;
    if (days <= 4) return 1.8;
    if (days <= 7) return 1.5;
    if (days <= 10) return 1.2;
    return 1.0;
  }

  /**
   * Calculate mileage component using tiers
   */
  private calculateMileageComponent(miles: number): number {
    let component = 0;
    let remainingMiles = miles;
    
    for (const tier of this.mileageTiers) {
      if (remainingMiles <= 0) break;
      
      const milesInThisTier = Math.min(remainingMiles, tier.max - tier.min + 1);
      component += milesInThisTier * tier.rate;
      remainingMiles -= milesInThisTier;
    }
    
    return component;
  }

  /**
   * Calculate receipt component using tiers
   */
  private calculateReceiptComponent(receipts: number): number {
    for (const tier of this.receiptTiers) {
      if (receipts >= tier.min && receipts <= tier.max) {
        return receipts * tier.multiplier;
      }
    }
    
    // Fallback for very high receipts
    return receipts * 0.2;
  }

  /**
   * Get detailed breakdown for debugging
   */
  public getBreakdown(days: number, miles: number, receipts: number): {
    strategyA: number;
    strategyB: number;
    strategyC: number;
    dayRate: number;
    mileageComponent: number;
    receiptComponent: number;
    final: number;
  } {
    const strategyA = this.calculateStrategyA(days, miles, receipts);
    const strategyB = this.calculateStrategyB(days, miles, receipts);
    const strategyC = this.calculateStrategyC(days, miles, receipts);
    const dayRate = this.getDayRate(days);
    const mileageComponent = this.calculateMileageComponent(miles);
    const receiptComponent = this.calculateReceiptComponent(receipts);
    const final = this.calculateReimbursement(days, miles, receipts);

    return {
      strategyA: Math.round(strategyA * 100) / 100,
      strategyB: Math.round(strategyB * 100) / 100,
      strategyC: Math.round(strategyC * 100) / 100,
      dayRate: Math.round(dayRate * 100) / 100,
      mileageComponent: Math.round(mileageComponent * 100) / 100,
      receiptComponent: Math.round(receiptComponent * 100) / 100,
      final: final
    };
  }
} 