#!/usr/bin/env ts-node

import * as fs from 'fs';
import { EnsembleReimbursementCalculator } from './ensemble-calculator';

interface TestCase {
  input: {
    trip_duration_days: number;
    miles_traveled: number;
    total_receipts_amount: number;
  };
  expected_output: number;
}

function main() {
  console.log('🎭 Testing Ensemble Calculator for 20% Close Matches Goal');
  console.log('========================================================\n');

  // Load test cases
  const testData: TestCase[] = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));
  
  // Train ensemble calculator
  const trainingData = testData.map(tc => ({
    days: tc.input.trip_duration_days,
    miles: tc.input.miles_traveled,
    receipts: tc.input.total_receipts_amount,
    expected: tc.expected_output
  }));

  const ensembleCalculator = new EnsembleReimbursementCalculator();
  ensembleCalculator.train(trainingData);
  console.log('');

  // Evaluate ensemble
  let exactMatches = 0;
  let closeMatches = 0;
  let totalError = 0;
  let maxError = 0;
  let maxErrorCase = '';
  
  const closeMatchCases: Array<{caseId: number; days: number; miles: number; receipts: number; expected: number; predicted: number; error: number}> = [];
  
  for (let i = 0; i < testData.length; i++) {
    const testCase = testData[i];
    const { trip_duration_days, miles_traveled, total_receipts_amount } = testCase.input;
    const expected = testCase.expected_output;
    
    const predicted = ensembleCalculator.calculateReimbursement(trip_duration_days, miles_traveled, total_receipts_amount);
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
    
    if (error > maxError) {
      maxError = error;
      maxErrorCase = `Case ${i + 1}: ${trip_duration_days} days, ${miles_traveled} miles, $${total_receipts_amount} receipts`;
    }
  }
  
  const avgError = totalError / testData.length;
  const closePct = (closeMatches * 100) / testData.length;
  const score = avgError * 100 + (testData.length - exactMatches) * 0.1;
  
  console.log('🏆 ENSEMBLE CALCULATOR RESULTS:');
  console.log('===============================');
  console.log(`📊 Total test cases: ${testData.length}`);
  console.log(`🎯 Exact matches: ${exactMatches} (${(exactMatches/testData.length*100).toFixed(1)}%)`);
  console.log(`🎯 Close matches: ${closeMatches} (${closePct.toFixed(1)}%)`);
  console.log(`📉 Average error: $${avgError.toFixed(2)}`);
  console.log(`📈 Maximum error: $${maxError.toFixed(2)}`);
  console.log(`🏆 Score: ${score.toFixed(2)}`);
  console.log('');
  
  // Progress towards 20% goal
  const target = 200;
  const progress = (closeMatches / target * 100);
  console.log(`🎯 PROGRESS TOWARDS 20% GOAL:`);
  console.log(`   Current: ${closeMatches} close matches`);
  console.log(`   Target: ${target} close matches (20%)`);
  console.log(`   Progress: ${progress.toFixed(1)}% of goal achieved`);
  console.log(`   Gap: ${target - closeMatches} more matches needed`);
  console.log('');
  
  if (closeMatches > 14) { // Better than our previous best
    console.log('🎉 IMPROVEMENT! Ensemble beats individual calculators!');
    
    console.log('\n📋 Close Match Cases:');
    closeMatchCases.slice(0, 10).forEach(cm => {
      const efficiency = cm.miles / cm.days;
      console.log(`Case ${cm.caseId}: ${cm.days}d, ${cm.miles}mi, $${cm.receipts.toFixed(2)} (${efficiency.toFixed(1)} mi/day)`);
      console.log(`  Expected: $${cm.expected.toFixed(2)}, Got: $${cm.predicted.toFixed(2)}, Error: $${cm.error.toFixed(2)}`);
    });
    
    if (closeMatchCases.length > 10) {
      console.log(`  ... and ${closeMatchCases.length - 10} more close matches`);
    }
  } else {
    console.log('⚠️  Ensemble did not improve over individual calculators');
    console.log('   Need to try different approaches:');
    console.log('   1. More sophisticated pattern recognition');
    console.log('   2. Machine learning ensemble methods');
    console.log('   3. Lookup table approaches');
  }
  
  // If we're still far from 20%, suggest next steps
  if (closePct < 5) {
    console.log('\n💡 NEXT STRATEGIES TO TRY:');
    console.log('==========================');
    console.log('1. 🎯 Focus on expanding exact match patterns');
    console.log('2. 🔄 Try k-nearest neighbors approach');
    console.log('3. 📊 Build lookup tables for common patterns');
    console.log('4. 🎲 Random forest or gradient boosting');
    console.log('5. 🧮 Neural network approach');
  }
}

if (require.main === module) {
  main();
} 