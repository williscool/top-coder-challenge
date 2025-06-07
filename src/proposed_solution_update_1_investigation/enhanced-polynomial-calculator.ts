/**
 * Enhanced Polynomial Calculator with Business Rule Constraints
 * Addresses receipt over-weighting and adds logical caps/corrections
 */

import { AdvancedPolynomialReimbursementCalculator } from '../advanced-polynomial-calculator';

export class EnhancedPolynomialReimbursementCalculator extends AdvancedPolynomialReimbursementCalculator {
  
  /**
   * Calculate reimbursement with post-processing business rules
   */
  public calculateReimbursement(days: number, miles: number, receipts: number): number {
    // Pre-process receipts to reduce over-weighting
    const processedReceipts = this.preprocessReceipts(receipts);
    
    // Get base polynomial prediction with processed receipts
    let result = super.calculateReimbursement(days, miles, processedReceipts);
    
    // Apply business rule constraints and corrections (use original receipts for rules)
    result = this.applyBusinessRuleConstraints(result, days, miles, receipts);
    
    return Math.round(result * 100) / 100;
  }

  /**
   * Apply business rule constraints based on diagnostic findings
   */
  private applyBusinessRuleConstraints(baseResult: number, days: number, miles: number, receipts: number): number {
    let result = baseResult;
    const efficiency = miles / days;
    const receiptsPerDay = receipts / days;
    
    // Rule 1: Receipt Cap - High receipts shouldn't dominate the calculation
    if (receipts > 1000) {
      // Apply diminishing returns for very high receipts
      const receiptPenalty = Math.min(300, (receipts - 1000) * 0.1);
      result = Math.max(result - receiptPenalty, result * 0.7); // Cap at 30% reduction
      console.log(`High receipt penalty applied: -$${receiptPenalty.toFixed(2)} for $${receipts.toFixed(2)} receipts`);
    }
    
    // Rule 2: Efficiency Corrections
    if (efficiency < 30) {
      // Very low efficiency trips - likely local/stationary
      const efficiencyBonus = Math.min(100, (30 - efficiency) * 2);
      result += efficiencyBonus;
    } else if (efficiency > 400) {
      // Extremely high efficiency - likely long-distance driving
      const efficiencyPenalty = Math.min(200, (efficiency - 400) * 0.3);
      result = Math.max(result - efficiencyPenalty, result * 0.8);
    }
    
    // Rule 3: Receipt-to-Output Ratio Cap
    // Based on analysis, reimbursement should rarely exceed 2x receipts for short trips
    if (days <= 3 && result > receipts * 2.5) {
      result = Math.min(result, receipts * 2.5);
    }
    
    // Rule 4: Single-day trip special handling
    if (days === 1) {
      // Single day trips with very high receipts are often over-predicted
      if (receipts > 800 && result > 600) {
        result = Math.min(result, 200 + receipts * 0.3 + miles * 0.8);
      }
    }
    
    // Rule 5: Multi-day trip minimum efficiency requirement
    if (days >= 7) {
      // Long trips should have some minimum efficiency component
      const minEfficiencyContrib = days * Math.min(efficiency * 0.5, 50);
      if (result < minEfficiencyContrib) {
        result = Math.max(result, minEfficiencyContrib);
      }
    }
    
    // Rule 6: Receipt spending pattern adjustment
    if (receiptsPerDay > 300) {
      // High daily spending might indicate different reimbursement category
      const spendingAdjustment = (receiptsPerDay - 300) * 0.1 * days;
      result = Math.max(result - spendingAdjustment, result * 0.75);
    }
    
    // Rule 7: Reasonable bounds check
    // Reimbursement should generally be between $50/day and $500/day
    const minReasonable = days * 50;
    const maxReasonable = days * 500;
    
    if (result < minReasonable) {
      result = Math.max(result, minReasonable);
    } else if (result > maxReasonable) {
      result = Math.min(result, maxReasonable);
    }
    
    return result;
  }

  /**
   * Pre-process receipts to reduce over-weighting
   */
  private preprocessReceipts(receipts: number): number {
    // Apply dampening for high receipt values
    if (receipts > 1500) {
      return 1500 + Math.sqrt(receipts - 1500);
    }
    return receipts;
  }

  /**
   * Train with receipt dampening
   */
  public train(trainingData: Array<{days: number; miles: number; receipts: number; expected: number}>): void {
    console.log('🧮 Training Enhanced Polynomial Calculator with Business Rules...');
    
    // Pre-process training data to reduce receipt outlier impact
    const processedData = trainingData.map(data => {
      let adjustedReceipts = data.receipts;
      
      // Dampen extreme receipt values during training
      if (adjustedReceipts > 2000) {
        adjustedReceipts = 2000 + Math.sqrt(adjustedReceipts - 2000);
      }
      
      return {
        ...data,
        receipts: adjustedReceipts
      };
    });
    
    // Train the base model with processed data
    super.train(processedData);
    
    console.log('✅ Enhanced model training complete!');
  }
} 