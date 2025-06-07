#!/usr/bin/env ts-node

import * as fs from 'fs';
import { LinearReimbursementCalculator } from './linear-calculator';

interface TestCase {
  input: {
    trip_duration_days: number;
    miles_traveled: number;
    total_receipts_amount: number;
  };
  expected_output: number;
}

function testLinearApproach() {
  console.log('🧪 Testing Linear Regression Approach');
  console.log('=====================================');
  console.log();

  const publicCasesData = fs.readFileSync('public_cases.json', 'utf8');
  const testCases: TestCase[] = JSON.parse(publicCasesData);

  // Convert to training format
  const trainingData = testCases.map(testCase => ({
    days: testCase.input.trip_duration_days,
    miles: testCase.input.miles_traveled,
    receipts: testCase.input.total_receipts_amount,
    expected: testCase.expected_output
  }));

  // Split data: 80% training, 20% testing
  const splitIndex = Math.floor(trainingData.length * 0.8);
  const trainSet = trainingData.slice(0, splitIndex);
  const testSet = trainingData.slice(splitIndex);

  console.log(`📊 Data split: ${trainSet.length} training, ${testSet.length} testing cases`);
  console.log();

  // Train the model
  const calculator = new LinearReimbursementCalculator();
  calculator.train(trainSet);
  console.log();

  // Evaluate on test set
  console.log('🎯 Test Set Evaluation:');
  const testResults = calculator.evaluate(testSet);
  console.log(`  Exact matches (±$0.01): ${testResults.exactMatches}/${testSet.length} (${(testResults.exactMatches/testSet.length*100).toFixed(1)}%)`);
  console.log(`  Close matches (±$1.00): ${testResults.closeMatches}/${testSet.length} (${(testResults.closeMatches/testSet.length*100).toFixed(1)}%)`);
  console.log(`  Average error: $${testResults.avgError.toFixed(2)}`);
  console.log(`  Maximum error: $${testResults.maxError.toFixed(2)}`);
  console.log();

  // Also evaluate on full dataset to check for overfitting
  console.log('📈 Full Dataset Evaluation:');
  const fullResults = calculator.evaluate(trainingData);
  console.log(`  Exact matches (±$0.01): ${fullResults.exactMatches}/${trainingData.length} (${(fullResults.exactMatches/trainingData.length*100).toFixed(1)}%)`);
  console.log(`  Close matches (±$1.00): ${fullResults.closeMatches}/${trainingData.length} (${(fullResults.closeMatches/trainingData.length*100).toFixed(1)}%)`);
  console.log(`  Average error: $${fullResults.avgError.toFixed(2)}`);
  console.log();

  // Test specific problematic cases
  console.log('🎯 Testing Specific Cases:');
  const problematicCases = [
    {days: 4, miles: 825, receipts: 874.99, expected: 784.52},
    {days: 4, miles: 724, receipts: 89.99, expected: 667.98},
    {days: 5, miles: 966, receipts: 359.51, expected: 927.98},
  ];

  for (const testCase of problematicCases) {
    const predicted = calculator.calculateReimbursement(testCase.days, testCase.miles, testCase.receipts);
    const error = Math.abs(predicted - testCase.expected);
    
    console.log(`  ${testCase.days}d, ${testCase.miles}mi, $${testCase.receipts} → Expected: $${testCase.expected}, Got: $${predicted}, Error: $${error.toFixed(2)}`);
  }
  console.log();

  // Show the final model
  const coeffs = calculator.getCoefficients();
  console.log('📐 Final Linear Model:');
  console.log(`  Reimbursement = ${coeffs.days.toFixed(4)} × days + ${coeffs.miles.toFixed(4)} × miles + ${coeffs.receipts.toFixed(4)} × receipts + ${coeffs.intercept.toFixed(4)}`);
  console.log();

  if (fullResults.avgError < 100) {
    console.log('✅ Linear approach is working! This might be the right direction.');
    console.log('💡 The legacy system might actually be a simple linear model.');
  } else if (fullResults.avgError < 500) {
    console.log('🟡 Linear approach is better, but still needs improvement.');
    console.log('💡 Consider polynomial features or interaction terms.');
  } else {
    console.log('❌ Linear approach is not sufficient.');
    console.log('💡 The system is probably more complex than a simple linear model.');
  }
}

if (require.main === module) {
  testLinearApproach();
} 