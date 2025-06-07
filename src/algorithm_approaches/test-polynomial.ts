#!/usr/bin/env ts-node

import * as fs from 'fs';
import { PolynomialReimbursementCalculator } from './polynomial-calculator';

interface TestCase {
  input: {
    trip_duration_days: number;
    miles_traveled: number;
    total_receipts_amount: number;
  };
  expected_output: number;
}

function testPolynomialApproach() {
  console.log('🧪 Testing Polynomial Regression Approach');
  console.log('==========================================');
  console.log('Testing if system uses interaction terms: days×miles, days×receipts, days², etc.');
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

  // Split data: 80% training, 20% testing to avoid overfitting
  const splitIndex = Math.floor(trainingData.length * 0.8);
  const trainSet = trainingData.slice(0, splitIndex);
  const testSet = trainingData.slice(splitIndex);

  console.log(`📊 Data split: ${trainSet.length} training, ${testSet.length} testing cases`);
  console.log();

  // Train the polynomial model
  const calculator = new PolynomialReimbursementCalculator();
  calculator.train(trainSet);
  console.log();

  // Evaluate on test set (unseen data)
  console.log('🎯 Test Set Evaluation (Unseen Data):');
  const testResults = calculator.evaluate(testSet);
  console.log(`  Exact matches (±$0.01): ${testResults.exactMatches}/${testSet.length} (${(testResults.exactMatches/testSet.length*100).toFixed(1)}%)`);
  console.log(`  Close matches (±$1.00): ${testResults.closeMatches}/${testSet.length} (${(testResults.closeMatches/testSet.length*100).toFixed(1)}%)`);
  console.log(`  Average error: $${testResults.avgError.toFixed(2)}`);
  console.log(`  Maximum error: $${testResults.maxError.toFixed(2)}`);
  console.log();

  // Also evaluate on full dataset for comparison
  console.log('📈 Full Dataset Evaluation:');
  const fullResults = calculator.evaluate(trainingData);
  console.log(`  Exact matches (±$0.01): ${fullResults.exactMatches}/${trainingData.length} (${(fullResults.exactMatches/trainingData.length*100).toFixed(1)}%)`);
  console.log(`  Close matches (±$1.00): ${fullResults.closeMatches}/${trainingData.length} (${(fullResults.closeMatches/trainingData.length*100).toFixed(1)}%)`);
  console.log(`  Average error: $${fullResults.avgError.toFixed(2)}`);
  console.log();

  // Test the problematic cases from original evaluation
  console.log('🎯 Testing High-Error Cases from Original Evaluation:');
  const problematicCases = [
    {days: 4, miles: 825, receipts: 874.99, expected: 784.52, caseNum: 370},
    {days: 4, miles: 724, receipts: 89.99, expected: 667.98, caseNum: 912},
    {days: 5, miles: 966, receipts: 359.51, expected: 927.98, caseNum: 358},
    {days: 5, miles: 1028, receipts: 653.19, expected: 1313.95, caseNum: 267},
    {days: 4, miles: 730, receipts: 799.25, expected: 1250.66, caseNum: 528},
  ];

  for (const testCase of problematicCases) {
    const predicted = calculator.calculateReimbursement(testCase.days, testCase.miles, testCase.receipts);
    const error = Math.abs(predicted - testCase.expected);
    const improvement = error < 100 ? '✅ MAJOR IMPROVEMENT' : error < 500 ? '🟡 Some improvement' : '❌ Still poor';
    
    console.log(`  Case ${testCase.caseNum}: ${testCase.days}d, ${testCase.miles}mi, $${testCase.receipts}`);
    console.log(`    Expected: $${testCase.expected}, Got: $${predicted}, Error: $${error.toFixed(2)} ${improvement}`);
  }
  console.log();

  // Show the final polynomial model
  const coeffs = calculator.getCoefficients();
  console.log('📐 Final Polynomial Model:');
  console.log('Reimbursement =');
  console.log(`  ${coeffs.days.toFixed(4)} × days +`);
  console.log(`  ${coeffs.miles.toFixed(4)} × miles +`);
  console.log(`  ${coeffs.receipts.toFixed(4)} × receipts +`);
  console.log(`  ${coeffs.days2.toFixed(4)} × days² +`);
  console.log(`  ${coeffs.miles2.toFixed(6)} × miles² +`);
  console.log(`  ${coeffs.receipts2.toFixed(6)} × receipts² +`);
  console.log(`  ${coeffs.daysXmiles.toFixed(4)} × days×miles +`);
  console.log(`  ${coeffs.daysXreceipts.toFixed(4)} × days×receipts +`);
  console.log(`  ${coeffs.milesXreceipts.toFixed(6)} × miles×receipts +`);
  console.log(`  ${coeffs.intercept.toFixed(4)}`);
  console.log();

  // Analysis and next steps
  console.log('📊 Analysis:');
  
  if (fullResults.exactMatches > 100) {
    console.log('🎉 BREAKTHROUGH! Polynomial approach is working!');
    console.log(`✅ Achieved ${fullResults.exactMatches} exact matches (${(fullResults.exactMatches/trainingData.length*100).toFixed(1)}%)`);
    console.log('💡 Next: Fine-tune coefficients and test with fast-eval.sh');
  } else if (fullResults.exactMatches > 10) {
    console.log('🟡 Significant improvement! Polynomial features help.');
    console.log(`✅ Achieved ${fullResults.exactMatches} exact matches vs 0 with linear approach`);
    console.log('💡 Next: Try additional polynomial terms or hybrid approach');
  } else if (fullResults.avgError < 500) {
    console.log('🟡 Some improvement over linear regression.');
    console.log(`✅ Average error: $${fullResults.avgError.toFixed(2)} (vs $1283 with linear)`);
    console.log('💡 Next: Try lookup table or decision tree approach');
  } else {
    console.log('❌ Polynomial approach not sufficient.');
    console.log('💡 System likely uses lookup tables or complex business rules');
    console.log('   Next: Try range-based lookup tables or decision tree approach');
  }

  console.log();
  console.log('🚀 Next Steps from Action Plan:');
  console.log('  1. Run ./fast-eval.sh to test on all 1,000 cases');
  console.log('  2. If results are promising, try lookup table approach next'); 
  console.log('  3. If still poor, move to decision tree approach');
  console.log('  4. Update CLI to use best approach so far');
}

if (require.main === module) {
  testPolynomialApproach();
} 