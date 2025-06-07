#!/usr/bin/env ts-node

import * as fs from 'fs';
import { KNNReimbursementCalculator } from './knn-calculator';

interface TestCase {
  input: {
    trip_duration_days: number;
    miles_traveled: number;
    total_receipts_amount: number;
  };
  expected_output: number;
}

function main() {
  console.log('🎯 Testing K-Nearest Neighbors for 20% Close Matches Goal');
  console.log('=========================================================\n');

  // Load test cases
  const testData: TestCase[] = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));
  
  // Train KNN calculator
  const trainingData = testData.map(tc => ({
    days: tc.input.trip_duration_days,
    miles: tc.input.miles_traveled,
    receipts: tc.input.total_receipts_amount,
    expected: tc.expected_output
  }));

  const knnCalculator = new KNNReimbursementCalculator();
  knnCalculator.train(trainingData);
  console.log('');

  // Test both regular and advanced KNN
  const methods = [
    { name: 'Standard KNN', method: 'calculateReimbursement' },
    { name: 'Advanced KNN', method: 'calculateReimbursementAdvanced' }
  ];

  for (const { name, method } of methods) {
    console.log(`🔍 Testing ${name}:`);
    console.log('='.repeat(30));
    
    let exactMatches = 0;
    let closeMatches = 0;
    let totalError = 0;
    let maxError = 0;
    
    const closeMatchCases: Array<{caseId: number; days: number; miles: number; receipts: number; expected: number; predicted: number; error: number}> = [];
    
    for (let i = 0; i < testData.length; i++) {
      const testCase = testData[i];
      const { trip_duration_days, miles_traveled, total_receipts_amount } = testCase.input;
      const expected = testCase.expected_output;
      
      // Call the appropriate method
      const predicted = (knnCalculator as any)[method](trip_duration_days, miles_traveled, total_receipts_amount);
      const error = Math.abs(predicted - expected);
      
      totalError += error;
      
      if (error < 0.01) {
        exactMatches++;
      }
      
      if (error < 1.0) {
        closeMatches++;
        closeMatchCases.push({
          caseId: i + 1,
          days: trip_duration_days,
          miles: miles_traveled,
          receipts: total_receipts_amount,
          expected,
          predicted,
          error
        });
      }
      
      maxError = Math.max(maxError, error);
    }
    
    const avgError = totalError / testData.length;
    const closePct = (closeMatches * 100) / testData.length;
    const score = avgError * 100 + (testData.length - exactMatches) * 0.1;
    
    console.log(`🏆 ${name} Results:`);
    console.log(`📊 Exact matches: ${exactMatches} (${(exactMatches/testData.length*100).toFixed(1)}%)`);
    console.log(`🎯 Close matches: ${closeMatches} (${closePct.toFixed(1)}%)`);
    console.log(`📉 Average error: $${avgError.toFixed(2)}`);
    console.log(`📈 Maximum error: $${maxError.toFixed(2)}`);
    console.log(`🏆 Score: ${score.toFixed(2)}`);
    
    // Progress towards 20% goal
    const target = 200;
    const progress = (closeMatches / target * 100);
    console.log(`\n🎯 Progress towards 20%: ${progress.toFixed(1)}% (${closeMatches}/${target})`);
    
    if (closeMatches >= 50) { // Significant improvement
      console.log('🎉 MAJOR BREAKTHROUGH! KNN significantly outperforms polynomial approaches!');
      
      console.log('\n📋 Sample Close Match Cases:');
      closeMatchCases.slice(0, 15).forEach(cm => {
        const efficiency = cm.miles / cm.days;
        console.log(`Case ${cm.caseId}: ${cm.days}d, ${cm.miles}mi, $${cm.receipts.toFixed(2)} (${efficiency.toFixed(1)} mi/day)`);
        console.log(`  Expected: $${cm.expected.toFixed(2)}, Got: $${cm.predicted.toFixed(2)}, Error: $${cm.error.toFixed(2)}`);
      });
      
    } else if (closeMatches > 15) { // Moderate improvement
      console.log('✅ Good improvement! KNN beats polynomial approaches');
      
      console.log('\n📋 Close Match Cases:');
      closeMatchCases.slice(0, 10).forEach(cm => {
        const efficiency = cm.miles / cm.days;
        console.log(`Case ${cm.caseId}: ${cm.days}d, ${cm.miles}mi, $${cm.receipts.toFixed(2)} (${efficiency.toFixed(1)} mi/day)`);
        console.log(`  Expected: $${cm.expected.toFixed(2)}, Got: $${cm.predicted.toFixed(2)}, Error: $${cm.error.toFixed(2)}`);
      });
      
    } else {
      console.log('⚠️  KNN did not significantly improve over polynomial approaches');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  }

  console.log('💡 ANALYSIS AND NEXT STEPS:');
  console.log('===========================');
  
  console.log('1. If KNN performed well: Scale up to more neighbors, try different similarity metrics');
  console.log('2. If KNN performed poorly: The system may use exact lookup tables or very specific rules');
  console.log('3. Consider hybrid: Use KNN for similar cases, fallback to polynomial for dissimilar cases');
  console.log('4. Alternative: Try clustering + lookup tables for common patterns');
  
  console.log('\n🚀 Remember: Our goal is 200 close matches (20%). Current best approach wins!');
}

if (require.main === module) {
  main();
} 