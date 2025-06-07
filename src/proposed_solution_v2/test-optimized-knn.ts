#!/usr/bin/env ts-node

import * as fs from 'fs';
import { OptimizedKNNReimbursementCalculator } from './optimized-knn';

interface TestCase {
  input: {
    trip_duration_days: number;
    miles_traveled: number;
    total_receipts_amount: number;
  };
  expected_output: number;
}

function main() {
  console.log('🚀 Testing OPTIMIZED K-Nearest Neighbors - Push for 20%!');
  console.log('=======================================================\n');

  // Load test cases
  const testData: TestCase[] = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));
  
  // Train optimized KNN calculator
  const trainingData = testData.map(tc => ({
    days: tc.input.trip_duration_days,
    miles: tc.input.miles_traveled,
    receipts: tc.input.total_receipts_amount,
    expected: tc.expected_output
  }));

  const optimizedKNN = new OptimizedKNNReimbursementCalculator();
  optimizedKNN.train(trainingData);
  console.log('');

  // Test different methods
  const methods = [
    { name: 'Multi-Metric Ensemble', method: 'calculateReimbursement' },
    { name: 'Adaptive K-Selection', method: 'calculateReimbursementAdaptive' }
  ];

  for (const { name, method } of methods) {
    console.log(`🔥 Testing ${name}:`);
    console.log('='.repeat(40));
    
    let exactMatches = 0;
    let closeMatches = 0;
    let totalError = 0;
    let maxError = 0;
    
    for (let i = 0; i < testData.length; i++) {
      const testCase = testData[i];
      const { trip_duration_days, miles_traveled, total_receipts_amount } = testCase.input;
      const expected = testCase.expected_output;
      
      const predicted = (optimizedKNN as any)[method](trip_duration_days, miles_traveled, total_receipts_amount);
      const error = Math.abs(predicted - expected);
      
      totalError += error;
      
      if (error < 0.01) exactMatches++;
      if (error < 1.0) closeMatches++;
      
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
    
    // Compare to previous best (14 close matches)
    if (closeMatches > 14) {
      const improvement = closeMatches - 14;
      console.log(`🎉 NEW RECORD! +${improvement} more close matches than previous best!`);
      
      if (closeMatches >= 30) {
        console.log('🚀 MAJOR BREAKTHROUGH! We\'re making significant progress!');
      } else if (closeMatches >= 20) {
        console.log('✅ GOOD PROGRESS! Getting closer to our goal!');
      }
      
    } else if (closeMatches === 14) {
      console.log('😐 Matched our previous best performance');
    } else {
      console.log('⚠️  Did not improve over previous KNN performance');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  }

  console.log('💡 CURRENT STATUS SUMMARY:');
  console.log('==========================');
  console.log('🎯 Goal: 200 close matches (20%)');
  console.log('📊 Previous best: 14 close matches (Advanced KNN)');
  console.log('🏆 Best avg error: $54.40 (Advanced KNN)');
  console.log('🏆 Best score: 5539.69 (Advanced KNN)');
  console.log('');
  
  console.log('🚀 IF WE\'RE STILL BELOW 20%, NEXT STRATEGIES:');
  console.log('============================================');
  console.log('1. 📊 Try clustering + prototype-based prediction');
  console.log('2. 🎲 Random forest ensemble');
  console.log('3. 🎯 Focus on exact lookup tables for common patterns');
  console.log('4. 🔍 Deep analysis of the 14 successful cases to find expansion patterns');
  console.log('5. 🧮 Neural network approach');
  console.log('6. 🎨 Hybrid: Use different algorithms for different trip types');
}

if (require.main === module) {
  main();
} 