/**
 * Simple Reimbursement Calculator
 * Based on actual patterns from diagnostic analysis of public cases
 */

export class SimpleReimbursementCalculator {
  
  /**
   * Main calculation based on observed patterns from public cases
   */
  public calculateReimbursement(days: number, miles: number, receipts: number): number {
    // Input validation
    if (days <= 0 || miles < 0 || receipts < 0) {
      throw new Error('Invalid input parameters');
    }

    // 1. Duration-based foundation (observed per-day rates)
    const perDayRate = this.getPerDayRate(days);
    const durationComponent = perDayRate * days;

    // 2. Mileage component (observed rates by tier)
    const mileageComponent = this.calculateMileageComponent(miles);

    // 3. Receipt component (observed multipliers)
    const receiptComponent = this.calculateReceiptComponent(receipts);

    // 4. Simple addition (no complex efficiency bonuses for now)
    const total = durationComponent + mileageComponent + receiptComponent;

    return Math.round(total * 100) / 100;
  }

  /**
   * Get per-day rate based on observed patterns
   */
  private getPerDayRate(days: number): number {
    // Based on diagnostic analysis:
    if (days === 1) return 873.55;      // Extremely high single-day rate
    if (days === 2) return 523.12;      // High short-trip rate  
    if (days === 3) return 336.85;      // Standard rate
    if (days === 4) return 304.49;      // Slightly lower
    if (days === 5) return 254.52;      // Lower (penalty, not bonus)
    if (days === 6) return 227.75;      // Multi-day standard
    if (days === 7) return 217.35;      // Multi-day standard
    if (days === 8) return 180.33;      // Long trip penalty
    if (days === 9) return 159.85;      // Long trip penalty
    if (days === 10) return 149.61;     // Long trip penalty
    if (days === 11) return 145.51;     // Long trip penalty
    if (days === 12) return 134.62;     // Long trip penalty
    if (days === 13) return 128.90;     // Long trip penalty
    if (days >= 14) return 121.93;      // Very long trip penalty

    // Fallback (shouldn't happen with current data)
    return 200;
  }

  /**
   * Calculate mileage component based on observed rates
   */
  private calculateMileageComponent(miles: number): number {
    let component = 0;

    if (miles <= 100) {
      // 0-100 miles: $19.708/mile (but this seems too high - might include base rate)
      // Let's be more conservative and use a portion of this rate
      component = miles * 5.0; // Reduced from 19.708
    } else if (miles <= 300) {
      // First 100 miles
      component = 100 * 5.0;
      // Next miles at lower rate
      component += (miles - 100) * 3.0; // Based on $5.383/mile pattern
    } else if (miles <= 500) {
      // First 100 miles
      component = 100 * 5.0;
      // Next 200 miles
      component += 200 * 3.0;
      // Next miles at even lower rate
      component += (miles - 300) * 2.0; // Based on $3.079/mile pattern
    } else if (miles <= 1000) {
      // First 300 miles
      component = 100 * 5.0 + 200 * 3.0;
      // Next 200 miles
      component += 200 * 2.0;
      // Remaining miles
      component += (miles - 500) * 1.2; // Based on $1.943/mile pattern
    } else {
      // First 500 miles
      component = 100 * 5.0 + 200 * 3.0 + 200 * 2.0;
      // Next 500 miles
      component += 500 * 1.2;
      // Remaining miles
      component += (miles - 1000) * 0.8; // Based on $1.452/mile pattern
    }

    return component;
  }

  /**
   * Calculate receipt component based on observed multipliers
   */
  private calculateReceiptComponent(receipts: number): number {
    // Based on diagnostic analysis - very different from our assumptions!
    if (receipts <= 200) {
      // Low receipts get a huge bonus multiplier (8.18x observed)
      // But this might be because low receipts correlate with high base rates
      // Let's be more conservative
      return receipts * 2.0;
    } else if (receipts <= 600) {
      // Standard rate (2.08x observed)
      return receipts * 0.8;
    } else if (receipts <= 800) {
      // Slightly lower (1.63x observed)
      return receipts * 0.6;
    } else if (receipts <= 1500) {
      // Lower rate (1.36x observed)
      return receipts * 0.4;
    } else {
      // High receipts get penalty (0.82x observed)
      return receipts * 0.3;
    }
  }

  /**
   * Get detailed breakdown for debugging
   */
  public getBreakdown(days: number, miles: number, receipts: number): {
    duration: number;
    mileage: number;
    receipt: number;
    total: number;
  } {
    const perDayRate = this.getPerDayRate(days);
    const duration = perDayRate * days;
    const mileage = this.calculateMileageComponent(miles);
    const receipt = this.calculateReceiptComponent(receipts);
    const total = duration + mileage + receipt;

    return {
      duration: Math.round(duration * 100) / 100,
      mileage: Math.round(mileage * 100) / 100,
      receipt: Math.round(receipt * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }
} 