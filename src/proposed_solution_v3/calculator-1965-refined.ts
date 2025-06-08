/**
 * Refined 1965-Style Reimbursement Calculator
 * Based on initial 1965 analysis but with more conservative scaling
 */

export class Calculator1965Refined {
  private pathAverages: Map<string, number> = new Map();
  
  constructor() {
    this.initializePathAverages();
  }

  private initializePathAverages(): void {
    // Use the observed averages from analysis but be more conservative
    this.pathAverages.set('SINGLE_DAY', 873.55);
    this.pathAverages.set('VACATION_PENALTY', 1400.00); // Reduced from 1901.44
    this.pathAverages.set('HIGH_EFF_SHORT', 1128.92);
    this.pathAverages.set('KEVIN_SWEET_SPOT', 933.42);
    this.pathAverages.set('MEDIUM_BALANCED', 1200.00); // Reduced from 1290.44
    this.pathAverages.set('LONG_LOW_EFF', 1300.00); // Reduced from 1508.97
    this.pathAverages.set('STANDARD', 1150.00); // Reduced from 1232.49
    
    console.log('🏗️  Initialized refined 1965 path averages (more conservative)');
  }

  calculateReimbursement(days: number, miles: number, receipts: number): number {
    // Step 1: Identify calculation path
    const calculationPath = this.identifyCalculationPath(days, miles, receipts);
    
    // Step 2: Get base amount for the path
    let baseAmount = this.pathAverages.get(calculationPath) || this.pathAverages.get('STANDARD')!;
    
    // Step 3: Apply conservative scaling based on trip characteristics
    const scalingFactor = this.calculateConservativeScaling(days, miles, receipts, calculationPath);
    baseAmount *= scalingFactor;
    
    // Step 4: Apply refined business rules
    baseAmount = this.applyRefinedBusinessRules(baseAmount, days, miles, receipts, calculationPath);
    
    return Math.round(baseAmount * 100) / 100;
  }

  private identifyCalculationPath(days: number, miles: number, receipts: number): string {
    const efficiency = miles / days;
    const dailySpending = receipts / days;
    
    if (days === 1) return 'SINGLE_DAY';
    
    // More restrictive vacation penalty - only for very high daily spending
    if (days >= 8 && dailySpending > 200) return 'VACATION_PENALTY';
    
    if (days <= 3 && efficiency > 150) return 'HIGH_EFF_SHORT';
    
    if (days >= 4 && days <= 6) {
      if (efficiency >= 180 && efficiency <= 220 && dailySpending < 100) {
        return 'KEVIN_SWEET_SPOT';
      }
      return 'MEDIUM_BALANCED';
    }
    
    if (days >= 7 && efficiency < 100) return 'LONG_LOW_EFF';
    
    return 'STANDARD';
  }

  private calculateConservativeScaling(days: number, miles: number, receipts: number, path: string): number {
    let scalingFactor = 1.0;
    
    // Much more conservative days scaling
    if (path !== 'SINGLE_DAY') {
      // Cap the days effect much more aggressively
      if (days > 7) {
        scalingFactor *= Math.max(0.7, 1.0 - (days - 7) * 0.05); // Diminishing returns for long trips
      } else {
        scalingFactor *= Math.min(1.2, Math.max(0.8, days / 5)); // Scale around 5-day baseline
      }
    }
    
    // Conservative miles scaling
    if (miles <= 100) {
      scalingFactor *= 0.85; // Small penalty for low mileage
    } else if (miles >= 1000) {
      scalingFactor *= 1.1; // Small bonus for high mileage
    }
    
    // Conservative receipts scaling
    const dailyReceipts = receipts / days;
    if (dailyReceipts < 30) {
      scalingFactor *= 0.8; // Penalty for very low receipts
    } else if (dailyReceipts > 250) {
      scalingFactor *= 0.85; // Penalty for very high daily receipts
    }
    
    return scalingFactor;
  }

  private applyRefinedBusinessRules(baseAmount: number, days: number, miles: number, receipts: number, path: string): number {
    let adjustedAmount = baseAmount;
    
    // Apply the insights from analysis but more conservatively
    
    // 5-day trips have lower averages - small penalty
    if (days === 5) {
      adjustedAmount *= 0.95; // Reduced from 0.93
    }
    
    // Receipt "sweet spot" penalty but smaller
    if (receipts >= 600 && receipts <= 800) {
      adjustedAmount *= 0.92; // Reduced from 0.84
    }
    
    // Strong penalty for very high receipts (Marcus's observation)
    if (receipts > 2000) {
      adjustedAmount *= 0.75; // Increased from 0.7
    }
    
    // Single day extreme mileage penalty
    if (path === 'SINGLE_DAY' && miles > 1000) {
      adjustedAmount *= 0.65; // Increased from 0.6
    }
    
    // Additional penalty for vacation penalty cases with extreme receipts
    if (path === 'VACATION_PENALTY' && receipts > 1500) {
      adjustedAmount *= 0.8; // Additional penalty
    }
    
    // Special handling for very long trips (14+ days) - aggressive penalty
    if (days >= 14) {
      adjustedAmount *= 0.6; // Strong penalty for extreme length trips
    }
    
    return adjustedAmount;
  }

  // Training method for analysis
  public train(trainingData: Array<{days: number, miles: number, receipts: number, expected: number}>): void {
    console.log('🎯 Training refined 1965-style calculator...');
    
    // Group training data by calculation paths
    const pathGroups = new Map<string, Array<{days: number, miles: number, receipts: number, expected: number}>>();
    
    trainingData.forEach(data => {
      const path = this.identifyCalculationPath(data.days, data.miles, data.receipts);
      if (!pathGroups.has(path)) {
        pathGroups.set(path, []);
      }
      pathGroups.get(path)!.push(data);
    });
    
    // Log path distributions for analysis
    console.log('📊 Refined path distribution:');
    for (const [path, cases] of pathGroups.entries()) {
      const avgExpected = cases.reduce((sum, c) => sum + c.expected, 0) / cases.length;
      console.log(`  ${path}: ${cases.length} cases, $${avgExpected.toFixed(2)} average expected`);
    }
    
    console.log('✅ Refined 1965-style calculator training complete');
  }
} 