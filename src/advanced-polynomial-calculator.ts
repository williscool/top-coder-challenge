/**
 * Advanced Polynomial Regression Calculator
 * Enhanced with sophisticated feature engineering and optimization
 */

export class AdvancedPolynomialReimbursementCalculator {
  private coefficients: number[] = [];
  private featureNames: string[] = [];
  private normalizationParams: { means: number[]; stds: number[] } = { means: [], stds: [] };

  /**
   * Train the advanced polynomial model
   */
  public train(trainingData: Array<{days: number; miles: number; receipts: number; expected: number}>): void {
    console.log(`Training advanced polynomial model on ${trainingData.length} cases...`);
    
    // Create sophisticated feature matrix
    const features = trainingData.map(data => this.extractAdvancedFeatures(data.days, data.miles, data.receipts));
    const targets = trainingData.map(data => data.expected);

    // Normalize features
    const normalized = this.normalizeFeatures(features);
    
    // Advanced gradient descent with learning rate scheduling
    this.coefficients = this.advancedGradientDescent(normalized.normalizedFeatures, targets);
    this.normalizationParams = { means: normalized.means, stds: normalized.stds };

    console.log('\nAdvanced Polynomial Model Features:');
    this.featureNames.forEach((name, i) => {
      if (Math.abs(this.coefficients[i]) > 0.001) {
        console.log(`  ${this.coefficients[i].toFixed(6)} × ${name}`);
      }
    });
  }

  /**
   * Extract sophisticated polynomial features
   */
  private extractAdvancedFeatures(days: number, miles: number, receipts: number): number[] {
    // Avoid log(0) by adding small epsilon
    const safeDays = days;
    const safeMiles = Math.max(miles, 0.1);
    const safeReceipts = Math.max(receipts, 0.1);
    
    const features = [
      // Linear terms
      days, miles, receipts,
      
      // Quadratic terms
      days * days, miles * miles, receipts * receipts,
      
      // Cubic terms (new!)
      days * days * days, 
      Math.pow(miles, 3) / 1000000,  // Scale large cubic terms
      Math.pow(receipts, 3) / 1000000,
      
      // Interaction terms
      days * miles, days * receipts, miles * receipts,
      
      // Advanced interaction terms (new!)
      days * days * miles, days * miles * miles,
      days * days * receipts, days * receipts * receipts,
      miles * receipts * receipts, miles * miles * receipts,
      
      // Logarithmic features (new!)
      Math.log(safeDays + 1), Math.log(safeMiles + 1), Math.log(safeReceipts + 1),
      
      // Ratio features (new!)
      miles / days,           // Miles per day (Kevin's efficiency)
      receipts / days,        // Receipts per day (spending rate)
      receipts / Math.max(miles, 1), // Receipts per mile (spending efficiency)
      
      // Advanced ratio features (new!)
      (miles / days) * (miles / days),     // Efficiency squared
      Math.log((miles / days) + 1),        // Log efficiency
      Math.log((receipts / days) + 1),     // Log spending rate
      
      // Categorical-like features based on ranges (new!)
      days === 1 ? 1 : 0,                 // Single day indicator
      (days >= 2 && days <= 4) ? 1 : 0,   // Short trip indicator
      (days >= 5 && days <= 7) ? 1 : 0,   // Medium trip indicator
      (days >= 8) ? 1 : 0,                // Long trip indicator
      
      // Kevin's efficiency sweet spot indicators (new!)
      ((miles/days) >= 180 && (miles/days) <= 220) ? 1 : 0,  // Kevin's sweet spot
      ((miles/days) >= 100 && (miles/days) <= 180) ? 1 : 0,  // Good efficiency
      
      // Receipt range indicators (new!)
      (receipts <= 200) ? 1 : 0,          // Low receipts
      (receipts >= 600 && receipts <= 800) ? 1 : 0,  // Lisa's sweet spot
      (receipts >= 1500) ? 1 : 0,         // High receipts
      
      // Complex interaction with indicators (new!)
      days * ((miles/days >= 180 && miles/days <= 220) ? 1 : 0),  // Days in sweet spot
      miles * (receipts <= 200 ? 1 : 0),  // Miles with low receipts
      receipts * (days === 1 ? 1 : 0),    // Receipts on single day
      
      1  // Intercept
    ];

    // Store feature names for debugging (only on first call)
    if (this.featureNames.length === 0) {
      this.featureNames = [
        'days', 'miles', 'receipts',
        'days²', 'miles²', 'receipts²',
        'days³', 'miles³/1M', 'receipts³/1M',
        'days×miles', 'days×receipts', 'miles×receipts',
        'days²×miles', 'days×miles²', 'days²×receipts', 'days×receipts²',
        'miles×receipts²', 'miles²×receipts',
        'log(days+1)', 'log(miles+1)', 'log(receipts+1)',
        'miles/day', 'receipts/day', 'receipts/mile',
        '(miles/day)²', 'log(miles/day+1)', 'log(receipts/day+1)',
        'is_single_day', 'is_short_trip', 'is_medium_trip', 'is_long_trip',
        'is_kevin_sweet_spot', 'is_good_efficiency',
        'is_low_receipts', 'is_lisa_sweet_spot', 'is_high_receipts',
        'days×kevin_sweet_spot', 'miles×low_receipts', 'receipts×single_day',
        'intercept'
      ];
    }

    return features;
  }

