/**
 * Decision Tree Calculator
 * Based on Kevin's insight about "six calculation paths"
 * Different calculation rules for different trip characteristics
 */

export class DecisionTreeReimbursementCalculator {

  /**
   * Main calculation using decision tree logic
   */
  public calculateReimbursement(days: number, miles: number, receipts: number): number {
    // Input validation
    if (days <= 0 || miles < 0 || receipts < 0) {
      throw new Error('Invalid input parameters');
    }

    // Decision tree based on Kevin's "six calculation paths"
    const path = this.determineCalculationPath(days, miles, receipts);
    let result = 0;

    switch (path) {
      case 'single_day':
        result = this.calculateSingleDay(days, miles, receipts);
        break;
      case 'short_trip_low_expense':
        result = this.calculateShortTripLowExpense(days, miles, receipts);
        break;
      case 'short_trip_high_expense':
        result = this.calculateShortTripHighExpense(days, miles, receipts);
        break;
      case 'medium_trip':
        result = this.calculateMediumTrip(days, miles, receipts);
        break;
      case 'long_trip':
        result = this.calculateLongTrip(days, miles, receipts);
        break;
      case 'extended_trip':
        result = this.calculateExtendedTrip(days, miles, receipts);
        break;
      default:
        result = this.calculateFallback(days, miles, receipts);
    }

    return Math.round(result * 100) / 100;
  }

  /**
   * Determine which calculation path to use
   */
  private determineCalculationPath(days: number, miles: number, receipts: number): string {
    // Path 1: Single day trips (special high rate)
    if (days === 1) {
      return 'single_day';
    }

    // Calculate expense intensity
    const expenseIntensity = (miles / days) + (receipts / days);
    
    // Path 2 & 3: Short trips (2-4 days) split by expense level
    if (days >= 2 && days <= 4) {
      return expenseIntensity > 150 ? 'short_trip_high_expense' : 'short_trip_low_expense';
    }

    // Path 4: Medium trips (5-7 days)
    if (days >= 5 && days <= 7) {
      return 'medium_trip';
    }

    // Path 5: Long trips (8-12 days)
    if (days >= 8 && days <= 12) {
      return 'long_trip';
    }

    // Path 6: Extended trips (13+ days)
    return 'extended_trip';
  }

  /**
   * Path 1: Single day calculation (extremely high base rate)
   */
  private calculateSingleDay(days: number, miles: number, receipts: number): number {
    // Based on diagnostic: 1-day average is $873.55
    let baseAmount = 800; // High base for single day
    
    // Mileage bonus for single days
    if (miles <= 50) {
      baseAmount += miles * 1.5;
    } else if (miles <= 200) {
      baseAmount += 75 + (miles - 50) * 1.0;
    } else {
      baseAmount += 225 + (miles - 200) * 0.5;
    }

    // Receipt handling for single days - lower receipts get bonus
    if (receipts <= 50) {
      baseAmount += receipts * 2.0; // Bonus for low receipts
    } else if (receipts <= 500) {
      baseAmount += 100 + (receipts - 50) * 0.5;
    } else {
      baseAmount += 325 + (receipts - 500) * 0.3; // Diminishing returns
    }

    return baseAmount;
  }

  /**
   * Path 2: Short trip, low expenses (simple formula)
   */
  private calculateShortTripLowExpense(days: number, miles: number, receipts: number): number {
    // Based on diagnostic: 2-4 day average around $400-500/day
    const basePerDay = days === 2 ? 520 : days === 3 ? 340 : 300;
    let amount = basePerDay * days;

    // Simple mileage addition
    amount += miles * 0.8;

    // Simple receipt inclusion  
    amount += receipts * 0.4;

    return amount;
  }

  /**
   * Path 3: Short trip, high expenses (complex formula with bonuses)
   */
  private calculateShortTripHighExpense(days: number, miles: number, receipts: number): number {
    // Higher base rate for high-expense short trips
    const basePerDay = days === 2 ? 600 : days === 3 ? 420 : 380;
    let amount = basePerDay * days;

    // Tiered mileage rates
    if (miles <= 200) {
      amount += miles * 1.2;
    } else if (miles <= 500) {
      amount += 240 + (miles - 200) * 0.9;
    } else {
      amount += 510 + (miles - 500) * 0.6;
    }

    // Receipt bonuses for high expenses
    if (receipts <= 400) {
      amount += receipts * 0.6;
    } else if (receipts <= 1000) {
      amount += 240 + (receipts - 400) * 0.5;
    } else {
      amount += 540 + (receipts - 1000) * 0.3;
    }

    return amount;
  }

