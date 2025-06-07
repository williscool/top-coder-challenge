#!/usr/bin/env node

import { ReimbursementCalculator } from './calculator';

/**
 * Command Line Interface for the Reimbursement Calculator
 * Usage: node cli.js <trip_duration_days> <miles_traveled> <total_receipts_amount>
 */
function main() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length !== 3) {
      console.error('Error: Exactly 3 arguments required');
      console.error('Usage: node cli.js <trip_duration_days> <miles_traveled> <total_receipts_amount>');
      process.exit(1);
    }

    // Parse arguments
    const days = parseInt(args[0], 10);
    const miles = parseInt(args[1], 10);
    const receipts = parseFloat(args[2]);

    // Validate inputs
    if (isNaN(days) || isNaN(miles) || isNaN(receipts)) {
      console.error('Error: All arguments must be valid numbers');
      process.exit(1);
    }

    if (days <= 0) {
      console.error('Error: Trip duration must be positive');
      process.exit(1);
    }

    if (miles < 0) {
      console.error('Error: Miles traveled cannot be negative');
      process.exit(1);
    }

    if (receipts < 0) {
      console.error('Error: Receipt amount cannot be negative');
      process.exit(1);
    }

    // Create calculator and compute reimbursement
    const calculator = new ReimbursementCalculator();
    const reimbursement = calculator.calculateReimbursement(days, miles, receipts);

    // Output only the number (as required by eval.sh)
    console.log(reimbursement.toFixed(2));

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main();
}

export { main }; 