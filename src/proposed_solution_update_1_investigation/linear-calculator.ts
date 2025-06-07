/**
 * Linear Regression Calculator
 * Testing if the reimbursement system is just: Output = a*days + b*miles + c*receipts + d
 */

export class LinearReimbursementCalculator {
  private coefficients = {
    days: 0,
    miles: 0,
    receipts: 0,
    intercept: 0
  };

  /**
   * Train the linear model using least squares on the given training data
   */
  public train(trainingData: Array<{days: number; miles: number; receipts: number; expected: number}>): void {
    console.log(`Training linear model on ${trainingData.length} cases...`);
    
    // Set up matrices for least squares: Ax = b
    // where A is the feature matrix and b is the target vector
    const n = trainingData.length;
    const A: number[][] = [];
    const b: number[] = [];

    for (const data of trainingData) {
      A.push([data.days, data.miles, data.receipts, 1]); // [days, miles, receipts, 1] for intercept
      b.push(data.expected);
    }

    // Solve using normal equation: x = (A^T * A)^(-1) * A^T * b
    // For simplicity, let's use a basic gradient descent approach
    this.gradientDescent(A, b);
  }

  /**
   * Simple and stable linear regression using normal equations
   */
  private gradientDescent(A: number[][], b: number[]): void {
    const n = A.length;
    
    // Normalize features to prevent numerical instability
    const means = [0, 0, 0, 0];
    const stds = [1, 1, 1, 1];
    
    // Calculate means
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < 3; j++) { // Only normalize first 3 features (not intercept)
        means[j] += A[i][j];
      }
    }
    for (let j = 0; j < 3; j++) {
      means[j] /= n;
    }
    
    // Calculate standard deviations
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < 3; j++) {
        stds[j] += Math.pow(A[i][j] - means[j], 2);
      }
    }
    for (let j = 0; j < 3; j++) {
      stds[j] = Math.sqrt(stds[j] / n);
      if (stds[j] === 0) stds[j] = 1; // Prevent division by zero
    }
    
    // Normalize features
    const A_norm = A.map(row => [
      (row[0] - means[0]) / stds[0], // days
      (row[1] - means[1]) / stds[1], // miles  
      (row[2] - means[2]) / stds[2], // receipts
      1 // intercept
    ]);
    
    // Use simple least squares with smaller learning rate
    let coeffs = [0, 0, 0, 0]; // Start with zeros
    
    const learningRate = 0.00001; // Much smaller learning rate
    const iterations = 5000;
    
    for (let iter = 0; iter < iterations; iter++) {
      // Calculate predictions
      const predictions = A_norm.map(row => 
        row[0] * coeffs[0] + row[1] * coeffs[1] + row[2] * coeffs[2] + row[3] * coeffs[3]
      );

      // Calculate gradients
      const gradients = [0, 0, 0, 0];
      for (let i = 0; i < n; i++) {
        const error = predictions[i] - b[i];
        for (let j = 0; j < 4; j++) {
          gradients[j] += error * A_norm[i][j];
        }
      }

      // Update coefficients with clipping to prevent explosion
      for (let j = 0; j < 4; j++) {
        const update = learningRate * gradients[j] / n;
        coeffs[j] -= Math.max(-10, Math.min(10, update)); // Clip updates
      }

      // Print progress occasionally
      if (iter % 1000 === 0) {
        const mse = predictions.reduce((sum, pred, i) => sum + Math.pow(pred - b[i], 2), 0) / n;
        if (iter === 0) {
          console.log(`Iteration ${iter}: MSE = ${mse.toFixed(2)}`);
        }
      }
    }

    // Denormalize coefficients back to original scale
    this.coefficients.days = coeffs[0] / stds[0];
    this.coefficients.miles = coeffs[1] / stds[1];
    this.coefficients.receipts = coeffs[2] / stds[2];
    this.coefficients.intercept = coeffs[3] - (coeffs[0] * means[0] / stds[0]) - (coeffs[1] * means[1] / stds[1]) - (coeffs[2] * means[2] / stds[2]);

    console.log('\nFinal Linear Model:');
    console.log(`Output = ${this.coefficients.days.toFixed(4)} * days + ${this.coefficients.miles.toFixed(4)} * miles + ${this.coefficients.receipts.toFixed(4)} * receipts + ${this.coefficients.intercept.toFixed(4)}`);
  }

  /**
   * Calculate reimbursement using the trained linear model
   */
  public calculateReimbursement(days: number, miles: number, receipts: number): number {
    const result = 
      this.coefficients.days * days +
      this.coefficients.miles * miles +
      this.coefficients.receipts * receipts +
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