  /**
   * Path 4: Medium trip (5-7 days) - Kevin's efficiency sweet spot
   */
  private calculateMediumTrip(days: number, miles: number, receipts: number): number {
    // Based on diagnostic: 5-7 day rates around $200-250/day
    const basePerDay = days === 5 ? 255 : days === 6 ? 228 : 217;
    let amount = basePerDay * days;

    // Efficiency bonus calculation (Kevin's 180-220 mi/day sweet spot)
    const milesPerDay = miles / days;
    let efficiencyMultiplier = 1.0;
    
    if (milesPerDay >= 180 && milesPerDay <= 220) {
      efficiencyMultiplier = 1.4; // Kevin's sweet spot
    } else if (milesPerDay >= 100 && milesPerDay <= 180) {
      efficiencyMultiplier = 1.2; // Good efficiency
    } else if (milesPerDay >= 50 && milesPerDay <= 100) {
      efficiencyMultiplier = 1.1; // Decent efficiency
    }

    amount *= efficiencyMultiplier;

    // Mileage component
    amount += miles * 0.7;

    // Receipt component (medium trips get good receipt treatment)
    if (receipts <= 600) {
      amount += receipts * 0.5;
    } else {
      amount += 300 + (receipts - 600) * 0.3;
    }

    return amount;
  }

  /**
   * Path 5: Long trip (8-12 days) - penalties start applying
   */
  private calculateLongTrip(days: number, miles: number, receipts: number): number {
    // Based on diagnostic: 8-12 day rates around $130-180/day
    const basePerDay = 150 - (days - 8) * 5; // Decreasing rate
    let amount = basePerDay * days;

    // Long trip penalty multiplier
    amount *= 0.9;

    // Mileage with diminishing returns
    if (miles <= 300) {
      amount += miles * 0.6;
    } else if (miles <= 800) {
      amount += 180 + (miles - 300) * 0.4;
    } else {
      amount += 380 + (miles - 800) * 0.2;
    }

    // Receipt handling for long trips
    amount += receipts * 0.35;

    return amount;
  }

  /**
   * Path 6: Extended trip (13+ days) - heavy penalties
   */
  private calculateExtendedTrip(days: number, miles: number, receipts: number): number {
    // Based on diagnostic: 13+ day rates around $120-130/day
    const basePerDay = 125;
    let amount = basePerDay * days;

    // Heavy penalty for very long trips
    amount *= 0.8;

    // Minimal mileage rates
    amount += miles * 0.3;

    // Minimal receipt rates
    amount += receipts * 0.25;

    return amount;
  }

  /**
   * Fallback calculation for edge cases
   */
  private calculateFallback(days: number, miles: number, receipts: number): number {
    return 200 * days + miles * 0.5 + receipts * 0.4;
  }

  /**
   * Get detailed breakdown for debugging
   */
  public getBreakdown(days: number, miles: number, receipts: number): {
    path: string;
    calculation: string;
    milesPerDay: number;
    receiptsPerDay: number;
    final: number;
  } {
    const path = this.determineCalculationPath(days, miles, receipts);
    const final = this.calculateReimbursement(days, miles, receipts);
    const milesPerDay = Math.round((miles / days) * 100) / 100;
    const receiptsPerDay = Math.round((receipts / days) * 100) / 100;

    let calculation = '';
    switch (path) {
      case 'single_day':
        calculation = 'High base rate + mileage bonus + receipt bonus (low receipts favored)';
        break;
      case 'short_trip_low_expense':
        calculation = `${days === 2 ? 520 : days === 3 ? 340 : 300}/day + 0.8×miles + 0.4×receipts`;
        break;
      case 'short_trip_high_expense':
        calculation = `${days === 2 ? 600 : days === 3 ? 420 : 380}/day + tiered miles + tiered receipts`;
        break;
      case 'medium_trip':
        const milesPerDay2 = miles / days;
        const effMult = milesPerDay2 >= 180 && milesPerDay2 <= 220 ? 1.4 : 
                       milesPerDay2 >= 100 && milesPerDay2 <= 180 ? 1.2 :
                       milesPerDay2 >= 50 && milesPerDay2 <= 100 ? 1.1 : 1.0;
        calculation = `Base × ${effMult} efficiency + 0.7×miles + tiered receipts`;
        break;
      case 'long_trip':
        calculation = 'Decreasing base rate × 0.9 penalty + diminishing miles + 0.35×receipts';
        break;
      case 'extended_trip':
        calculation = '125/day × 0.8 penalty + 0.3×miles + 0.25×receipts';
        break;
      default:
        calculation = 'Fallback formula';
    }

    return {
      path,
      calculation,
      milesPerDay,
      receiptsPerDay,
      final
    };
  }
} 