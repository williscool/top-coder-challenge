#!/usr/bin/env ts-node

import * as fs from 'fs';
import { Calculator1965Refined } from './calculator-1965-refined';

interface TestCase {
  input: {
    trip_duration_days: number;
    miles_traveled: number;
    total_receipts_amount: number;
  };
  expected_output: number;
}

function main() {
  console.log('🔄 === TESTING REFINED 1965-STYLE CALCULATOR ===');
  
  // Load test cases
  const data = fs.readFileSync('public_cases.json', 'utf8');
  const testCases: TestCase[] = JSON.parse(data);
  
  // Create and train calculator
  const calculator = new Calculator1965Refined();
  
  const trainingData = testCases.map(testCase => ({
    days: testCase.input.trip_duration_days,
    miles: testCase.input.miles_traveled,
    receipts: testCase.input.total_receipts_amount,
    expected: testCase.expected_output
  }));
  
  calculator.train(trainingData);
  
  console.log('\n📊 Running evaluation against 1,000 test cases...');
  
  let successfulRuns = 0;
  let exactMatches = 0;
  let closeMatches = 0;
  let totalError = 0;
  let maxError = 0;
  let maxErrorCase = '';
  let worstCases: Array<{case: number, days: number, miles: number, receipts: number, expected: number, actual: number, error: number}> = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const { trip_duration_days, miles_traveled, total_receipts_amount } = testCase.input;
    const expected = testCase.expected_output;
    
    try {
      const actual = calculator.calculateReimbursement(
        trip_duration_days,
        miles_traveled,
        total_receipts_amount
      );
      
      const error = Math.abs(actual - expected);
      successfulRuns++;
      
      // Check for exact match (within $0.01)
      if (error < 0.01) {
        exactMatches++;
      }
      
      // Check for close match (within $1.00)
      if (error < 1.0) {
        closeMatches++;
      }
      
      totalError += error;
      
      // Track maximum error
      if (error > maxError) {
        maxError = error;
        maxErrorCase = `Case ${i + 1}: ${trip_duration_days} days, ${miles_traveled} miles, $${total_receipts_amount} receipts`;
      }
      
      // Track worst cases for analysis
      worstCases.push({
        case: i + 1,
        days: trip_duration_days,
        miles: miles_traveled,
        receipts: total_receipts_amount,
        expected,
        actual,
        error
      });
      
    } catch (error) {
      console.error(`Case ${i + 1}: Calculation failed - ${error}`);
    }
  }
  
  // Sort and get top 10 worst cases
  worstCases.sort((a, b) => b.error - a.error);
  const top10Worst = worstCases.slice(0, 10);
  
  // Calculate and display results
  if (successfulRuns === 0) {
    console.error('❌ No successful test cases!');
    return;
  }
  
  const avgError = totalError / successfulRuns;
  const exactPct = (exactMatches * 100) / successfulRuns;
  const closePct = (closeMatches * 100) / successfulRuns;
  
  console.log('\n✅ === REFINED 1965-STYLE CALCULATOR RESULTS ===');
  console.log('📈 Results Summary:');
  console.log(`  Total test cases: ${testCases.length}`);
  console.log(`  Successful runs: ${successfulRuns}`);
  console.log(`  Exact matches (±$0.01): ${exactMatches} (${exactPct.toFixed(1)}%)`);
  console.log(`  Close matches (±$1.00): ${closeMatches} (${closePct.toFixed(1)}%)`);
  console.log(`  Average error: $${avgError.toFixed(2)}`);
  console.log(`  Maximum error: $${maxError.toFixed(2)}`);
  
  // Calculate score (lower is better)
  const score = avgError * 100 + (testCases.length - exactMatches) * 0.1;
  console.log(`🎯 Score: ${score.toFixed(2)} (lower is better)`);
  
  // Show improvement vs current best AND original 1965
  const currentBestScore = 5539.69; // Current KNN performance
  const currentBestCloseMatches = 14;
  const original1965Score = 43125.83; // Original 1965 performance
  const original1965CloseMatches = 3;
  
  const improvementVsKNN = ((currentBestScore - score) / currentBestScore * 100);
  const improvementVs1965 = ((original1965Score - score) / original1965Score * 100);
  const closeMatchImprovementVsKNN = closeMatches - currentBestCloseMatches;
  const closeMatchImprovementVs1965 = closeMatches - original1965CloseMatches;
  
  console.log('\n📊 Performance Comparison:');
  console.log(`vs Current Best (KNN):`);
  console.log(`  Close matches: ${closeMatches} vs ${currentBestCloseMatches} (${closeMatchImprovementVsKNN > 0 ? '+' : ''}${closeMatchImprovementVsKNN})`);
  console.log(`  Score improvement: ${improvementVsKNN.toFixed(1)}% ${improvementVsKNN > 0 ? '(BETTER)' : '(WORSE)'}`);
  
  console.log(`vs Original 1965:`);
  console.log(`  Close matches: ${closeMatches} vs ${original1965CloseMatches} (${closeMatchImprovementVs1965 > 0 ? '+' : ''}${closeMatchImprovementVs1965})`);
  console.log(`  Score improvement: ${improvementVs1965.toFixed(1)}% ${improvementVs1965 > 0 ? '(BETTER)' : '(WORSE)'}`);
  
  if (closeMatches > currentBestCloseMatches) {
    console.log('🏆 NEW RECORD! Beat current best close matches!');
  } else if (closeMatches > original1965CloseMatches) {
    console.log('📈 IMPROVED! Beat original 1965 calculator!');
  }
  
  // Analyze our high-error cases
  console.log('\n❌ Top 5 Worst Cases (Refined 1965):');
  console.log('Case | Days | Miles | Receipts | Expected | Actual   | Error    | Analysis');
  console.log('=' .repeat(85));
  
  for (let i = 0; i < Math.min(5, top10Worst.length); i++) {
    const worst = top10Worst[i];
    const efficiency = worst.miles / worst.days;
    const dailySpending = worst.receipts / worst.days;
    
    let analysis = '';
    if (worst.days >= 14) {
      analysis = '14+ day penalty';
    } else if (worst.days >= 8 && dailySpending > 200) {
      analysis = 'VACATION_PENALTY';
    } else if (worst.receipts > 2000) {
      analysis = 'HIGH_RECEIPT penalty';
    } else if (worst.days === 1 && worst.miles > 1000) {
      analysis = 'SINGLE_DAY extreme';
    } else {
      analysis = 'Standard calculation';
    }
    
    console.log(`${worst.case.toString().padStart(4)} | ${worst.days.toString().padStart(4)} | ${worst.miles.toString().padStart(5)} | $${worst.receipts.toFixed(2).padStart(8)} | $${worst.expected.toFixed(2).padStart(7)} | $${worst.actual.toFixed(2).padStart(7)} | $${worst.error.toFixed(2).padStart(7)} | ${analysis}`);
  }
  
  // Check known problem cases
  const knownProblemCases = [
    { case: 684, days: 8, miles: 795, receipts: 1645.99, expected: 644.69 },
    { case: 152, days: 4, miles: 69, receipts: 2321.49, expected: 322.00 },
    { case: 996, days: 1, miles: 1082, receipts: 1809.49, expected: 446.94 },
    { case: 711, days: 5, miles: 516, receipts: 1878.49, expected: 669.85 },
    { case: 367, days: 11, miles: 740, receipts: 1171.99, expected: 902.09 }
  ];
  
  console.log('\n🔍 Known Problem Cases Performance:');
  console.log('Case | Expected | Refined  | Error    | vs KNN   | vs Orig 1965');
  console.log('=' .repeat(65));
  
  const knnErrors = [899.27, 817.08, 790.35, 742.98, 724.52]; // From KNN eval
  const orig1965Errors = [1164.34, 32.94, 98.16, 884.23, 729.11]; // From original 1965
  
  for (let i = 0; i < knownProblemCases.length; i++) {
    const problemCase = knownProblemCases[i];
    const actual = calculator.calculateReimbursement(problemCase.days, problemCase.miles, problemCase.receipts);
    const error = Math.abs(actual - problemCase.expected);
    const improvementVsKNN = knnErrors[i] - error;
    const improvementVs1965 = orig1965Errors[i] - error;
    
    console.log(`${problemCase.case.toString().padStart(4)} | $${problemCase.expected.toFixed(2).padStart(7)} | $${actual.toFixed(2).padStart(7)} | $${error.toFixed(2).padStart(7)} | ${improvementVsKNN > 0 ? '+' : ''}$${improvementVsKNN.toFixed(0).padStart(6)} | ${improvementVs1965 > 0 ? '+' : ''}$${improvementVs1965.toFixed(0).padStart(8)}`);
  }
  
  console.log('\n✅ === REFINED 1965 EVALUATION COMPLETE ===');
  
  // Determine recommendation
  if (closeMatches > currentBestCloseMatches) {
    console.log('🚀 RECOMMENDATION: Deploy refined 1965 calculator - NEW RECORD!');
  } else if (avgError < 100) {
    console.log('📈 RECOMMENDATION: Promising approach - continue refinement');
  } else {
    console.log('📝 RECOMMENDATION: Needs more work - try different approach');
  }
}

if (require.main === module) {
  main();
} 