  /**
   * Advanced feature normalization
   */
  private normalizeFeatures(features: number[][]): {
    normalizedFeatures: number[][];
    means: number[];
    stds: number[];
  } {
    const numFeatures = features[0].length - 1; // Exclude intercept
    const means = new Array(numFeatures).fill(0);
    const stds = new Array(numFeatures).fill(1);
    
    // Calculate means (excluding intercept)
    for (let i = 0; i < features.length; i++) {
      for (let j = 0; j < numFeatures; j++) {
        means[j] += features[i][j];
      }
    }
    for (let j = 0; j < numFeatures; j++) {
      means[j] /= features.length;
    }
    
    // Calculate standard deviations
    for (let i = 0; i < features.length; i++) {
      for (let j = 0; j < numFeatures; j++) {
        stds[j] += Math.pow(features[i][j] - means[j], 2);
      }
    }
    for (let j = 0; j < numFeatures; j++) {
      stds[j] = Math.sqrt(stds[j] / features.length);
      if (stds[j] === 0) stds[j] = 1; // Prevent division by zero
    }
    
    // Normalize features
    const normalizedFeatures = features.map(row => [
      ...row.slice(0, numFeatures).map((val, j) => (val - means[j]) / stds[j]),
      1 // Keep intercept as 1
    ]);
    
    return { normalizedFeatures, means, stds };
  }

  /**
   * Advanced gradient descent with learning rate scheduling and regularization
   */
  private advancedGradientDescent(features: number[][], targets: number[]): number[] {
    const numFeatures = features[0].length;
    let coeffs = new Array(numFeatures).fill(0);
    
    const initialLearningRate = 0.01;
    const regularization = 0.0001; // L2 regularization
    const iterations = 10000;
    const n = features.length;
    
    let bestMSE = Infinity;
    let bestCoeffs = [...coeffs];
    let patience = 0;
    const maxPatience = 1000;
    
    for (let iter = 0; iter < iterations; iter++) {
      // Learning rate scheduling: decay over time
      const learningRate = initialLearningRate * Math.pow(0.999, iter / 100);
      
      // Calculate predictions
      const predictions = features.map(row => 
        row.reduce((sum, val, j) => sum + val * coeffs[j], 0)
      );
      
      // Calculate MSE for early stopping
      const mse = predictions.reduce((sum, pred, i) => sum + Math.pow(pred - targets[i], 2), 0) / n;
      
      // Early stopping
      if (mse < bestMSE) {
        bestMSE = mse;
        bestCoeffs = [...coeffs];
        patience = 0;
      } else {
        patience++;
        if (patience > maxPatience) {
          console.log(`Early stopping at iteration ${iter}, best MSE: ${bestMSE.toFixed(2)}`);
          break;
        }
      }
      
      // Calculate gradients with L2 regularization
      const gradients = new Array(numFeatures).fill(0);
      for (let i = 0; i < n; i++) {
        const error = predictions[i] - targets[i];
        for (let j = 0; j < numFeatures; j++) {
          gradients[j] += error * features[i][j];
          // Add L2 regularization (except for intercept)
          if (j < numFeatures - 1) {
            gradients[j] += regularization * coeffs[j];
          }
        }
      }
      
      // Update coefficients with gradient clipping
      for (let j = 0; j < numFeatures; j++) {
        const update = learningRate * gradients[j] / n;
        const clippedUpdate = Math.max(-1, Math.min(1, update));
        coeffs[j] -= clippedUpdate;
      }
      
      // Print progress
      if (iter % 2000 === 0) {
        console.log(`Iteration ${iter}: MSE = ${mse.toFixed(2)}, LR = ${learningRate.toFixed(6)}`);
      }
    }
    
    console.log(`Final best MSE: ${bestMSE.toFixed(2)}`);
    return bestCoeffs;
  }

  /**
   * Calculate reimbursement using trained model
   */
  public calculateReimbursement(days: number, miles: number, receipts: number): number {
    const features = this.extractAdvancedFeatures(days, miles, receipts);
    
    // Normalize features using stored parameters
    const normalizedFeatures = features.map((val, j) => {
      if (j === features.length - 1) return 1; // Keep intercept as 1
      return (val - this.normalizationParams.means[j]) / this.normalizationParams.stds[j];
    });
    
    const result = normalizedFeatures.reduce((sum, val, j) => sum + val * this.coefficients[j], 0);
    return Math.round(result * 100) / 100;
  }

  /**
   * Evaluate model performance
   */
  public evaluate(testData: Array<{days: number; miles: number; receipts: number; expected: number}>): {
    exactMatches: number;
    closeMatches: number;
    avgError: number;
    maxError: number;
  } {
    let exactMatches = 0;
    let closeMatches = 0;
    let totalError = 0;
    let maxError = 0;

    for (const data of testData) {
      const predicted = this.calculateReimbursement(data.days, data.miles, data.receipts);
      const error = Math.abs(predicted - data.expected);

      if (error < 0.01) exactMatches++;
      if (error < 1.0) closeMatches++;
      totalError += error;
      maxError = Math.max(maxError, error);
    }

    return {
      exactMatches,
      closeMatches,
      avgError: totalError / testData.length,
      maxError
    };
  }

  /**
   * Get feature importance (absolute values of coefficients)
   */
  public getFeatureImportance(): Array<{feature: string; coefficient: number; importance: number}> {
    return this.featureNames.map((name, i) => ({
      feature: name,
      coefficient: this.coefficients[i],
      importance: Math.abs(this.coefficients[i])
    })).sort((a, b) => b.importance - a.importance);
  }
} 