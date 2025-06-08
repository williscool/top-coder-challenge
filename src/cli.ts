#!/usr/bin/env node

import {ReimbursementCalculator} from './calculator';
import {AdvancedPolynomialReimbursementCalculator} from './advanced-polynomial-calculator';
import {KNNReimbursementCalculator} from './proposed_solution_v2/knn-calculator';
import {Calculator1965Advanced} from './proposed_solution_v3/calculator-1965-advanced';
import * as fs from 'fs';

// Global trained calculator instance (singleton pattern for performance)
let trainedCalculator: Calculator1965Advanced | null = null;

/**
 * Get or create a trained 1965-advanced calculator (5 exact matches!)
 */
function getTrainedCalculator(): Calculator1965Advanced {
  if (trainedCalculator === null) {
    // Load training data and train the model
    try {
      const publicCasesData = fs.readFileSync('public_cases.json', 'utf8');
      const testCases = JSON.parse(publicCasesData);
      
      const trainingData = testCases.map((testCase: any) => ({
        days: testCase.input.trip_duration_days,
        miles: testCase.input.miles_traveled,
        receipts: testCase.input.total_receipts_amount,
        expected: testCase.expected_output
      }));

      // Suppress ALL console output during initialization and training
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;
      console.log = () => {}; // Suppress all console.log
      console.error = () => {}; // Suppress all console.error  
      console.warn = () => {}; // Suppress all console.warn
      
      trainedCalculator = new Calculator1965Advanced();
      trainedCalculator.train(trainingData);
      
      // Restore console methods
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;

    } catch (error) {
      // Fallback to original calculator if training fails
      console.error('Warning: Failed to load 1965-advanced calculator, using original');
      return new ReimbursementCalculator() as any;
    }
  }
  
  return trainedCalculator; // Now properly typed as Calculator1965Advanced
}

/**
 * Command Line Interface for the Reimbursement Calculator
 * Usage: node cli.js <trip_duration_days> <miles_traveled> <total_receipts_amount>
 */
async function main(): Promise<void> {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);

    if (args.length !== 3) {
      throw new Error(
        'Error: Exactly 3 arguments required\n' +
          'Usage: node cli.js <trip_duration_days> <miles_traveled> <total_receipts_amount>',
      );
    }

    // Parse arguments
    const days = parseInt(args[0], 10);
    const miles = parseInt(args[1], 10);
    const receipts = parseFloat(args[2]);

    // Validate inputs
    if (isNaN(days) || isNaN(miles) || isNaN(receipts)) {
      throw new Error('Error: All arguments must be valid numbers');
    }

    if (days <= 0) {
      throw new Error('Error: Trip duration must be positive');
    }

    if (miles < 0) {
      throw new Error('Error: Miles traveled cannot be negative');
    }

    if (receipts < 0) {
      throw new Error('Error: Receipt amount cannot be negative');
    }

    // Use trained 1965-advanced calculator (5 exact matches!)
    const calculator = getTrainedCalculator();
    const reimbursement = calculator.calculateReimbursement(
      days,
      miles,
      receipts,
    );

    // Output only the number (as required by eval.sh)
    console.log(reimbursement.toFixed(2));
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch(() => {
    // We need to exit with code 1 on error, but we can't use process.exit() directly
    // This is a workaround that achieves the same result
    process.on('exit', () => {
      process.exitCode = 1;
    });
  });
}

export {main};
