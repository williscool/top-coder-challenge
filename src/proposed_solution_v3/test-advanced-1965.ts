#!/usr/bin/env ts-node

import * as fs from 'fs';
import { Calculator1965Advanced } from './calculator-1965-advanced';

interface TestCase {
  input: {
    trip_duration_days: number;
    miles_traveled: number;
    total_receipts_amount: number;
  };
  expected_output: number;
}

function main() {
  console.log('🚀 === TESTING ADVANCED 1965-STYLE CALCULATOR ===');
  
  // Load test cases
  const data = fs.readFileSync('public_cases.json', 'utf8');
  const testCases: TestCase[] = JSON.parse(data);
  
  // Create and train calculator
  const calculator = new Calculator1965Advanced();
  
  const trainingData = testCases.map(testCase => ({
    days: testCase.input.trip_duration_days,
    miles: testCase.input.miles_traveled,
    receipts: testCase.input.total_receipts_amount,
    expected: testCase.expected_output
  }));
  
  calculator.train(trainingData);
  
  // Test specific problem cases first
  const knownProblemCases = [
    { case: 684, days: 8, miles: 795, receipts: 1645.99, expected: 644.69, description: 'Vacation penalty - should hit bottom of range' },
    { case: 152, days: 4, miles: 69, receipts: 2321.49, expected: 322.00, description: 'Extreme high receipts + low miles' },
    { case: 996, days: 1, miles: 1082, receipts: 1809.49, expected: 446.94, description: 'Single day extreme mileage' },
    { case: 711, days: 5, miles: 516, receipts: 1878.49, expected: 669.85, description: '5-day trip with high receipts' },
    { case: 367, days: 11, miles: 740, receipts: 1171.99, expected: 902.09, description: '11-day trip, unknown rule' }
  ];
  
  console.log('\n🎯 === TESTING KNOWN PROBLEM CASES FIRST ===');
  console.log('Case | Expected | Advanced | Error    | Description');
  console.log('=' .repeat(70));
  
  let problemCasesFixed = 0;
  for (const problemCase of knownProblemCases) {
    const actual = calculator.calculateReimbursement(problemCase.days, problemCase.miles, problemCase.receipts);
    const error = Math.abs(actual - problemCase.expected);
    
    console.log(`${problemCase.case.toString().padStart(4)} | $${problemCase.expected.toFixed(2).padStart(7)} | $${actual.toFixed(2).padStart(7)} | $${error.toFixed(2).padStart(7)} | ${problemCase.description}`);
    
    if (error < 10) { // Very close
      problemCasesFixed++;
    }
  }
  
  console.log(`\n🏆 Problem cases with <$10 error: ${problemCasesFixed}/5`);
  
  // Now run full evaluation
  console.log('\n📊 Running full evaluation against 1,000 test cases...');
  
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
  
  // Sort and get top 5 worst cases
  worstCases.sort((a, b) => b.error - a.error);
  const top5Worst = worstCases.slice(0, 5);
  
  // Calculate and display results
  if (successfulRuns === 0) {
    console.error('❌ No successful test cases!');
    return;
  }
  
  const avgError = totalError / successfulRuns;
  const exactPct = (exactMatches * 100) / successfulRuns;
  const closePct = (closeMatches * 100) / successfulRuns;
  
  console.log('\n✅ === ADVANCED 1965-STYLE CALCULATOR RESULTS ===');
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
  
  // Show improvement vs all previous approaches
  const currentBestScore = 5539.69; // Current KNN performance
  const currentBestCloseMatches = 14;
  const improvementVsKNN = ((currentBestScore - score) / currentBestScore * 100);
  const closeMatchImprovementVsKNN = closeMatches - currentBestCloseMatches;
  
  console.log('\n📊 Performance Comparison:');
  console.log(`vs Current Best (KNN):`);
  console.log(`  Close matches: ${closeMatches} vs ${currentBestCloseMatches} (${closeMatchImprovementVsKNN > 0 ? '+' : ''}${closeMatchImprovementVsKNN})`);
  console.log(`  Score improvement: ${improvementVsKNN.toFixed(1)}% ${improvementVsKNN > 0 ? '(BETTER)' : '(WORSE)'}`);
  
  if (closeMatches > currentBestCloseMatches) {
    console.log('🏆 NEW RECORD! Beat current best close matches!');
  }
  
  if (exactMatches > 0) {
    console.log('🎯 EXACT MATCHES FOUND! System reverse engineering successful!');
  }
  
  // Show worst cases
  console.log('\n❌ Top 5 Worst Cases (Advanced 1965):');
  console.log('Case | Days | Miles | Receipts | Expected | Actual   | Error    | Category');
  console.log('=' .repeat(85));
  
  for (const worst of top5Worst) {
    // Show what category this case falls into
    let dayCategory: string;
    if (worst.days === 1) dayCategory = 'D1';
    else if (worst.days <= 3) dayCategory = 'D2-3';
    else if (worst.days <= 6) dayCategory = 'D4-6';
    else if (worst.days <= 13) dayCategory = 'D7-13';
    else dayCategory = 'D14+';

    let mileCategory: string;
    if (worst.miles <= 100) mileCategory = 'M0-100';
    else if (worst.miles <= 300) mileCategory = 'M101-300';
    else if (worst.miles <= 500) mileCategory = 'M301-500';
    else if (worst.miles <= 1000) mileCategory = 'M501-1000';
    else mileCategory = 'M1000+';

    let receiptCategory: string;
    if (worst.receipts <= 50) receiptCategory = 'R0-50';
    else if (worst.receipts <= 200) receiptCategory = 'R51-200';
    else if (worst.receipts <= 600) receiptCategory = 'R201-600';
    else if (worst.receipts <= 1200) receiptCategory = 'R601-1200';
    else if (worst.receipts <= 2000) receiptCategory = 'R1201-2000';
    else receiptCategory = 'R2000+';

    const category = `${dayCategory}|${mileCategory}|${receiptCategory}`;
    
    console.log(`${worst.case.toString().padStart(4)} | ${worst.days.toString().padStart(4)} | ${worst.miles.toString().padStart(5)} | $${worst.receipts.toFixed(2).padStart(8)} | $${worst.expected.toFixed(2).padStart(7)} | $${worst.actual.toFixed(2).padStart(7)} | $${worst.error.toFixed(2).padStart(7)} | ${category}`);
  }
  
  console.log('\n✅ === ADVANCED 1965 EVALUATION COMPLETE ===');
  
  // Final recommendation
  if (closeMatches > currentBestCloseMatches) {
    console.log('🚀 RECOMMENDATION: Deploy advanced 1965 calculator - NEW RECORD!');
  } else if (problemCasesFixed >= 3) {
    console.log('📈 RECOMMENDATION: Strong progress on problem cases - continue refinement');
  } else if (avgError < 200) {
    console.log('📈 RECOMMENDATION: Decent performance - continue refinement');
  } else {
    console.log('📝 RECOMMENDATION: Needs significant work');
  }
  
  // Show specific insights for next iteration
  console.log('\n💡 Insights for next iteration:');
  if (problemCasesFixed < 3) {
    console.log('  - Range positioning logic needs adjustment for problem cases');
  }
  if (exactMatches === 0) {
    console.log('  - Consider more precise sub-pattern detection within categories');
  }
  if (closeMatches < 10) {
    console.log('  - Lookup table coverage may be insufficient for many cases');
  }
}

if (require.main === module) {
  main();
} 