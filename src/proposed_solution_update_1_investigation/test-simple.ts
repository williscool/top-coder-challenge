#!/usr/bin/env ts-node

import * as fs from 'fs';
import { SimpleReimbursementCalculator } from './simple-calculator';

interface TestCase {
  input: {
    trip_duration_days: number;
    miles_traveled: number;
    total_receipts_amount: number;
  };
  expected_output: number;
}

function testSimpleCalculator() {
  console.log('🧪 Testing Simple Calculator');
  console.log('============================');
  console.log();

  const publicCasesData = fs.readFileSync('public_cases.json', 'utf8');
  const testCases: TestCase[] = JSON.parse(publicCasesData);
  
  const calculator = new SimpleReimbursementCalculator();
  
  // Test the high-error cases from the original evaluation
  const problematicCases = [
    // Case 370: 4 days, 825 miles, $874.99 receipts - Expected: $784.52
    {days: 4, miles: 825, receipts: 874.99, expected: 784.52},
    // Case 912: 4 days, 724 miles, $89.99 receipts - Expected: $667.98  
    {days: 4, miles: 724, receipts: 89.99, expected: 667.98},
    // Case 358: 5 days, 966 miles, $359.51 receipts - Expected: $927.98
    {days: 5, miles: 966, receipts: 359.51, expected: 927.98},
  ];

  console.log('🎯 Testing Problematic Cases:');
  for (const testCase of problematicCases) {
    const calculated = calculator.calculateReimbursement(testCase.days, testCase.miles, testCase.receipts);
    const error = Math.abs(calculated - testCase.expected);
    const breakdown = calculator.getBreakdown(testCase.days, testCase.miles, testCase.receipts);
    
    console.log(`  ${testCase.days} days, ${testCase.miles} miles, $${testCase.receipts} receipts:`);
    console.log(`    Expected: $${testCase.expected}`);
    console.log(`    Calculated: $${calculated}`);
    console.log(`    Error: $${error.toFixed(2)}`);
    console.log(`    Breakdown: Duration=$${breakdown.duration}, Mileage=$${breakdown.mileage}, Receipt=$${breakdown.receipt}`);
    console.log();
  }

  // Test a small sample to get overall accuracy
  console.log('📊 Testing Random Sample (first 20 cases):');
  let exactMatches = 0;
  let closeMatches = 0;
  let totalError = 0;
  const sampleSize = Math.min(20, testCases.length);

  for (let i = 0; i < sampleSize; i++) {
    const testCase = testCases[i];
    const { trip_duration_days, miles_traveled, total_receipts_amount } = testCase.input;
    const expected = testCase.expected_output;
    
    const calculated = calculator.calculateReimbursement(trip_duration_days, miles_traveled, total_receipts_amount);
    const error = Math.abs(calculated - expected);
    
    if (error < 0.01) exactMatches++;
    if (error < 1.0) closeMatches++;
    totalError += error;

    if (i < 5) {  // Show first 5 cases
      console.log(`    Case ${i+1}: ${trip_duration_days}d, ${miles_traveled}mi, $${total_receipts_amount} → Expected: $${expected}, Got: $${calculated}, Error: $${error.toFixed(2)}`);
    }
  }

  const avgError = totalError / sampleSize;
  console.log();
  console.log(`📈 Sample Results (${sampleSize} cases):`);
  console.log(`  Exact matches (±$0.01): ${exactMatches}/${sampleSize} (${(exactMatches/sampleSize*100).toFixed(1)}%)`);
  console.log(`  Close matches (±$1.00): ${closeMatches}/${sampleSize} (${(closeMatches/sampleSize*100).toFixed(1)}%)`);
  console.log(`  Average error: $${avgError.toFixed(2)}`);

  console.log();
  if (avgError < 100) {
    console.log('✅ Much better! This approach is on the right track.');
    console.log('💡 Next: Fine-tune the parameters and test on all 1,000 cases.');
  } else {
    console.log('⚠️  Still needs work, but probably closer than the complex approach.');
    console.log('💡 Next: Analyze specific error patterns and adjust.');
  }
}

if (require.main === module) {
  testSimpleCalculator();
} 