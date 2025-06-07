#!/usr/bin/env node

import {ReimbursementCalculator} from './calculator';
import {AdvancedPolynomialReimbursementCalculator} from './advanced-polynomial-calculator';
import {EnhancedPolynomialReimbursementCalculator} from './proposed_solution_update_1_investigation/enhanced-polynomial-calculator';
import * as fs from 'fs';

// Global trained calculator instance (singleton pattern for performance)
let trainedCalculator: EnhancedPolynomialReimbursementCalculator | null = null;

/**
 * Get or create a trained enhanced polynomial calculator
 */
function getTrainedCalculator(): EnhancedPolynomialReimbursementCalculator {
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

      trainedCalculator = new EnhancedPolynomialReimbursementCalculator();
      // Train silently (no console output for CLI usage)
      const originalLog = console.log;
      console.log = () => {}; // Suppress training output
      trainedCalculator.train(trainingData);
      console.log = originalLog; // Restore console.log

    } catch (error) {
      // Fallback to original calculator if training fails
      console.error('Warning: Failed to load enhanced polynomial calculator, using original');
      return new ReimbursementCalculator() as any;
    }
  }
  
  return trainedCalculator!; // Non-null assertion since we just created it
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

    // Use trained polynomial calculator
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
