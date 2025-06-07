#!/usr/bin/env ts-node

import * as fs from 'fs';
import { AdvancedPolynomialReimbursementCalculator } from '../advanced-polynomial-calculator';

interface TestCase {
  input: {
    trip_duration_days: number;
    miles_traveled: number;
    total_receipts_amount: number;
  };
  expected_output: number;
}

function testAdvancedPolynomialApproach() {
  console.log('🚀 Testing Advanced Polynomial Approach');
  console.log('=======================================');
  console.log('Enhanced with sophisticated feature engineering and optimization');
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

  // Split data for proper evaluation
  const splitIndex = Math.floor(trainingData.length * 0.8);
  const trainSet = trainingData.slice(0, splitIndex);
  const testSet = trainingData.slice(splitIndex);

  console.log(`📊 Data split: ${trainSet.length} training, ${testSet.length} testing cases`);
  console.log('🔬 Advanced features: 38 engineered features including:');
  console.log('   • Cubic terms (days³, miles³, receipts³)');
  console.log('   • Logarithmic features (log transforms)');
  console.log('   • Ratio features (miles/day, receipts/day, receipts/mile)');
  console.log('   • Categorical indicators (Kevin\'s sweet spot, Lisa\'s range)');
  console.log('   • Complex interactions (days×sweet_spot, miles×low_receipts)');
  console.log();

  // Train the advanced model
  const calculator = new AdvancedPolynomialReimbursementCalculator();
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

  // Evaluate on full dataset
  console.log('📈 Full Dataset Evaluation:');
  const fullResults = calculator.evaluate(trainingData);
  console.log(`  Exact matches (±$0.01): ${fullResults.exactMatches}/${trainingData.length} (${(fullResults.exactMatches/trainingData.length*100).toFixed(1)}%)`);
  console.log(`  Close matches (±$1.00): ${fullResults.closeMatches}/${trainingData.length} (${(fullResults.closeMatches/trainingData.length*100).toFixed(1)}%)`);
  console.log(`  Average error: $${fullResults.avgError.toFixed(2)}`);
  console.log();

  // Test problematic cases
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
    const improvement = error < 25 ? '🎉 EXCELLENT' : error < 50 ? '✅ MAJOR IMPROVEMENT' : error < 100 ? '🟡 Good improvement' : '❌ Still poor';
    
    console.log(`  Case ${testCase.caseNum}: ${testCase.days}d, ${testCase.miles}mi, $${testCase.receipts}`);
    console.log(`    Expected: $${testCase.expected}, Got: $${predicted.toFixed(2)}, Error: $${error.toFixed(2)} ${improvement}`);
  }
  console.log();

  // Show top feature importance
  console.log('🔍 Top 15 Most Important Features:');
  const featureImportance = calculator.getFeatureImportance();
  for (let i = 0; i < Math.min(15, featureImportance.length); i++) {
    const feat = featureImportance[i];
    console.log(`  ${i+1}. ${feat.feature}: ${feat.coefficient.toFixed(4)} (importance: ${feat.importance.toFixed(4)})`);
  }
  console.log();

  // Performance comparison
  console.log('📊 Performance Comparison:');
  console.log(`  vs Original complex: ${fullResults.avgError < 1000 ? '✅ Much better' : '❌ Still worse'} (was $1,027 avg error)`);
  console.log(`  vs Basic polynomial: ${fullResults.avgError < 187 ? '✅ Better' : fullResults.avgError < 250 ? '🟡 Similar' : '❌ Worse'} (was $187 avg error)`);
  console.log(`  vs Decision tree: ${fullResults.avgError < 781 ? '✅ Better' : '❌ Worse'} (was $781 avg error)`);
  console.log(`  vs Lookup tables: ${fullResults.avgError < 1031 ? '✅ Better' : '❌ Worse'} (was $1,031 avg error)`);
  console.log();

  // Progress assessment
  console.log('📈 Progress Assessment:');
  console.log('  🎯 Targets:');
  console.log('     • >10% exact matches = Significant improvement');
  console.log('     • >50% exact matches = Good performance'); 
  console.log('     • >95% exact matches = Excellent performance');
  console.log();

  if (fullResults.exactMatches > 500) {
    console.log('🎉 BREAKTHROUGH ACHIEVED! Advanced polynomial is working excellently!');
    console.log(`✅ Achieved ${fullResults.exactMatches} exact matches (${(fullResults.exactMatches/trainingData.length*100).toFixed(1)}%)`);
    console.log('💡 Recommendation: Update CLI and prepare for final submission');
  } else if (fullResults.exactMatches > 100) {
    console.log('🎉 MAJOR SUCCESS! Advanced polynomial is working very well!');
    console.log(`✅ Achieved ${fullResults.exactMatches} exact matches (${(fullResults.exactMatches/trainingData.length*100).toFixed(1)}%)`);
    console.log('💡 Recommendation: Fine-tune further or prepare for submission');
  } else if (fullResults.exactMatches > 10) {
    console.log('✅ Significant improvement! Advanced polynomial shows promise.');
    console.log(`✅ Achieved ${fullResults.exactMatches} exact matches (${(fullResults.exactMatches/trainingData.length*100).toFixed(1)}%)`);
    console.log('💡 Recommendation: Further optimization or submit current best');
  } else if (fullResults.avgError < 100) {
    console.log('🟡 Good improvement! Advanced polynomial is better than basic version.');
    console.log(`✅ Average error: $${fullResults.avgError.toFixed(2)} (vs $187 basic polynomial)`);
    console.log('💡 Recommendation: Consider this as best approach so far');
  } else if (fullResults.avgError < 187) {
    console.log('🟡 Some improvement! Advanced polynomial is slightly better.');
    console.log(`✅ Average error: $${fullResults.avgError.toFixed(2)} (vs $187 basic polynomial)`);
    console.log('💡 Recommendation: Marginal gain, consider submitting basic polynomial');
  } else {
    console.log('❌ Advanced polynomial not better than basic version.');
    console.log(`❌ Average error: $${fullResults.avgError.toFixed(2)} (vs $187 basic polynomial)`);
    console.log('💡 Recommendation: Stick with basic polynomial approach');
  }

  console.log();
  console.log('🚀 Final Decision Framework:');
  console.log('  If BREAKTHROUGH (>50% exact): Update to advanced & submit');
  console.log('  If MAJOR SUCCESS (>10% exact): Fine-tune advanced & submit');
  console.log('  If SIGNIFICANT (>1% exact): Submit advanced as best effort');
  console.log('  If MARGINAL (<1% exact): Submit basic polynomial');
  console.log();
  console.log('📝 Next Steps:');
  console.log('  1. Based on results above, choose best approach');
  console.log('  2. Update CLI with chosen calculator');
  console.log('  3. Run final ./fast-eval.sh validation');
  console.log('  4. Prepare submission documentation');
}

if (require.main === module) {
  testAdvancedPolynomialApproach();
} 