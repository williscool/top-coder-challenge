/**
 * Balanced Polynomial Calculator - Optimized for 20% Close Matches
 * Less aggressive business rules while preserving exact match capability
 */

import { AdvancedPolynomialReimbursementCalculator } from '../advanced-polynomial-calculator';

export class BalancedPolynomialReimbursementCalculator extends AdvancedPolynomialReimbursementCalculator {
  
  /**
   * Calculate reimbursement with balanced business rule corrections
   */
  public calculateReimbursement(days: number, miles: number, receipts: number): number {
    // Get base polynomial prediction
    let result = super.calculateReimbursement(days, miles, receipts);
    
    // Apply much more conservative corrections
    result = this.applyBalancedCorrections(result, days, miles, receipts);
    
    return Math.round(result * 100) / 100;
  }

  /**
   * Apply balanced corrections - much less aggressive than Enhanced
   */
  private applyBalancedCorrections(baseResult: number, days: number, miles: number, receipts: number): number {
    let result = baseResult;
    const efficiency = miles / days;
    const receiptsPerDay = receipts / days;
    
    // Only apply corrections for extreme cases to preserve most of the original model's performance
    
    // Correction 1: Only for extreme high receipts + low efficiency (most problematic pattern)
    if (receipts > 2500 && efficiency < 20) {
      const reduction = Math.min(result * 0.15, 200); // Much smaller reduction
      result -= reduction;
    }
    
    // Correction 2: Only for extreme single-day cases 
    if (days === 1 && receipts > 2000 && efficiency > 1000) {
      const cappedResult = 300 + miles * 0.15 + receipts * 0.08; // More generous cap
      if (cappedResult < result) {
        result = cappedResult;
      }
    }
    
    // Correction 3: Only for extreme multi-day mismatches
    if (days >= 8 && receipts > 2000 && result > receipts * 1.5) {
      const reasonableMax = receipts * 1.3 + days * 80; // More generous
      if (result > reasonableMax) {
        result = reasonableMax;
      }
    }
    
    // Correction 4: Small efficiency boost for very high efficiency trips
    if (efficiency > 200 && days >= 5 && receipts < 1200) {
      const efficiencyBonus = Math.min((efficiency - 200) * days * 1, 200); // Smaller bonus
      result += efficiencyBonus;
    }
    
    // Correction 5: Very conservative bounds (much wider than Enhanced)
    const minReasonable = days * 30;  // Lower minimum
    const maxReasonable = days * 800; // Higher maximum
    
    if (result < minReasonable) {
      result = minReasonable;
    } else if (result > maxReasonable) {
      result = maxReasonable;
    }
    
    return result;
  }

  /**
   * Train with minimal receipt processing to preserve original model strength
   */
  public train(trainingData: Array<{days: number; miles: number; receipts: number; expected: number}>): void {
    console.log('⚖️  Training Balanced Polynomial Calculator...');
    
    // Only smooth extreme outliers during training (higher threshold)
    const processedData = trainingData.map(data => {
      let adjustedReceipts = data.receipts;
      
      // Only adjust the most extreme outliers
      if (adjustedReceipts > 3000) {
        adjustedReceipts = 3000 + Math.log(adjustedReceipts - 3000);
      }
      
      return {
        ...data,
        receipts: adjustedReceipts
      };
    });
    
    // Train the base model with minimally processed data
    super.train(processedData);
    
    console.log('✅ Balanced model training complete!');
  }
} 