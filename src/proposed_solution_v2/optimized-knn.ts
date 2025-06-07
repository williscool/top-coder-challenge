/**
 * Optimized K-Nearest Neighbors Calculator
 * Multiple similarity metrics and adaptive neighborhood sizing
 */

export class OptimizedKNNReimbursementCalculator {
  private trainingCases: Array<{days: number; miles: number; receipts: number; expected: number}> = [];
  
  public train(trainingData: Array<{days: number; miles: number; receipts: number; expected: number}>): void {
    console.log('🚀 Training Optimized KNN Calculator...');
    this.trainingCases = [...trainingData];
    console.log('✅ Optimized KNN training complete!');
  }

  /**
   * Multi-metric ensemble KNN
   */
  public calculateReimbursement(days: number, miles: number, receipts: number): number {
    // Try multiple approaches and ensemble them
    const result1 = this.calculateWithEuclideanSimilarity(days, miles, receipts, 15);
    const result2 = this.calculateWithManhattanSimilarity(days, miles, receipts, 12);
    const result3 = this.calculateWithBusinessSimilarity(days, miles, receipts, 10);
    const result4 = this.calculateWithExactMatchBonus(days, miles, receipts, 8);
    
    // Weighted ensemble of different approaches
    const ensembleResult = (
      result1 * 0.3 +  // Euclidean
      result2 * 0.25 + // Manhattan  
      result3 * 0.35 + // Business-aware
      result4 * 0.1    // Exact match bonus
    );
    
    return Math.round(ensembleResult * 100) / 100;
  }

  /**
   * Euclidean distance-based similarity with larger k
   */
  private calculateWithEuclideanSimilarity(days: number, miles: number, receipts: number, k: number): number {
    const similarities = this.trainingCases.map(trainCase => {
      // Normalize features to 0-1 scale for fair comparison
      const daysNorm = Math.min(days, 14) / 14;
      const milesNorm = Math.min(miles, 2000) / 2000;
      const receiptsNorm = Math.min(receipts, 3000) / 3000;
      
      const trainDaysNorm = Math.min(trainCase.days, 14) / 14;
      const trainMilesNorm = Math.min(trainCase.miles, 2000) / 2000;
      const trainReceiptsNorm = Math.min(trainCase.receipts, 3000) / 3000;
      
      // Euclidean distance
      const distance = Math.sqrt(
        Math.pow(daysNorm - trainDaysNorm, 2) +
        Math.pow(milesNorm - trainMilesNorm, 2) +
        Math.pow(receiptsNorm - trainReceiptsNorm, 2)
      );
      
      return {
        case: trainCase,
        similarity: 1 / (1 + distance) // Convert distance to similarity
      };
    });
    
    return this.weightedAverage(similarities, k);
  }

  /**
   * Manhattan distance-based similarity
   */
  private calculateWithManhattanSimilarity(days: number, miles: number, receipts: number, k: number): number {
    const similarities = this.trainingCases.map(trainCase => {
      // Manhattan distance with feature weights
      const daysDist = Math.abs(days - trainCase.days) / Math.max(days, trainCase.days, 1);
      const milesDist = Math.abs(miles - trainCase.miles) / Math.max(miles, trainCase.miles, 1);
      const receiptsDist = Math.abs(receipts - trainCase.receipts) / Math.max(receipts, trainCase.receipts, 1);
      
      const distance = daysDist * 0.4 + milesDist * 0.3 + receiptsDist * 0.3;
      
      return {
        case: trainCase,
        similarity: 1 / (1 + distance)
      };
    });
    
    return this.weightedAverage(similarities, k);
  }

  /**
   * Business logic-aware similarity
   */
  private calculateWithBusinessSimilarity(days: number, miles: number, receipts: number, k: number): number {
    const efficiency = miles / days;
    const receiptsPerDay = receipts / days;
    
    const similarities = this.trainingCases.map(trainCase => {
      const trainEfficiency = trainCase.miles / trainCase.days;
      const trainReceiptsPerDay = trainCase.receipts / trainCase.days;
      
      let similarity = 0;
      
      // Exact day match bonus
      if (days === trainCase.days) {
        similarity += 0.4;
      } else {
        similarity += 0.4 * Math.exp(-Math.abs(days - trainCase.days) * 0.3);
      }
      
      // Efficiency similarity
      const efficiencyRatio = Math.min(efficiency, trainEfficiency) / Math.max(efficiency, trainEfficiency, 1);
      similarity += 0.3 * efficiencyRatio;
      
      // Daily spending similarity
      const spendingRatio = Math.min(receiptsPerDay, trainReceiptsPerDay) / Math.max(receiptsPerDay, trainReceiptsPerDay, 1);
      similarity += 0.3 * spendingRatio;
      
      return {
        case: trainCase,
        similarity: similarity
      };
    });
    
    return this.weightedAverage(similarities, k);
  }

  /**
   * Exact match bonus system
   */
  private calculateWithExactMatchBonus(days: number, miles: number, receipts: number, k: number): number {
    const similarities = this.trainingCases.map(trainCase => {
      let similarity = 0;
      
      // Massive bonus for exact matches on any dimension
      if (days === trainCase.days) similarity += 0.5;
      if (Math.abs(miles - trainCase.miles) < 10) similarity += 0.3;
      if (Math.abs(receipts - trainCase.receipts) < 10) similarity += 0.3;
      
      // Proximity bonuses
      const daysDiff = Math.abs(days - trainCase.days);
      const milesDiff = Math.abs(miles - trainCase.miles);
      const receiptsDiff = Math.abs(receipts - trainCase.receipts);
      
      if (daysDiff <= 1) similarity += 0.2;
      if (milesDiff <= 50) similarity += 0.1;
      if (receiptsDiff <= 100) similarity += 0.1;
      
      // Efficiency range bonuses
      const efficiency = miles / days;
      const trainEfficiency = trainCase.miles / trainCase.days;
      
      if (Math.abs(efficiency - trainEfficiency) < 20) similarity += 0.15;
      
      return {
        case: trainCase,
        similarity: similarity
      };
    });
    
    return this.weightedAverage(similarities, k);
  }

  /**
   * Weighted average calculation with exponential decay
   */
  private weightedAverage(similarities: Array<{case: any; similarity: number}>, k: number): number {
    similarities.sort((a, b) => b.similarity - a.similarity);
    const neighbors = similarities.slice(0, k);
    
    let totalWeight = 0;
    let weightedSum = 0;
    
    neighbors.forEach((neighbor, index) => {
      // Exponential decay + similarity weighting
      const positionWeight = Math.exp(-index * 0.2);
      const finalWeight = (neighbor.similarity + 0.001) * positionWeight;
      
      weightedSum += neighbor.case.expected * finalWeight;
      totalWeight += finalWeight;
    });
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Adaptive k-selection based on input characteristics
   */
  public calculateReimbursementAdaptive(days: number, miles: number, receipts: number): number {
    // Choose k based on how "typical" the input is
    const efficiency = miles / days;
    const receiptsPerDay = receipts / days;
    
    let k = 10; // Default
    
    // Use more neighbors for edge cases
    if (days === 1 || days >= 10) k = 15;
    if (efficiency > 300 || efficiency < 20) k = 12;
    if (receiptsPerDay > 400 || receiptsPerDay < 20) k = 12;
    if (receipts > 2000) k = 8; // Use fewer for extreme cases
    
    return this.calculateWithBusinessSimilarity(days, miles, receipts, k);
  }
} 