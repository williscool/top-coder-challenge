/**
 * K-Nearest Neighbors Calculator
 * Finds similar historical cases and uses their reimbursement patterns
 * Better for complex business rules that don't follow polynomial patterns
 */

export class KNNReimbursementCalculator {
  private trainingCases: Array<{days: number; miles: number; receipts: number; expected: number}> = [];
  
  /**
   * Train by storing all historical cases
   */
  public train(trainingData: Array<{days: number; miles: number; receipts: number; expected: number}>): void {
    console.log('🎯 Training KNN Calculator (storing all historical patterns)...');
    this.trainingCases = [...trainingData];
    console.log('✅ KNN training complete!');
  }

  /**
   * Calculate reimbursement using k-nearest neighbors
   */
  public calculateReimbursement(days: number, miles: number, receipts: number): number {
    const k = 5; // Number of neighbors to consider
    
    // Calculate similarity scores for all training cases
    const similarities = this.trainingCases.map(trainCase => ({
      case: trainCase,
      similarity: this.calculateSimilarity(days, miles, receipts, trainCase.days, trainCase.miles, trainCase.receipts)
    }));
    
    // Sort by similarity (higher is more similar)
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    // Get the k most similar cases
    const nearestNeighbors = similarities.slice(0, k);
    
    // Calculate weighted average of their reimbursements
    let totalWeight = 0;
    let weightedSum = 0;
    
    nearestNeighbors.forEach(neighbor => {
      const weight = neighbor.similarity + 0.001; // Add small epsilon to avoid zero weights
      weightedSum += neighbor.case.expected * weight;
      totalWeight += weight;
    });
    
    const result = weightedSum / totalWeight;
    return Math.round(result * 100) / 100;
  }

  /**
   * Calculate similarity between two cases using multiple factors
   */
  private calculateSimilarity(days1: number, miles1: number, receipts1: number, 
                             days2: number, miles2: number, receipts2: number): number {
    
    // Normalize inputs to similar scales
    const daysDiff = Math.abs(days1 - days2) / Math.max(days1, days2, 1);
    const milesDiff = Math.abs(miles1 - miles2) / Math.max(miles1, miles2, 1);
    const receiptsDiff = Math.abs(receipts1 - receipts2) / Math.max(receipts1, receipts2, 1);
    
    // Calculate efficiency similarity
    const efficiency1 = miles1 / days1;
    const efficiency2 = miles2 / days2;
    const efficiencyDiff = Math.abs(efficiency1 - efficiency2) / Math.max(efficiency1, efficiency2, 1);
    
    // Calculate daily spending similarity
    const receiptsPerDay1 = receipts1 / days1;
    const receiptsPerDay2 = receipts2 / days2;
    const dailySpendingDiff = Math.abs(receiptsPerDay1 - receiptsPerDay2) / Math.max(receiptsPerDay1, receiptsPerDay2, 1);
    
    // Weighted similarity score (lower differences = higher similarity)
    const similarity = 1 - (
      daysDiff * 0.25 +           // Days weight: 25%
      milesDiff * 0.25 +          // Miles weight: 25%
      receiptsDiff * 0.20 +       // Receipts weight: 20%
      efficiencyDiff * 0.15 +     // Efficiency weight: 15%
      dailySpendingDiff * 0.15    // Daily spending weight: 15%
    );
    
    // Bonus for exact day matches (business rules might be day-specific)
    if (days1 === days2) {
      return similarity * 1.1; // 10% bonus for exact day match
    }
    
    return Math.max(0, similarity); // Ensure non-negative similarity
  }

  /**
   * Enhanced version with pattern-aware similarity
   */
  public calculateReimbursementAdvanced(days: number, miles: number, receipts: number): number {
    const k = 7; // Slightly more neighbors for better averaging
    
    // Calculate similarities with pattern awareness
    const similarities = this.trainingCases.map(trainCase => {
      const baseSimilarity = this.calculateSimilarity(days, miles, receipts, 
                                                     trainCase.days, trainCase.miles, trainCase.receipts);
      
      // Pattern-specific bonuses
      let patternBonus = 0;
      
      // Bonus for similar trip "types"
      if (this.isSimilarTripType(days, miles, receipts, trainCase.days, trainCase.miles, trainCase.receipts)) {
        patternBonus += 0.2;
      }
      
      // Bonus for similar receipt patterns
      if (this.isSimilarReceiptPattern(days, receipts, trainCase.days, trainCase.receipts)) {
        patternBonus += 0.15;
      }
      
      // Bonus for similar efficiency patterns
      if (this.isSimilarEfficiencyPattern(days, miles, trainCase.days, trainCase.miles)) {
        patternBonus += 0.1;
      }
      
      return {
        case: trainCase,
        similarity: baseSimilarity + patternBonus
      };
    });
    
    // Sort and select neighbors
    similarities.sort((a, b) => b.similarity - a.similarity);
    const nearestNeighbors = similarities.slice(0, k);
    
    // Use exponential weighting to favor closer matches
    let totalWeight = 0;
    let weightedSum = 0;
    
    nearestNeighbors.forEach((neighbor, index) => {
      // Exponential decay: first neighbor gets most weight
      const weight = Math.exp(-index * 0.5) * (neighbor.similarity + 0.001);
      weightedSum += neighbor.case.expected * weight;
      totalWeight += weight;
    });
    
    const result = weightedSum / totalWeight;
    return Math.round(result * 100) / 100;
  }

  /**
   * Check if two trips are similar "types"
   */
  private isSimilarTripType(days1: number, miles1: number, receipts1: number,
                           days2: number, miles2: number, receipts2: number): boolean {
    // Define trip type categories
    const getType = (d: number, m: number, r: number) => {
      const efficiency = m / d;
      const spendingPerDay = r / d;
      
      if (d === 1) return 'single_day';
      if (d <= 3) return 'short_trip';
      if (d >= 8) return 'long_trip';
      if (efficiency > 200) return 'high_efficiency';
      if (efficiency < 30) return 'low_efficiency';
      if (spendingPerDay > 300) return 'high_spending';
      if (spendingPerDay < 50) return 'low_spending';
      return 'standard';
    };
    
    return getType(days1, miles1, receipts1) === getType(days2, miles2, receipts2);
  }

  /**
   * Check if receipt patterns are similar
   */
  private isSimilarReceiptPattern(days1: number, receipts1: number, days2: number, receipts2: number): boolean {
    const perDay1 = receipts1 / days1;
    const perDay2 = receipts2 / days2;
    
    // Consider similar if within 30% of each other
    const ratio = Math.min(perDay1, perDay2) / Math.max(perDay1, perDay2);
    return ratio > 0.7;
  }

  /**
   * Check if efficiency patterns are similar
   */
  private isSimilarEfficiencyPattern(days1: number, miles1: number, days2: number, miles2: number): boolean {
    const eff1 = miles1 / days1;
    const eff2 = miles2 / days2;
    
    // Consider similar if within 25% of each other
    const ratio = Math.min(eff1, eff2) / Math.max(eff1, eff2);
    return ratio > 0.75;
  }
} 