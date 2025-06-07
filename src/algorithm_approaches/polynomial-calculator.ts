/**
 * Polynomial Regression Calculator
 * Testing if the system uses interaction terms: days×miles, days×receipts, days², etc.
 */

export class PolynomialReimbursementCalculator {
  private coefficients = {
    days: 0,
    miles: 0,
    receipts: 0,
    days2: 0,           // days²
    miles2: 0,          // miles²
    receipts2: 0,       // receipts²
    daysXmiles: 0,      // days × miles
    daysXreceipts: 0,   // days × receipts
    milesXreceipts: 0,  // miles × receipts
    intercept: 0
  };

  /**
   * Train the polynomial model using gradient descent
   */
  public train(trainingData: Array<{days: number; miles: number; receipts: number; expected: number}>): void {
    console.log(`Training polynomial model on ${trainingData.length} cases...`);
    
    // Create feature matrix with polynomial terms
    const features = trainingData.map(data => this.extractFeatures(data.days, data.miles, data.receipts));
    const targets = trainingData.map(data => data.expected);

    // Normalize features to prevent numerical instability
    const normalized = this.normalizeFeatures(features);
    const { normalizedFeatures, means, stds } = normalized;

    // Train using gradient descent
    const coeffs = this.gradientDescent(normalizedFeatures, targets);

    // Denormalize coefficients
    this.denormalizeCoefficients(coeffs, means, stds);

    console.log('\nFinal Polynomial Model:');
    console.log(`Reimbursement = `);
    console.log(`  ${this.coefficients.days.toFixed(4)} × days +`);
    console.log(`  ${this.coefficients.miles.toFixed(4)} × miles +`);
    console.log(`  ${this.coefficients.receipts.toFixed(4)} × receipts +`);
    console.log(`  ${this.coefficients.days2.toFixed(4)} × days² +`);
    console.log(`  ${this.coefficients.miles2.toFixed(6)} × miles² +`);
    console.log(`  ${this.coefficients.receipts2.toFixed(6)} × receipts² +`);
    console.log(`  ${this.coefficients.daysXmiles.toFixed(4)} × days×miles +`);
    console.log(`  ${this.coefficients.daysXreceipts.toFixed(4)} × days×receipts +`);
    console.log(`  ${this.coefficients.milesXreceipts.toFixed(6)} × miles×receipts +`);
    console.log(`  ${this.coefficients.intercept.toFixed(4)}`);
  }

  /**
   * Extract polynomial features from inputs
   */
  private extractFeatures(days: number, miles: number, receipts: number): number[] {
    return [
      days,                    // linear terms
      miles,
      receipts,
      days * days,             // quadratic terms
      miles * miles,
      receipts * receipts,
      days * miles,            // interaction terms
      days * receipts,
      miles * receipts,
      1                        // intercept
    ];
  }

  /**
   * Normalize features to prevent numerical instability
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
   * Gradient descent with polynomial features
   */
  private gradientDescent(features: number[][], targets: number[]): number[] {
    const numFeatures = features[0].length;
    let coeffs = new Array(numFeatures).fill(0);
    
    const learningRate = 0.001;
    const iterations = 5000;
    const n = features.length;
    
    for (let iter = 0; iter < iterations; iter++) {
      // Calculate predictions
      const predictions = features.map(row => 
        row.reduce((sum, val, j) => sum + val * coeffs[j], 0)
      );
      
      // Calculate gradients
      const gradients = new Array(numFeatures).fill(0);
      for (let i = 0; i < n; i++) {
        const error = predictions[i] - targets[i];
        for (let j = 0; j < numFeatures; j++) {
          gradients[j] += error * features[i][j];
        }
      }
      
      // Update coefficients with clipping
      for (let j = 0; j < numFeatures; j++) {
        const update = learningRate * gradients[j] / n;
        coeffs[j] -= Math.max(-10, Math.min(10, update));
      }
      
      // Print progress
      if (iter % 1000 === 0) {
        const mse = predictions.reduce((sum, pred, i) => sum + Math.pow(pred - targets[i], 2), 0) / n;
        if (iter === 0 || iter === iterations - 1000) {
          console.log(`Iteration ${iter}: MSE = ${mse.toFixed(2)}`);
        }
      }
    }
    
    return coeffs;
  }

  /**
   * Denormalize coefficients back to original scale
   */
  private denormalizeCoefficients(coeffs: number[], means: number[], stds: number[]): void {
    // Map normalized coefficients back to original coefficient structure
    this.coefficients.days = coeffs[0] / stds[0];
    this.coefficients.miles = coeffs[1] / stds[1];
    this.coefficients.receipts = coeffs[2] / stds[2];
    this.coefficients.days2 = coeffs[3] / stds[3];
    this.coefficients.miles2 = coeffs[4] / stds[4];
    this.coefficients.receipts2 = coeffs[5] / stds[5];
    this.coefficients.daysXmiles = coeffs[6] / stds[6];
    this.coefficients.daysXreceipts = coeffs[7] / stds[7];
    this.coefficients.milesXreceipts = coeffs[8] / stds[8];
    
    // Calculate intercept adjustment
    this.coefficients.intercept = coeffs[9];
    for (let i = 0; i < 9; i++) {
      this.coefficients.intercept -= (coeffs[i] * means[i]) / stds[i];
    }
  }

  /**
   * Calculate reimbursement using the trained polynomial model
   */
  public calculateReimbursement(days: number, miles: number, receipts: number): number {
    const result = 
      this.coefficients.days * days +
      this.coefficients.miles * miles +
      this.coefficients.receipts * receipts +
      this.coefficients.days2 * days * days +
      this.coefficients.miles2 * miles * miles +
      this.coefficients.receipts2 * receipts * receipts +
      this.coefficients.daysXmiles * days * miles +
      this.coefficients.daysXreceipts * days * receipts +
      this.coefficients.milesXreceipts * miles * receipts +
      this.coefficients.intercept;

    return Math.round(result * 100) / 100;
  }

  /**
   * Get the current coefficients
   */
  public getCoefficients() {
    return { ...this.coefficients };
  }

  /**
   * Test the model on a dataset
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
} 