#!/usr/bin/env ts-node

import * as fs from 'fs';
import { Calculator1965Style } from './calculator-1965-style';

interface TestCase {
  input: {
    trip_duration_days: number;
    miles_traveled: number;
    total_receipts_amount: number;
  };
  expected_output: number;
}

function main() {
  console.log('🕰️  === TESTING 1965-STYLE CALCULATOR ===');
  
  // Load test cases
  const data = fs.readFileSync('public_cases.json', 'utf8');
  const testCases: TestCase[] = JSON.parse(data);
  
  // Create and train calculator
  const calculator = new Calculator1965Style();
  
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
  
  console.log('\n✅ === 1965-STYLE CALCULATOR RESULTS ===');
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
  
  // Show improvement vs current best
  const currentBestScore = 5539.69; // Current KNN performance
  const currentBestCloseMatches = 14;
  const improvement = ((currentBestScore - score) / currentBestScore * 100);
  const closeMatchImprovement = closeMatches - currentBestCloseMatches;
  
  console.log('\n📊 Comparison vs Current Best (KNN):');
  console.log(`  Close matches: ${closeMatches} vs ${currentBestCloseMatches} (${closeMatchImprovement > 0 ? '+' : ''}${closeMatchImprovement})`);
  console.log(`  Score improvement: ${improvement.toFixed(1)}% ${improvement > 0 ? '(BETTER)' : '(WORSE)'}`);
  
  if (closeMatches > currentBestCloseMatches) {
    console.log('🏆 NEW RECORD! Beat current best close matches!');
  }
  
  // Analyze our high-error cases vs known problem cases
  console.log('\n❌ Top 10 Worst Cases (1965 Calculator):');
  console.log('Case | Days | Miles | Receipts | Expected | Actual   | Error    | Analysis');
  console.log('=' .repeat(85));
  
  for (const worst of top10Worst) {
    const efficiency = worst.miles / worst.days;
    const dailySpending = worst.receipts / worst.days;
    
    let analysis = '';
    if (worst.days >= 8 && dailySpending > 120) {
      analysis = 'VACATION_PENALTY path';
    } else if (worst.receipts > 2000) {
      analysis = 'HIGH_RECEIPT penalty';
    } else if (worst.days === 1 && worst.miles > 1000) {
      analysis = 'SINGLE_DAY extreme';
    } else if (worst.days === 5) {
      analysis = '5-DAY penalty applied';
    } else {
      analysis = 'Standard calculation';
    }
    
    console.log(`${worst.case.toString().padStart(4)} | ${worst.days.toString().padStart(4)} | ${worst.miles.toString().padStart(5)} | $${worst.receipts.toFixed(2).padStart(8)} | $${worst.expected.toFixed(2).padStart(7)} | $${worst.actual.toFixed(2).padStart(7)} | $${worst.error.toFixed(2).padStart(7)} | ${analysis}`);
  }
  
  // Specifically check our known problem cases
  const knownProblemCases = [
    { case: 684, days: 8, miles: 795, receipts: 1645.99, expected: 644.69 },
    { case: 152, days: 4, miles: 69, receipts: 2321.49, expected: 322.00 },
    { case: 996, days: 1, miles: 1082, receipts: 1809.49, expected: 446.94 },
    { case: 711, days: 5, miles: 516, receipts: 1878.49, expected: 669.85 },
    { case: 367, days: 11, miles: 740, receipts: 1171.99, expected: 902.09 }
  ];
  
  console.log('\n🔍 Known Problem Cases Performance:');
  console.log('Case | Expected | 1965 Calc | Error    | Improvement vs Current');
  console.log('=' .repeat(65));
  
  const currentErrors = [899.27, 817.08, 790.35, 742.98, 724.52]; // From eval results
  
  for (let i = 0; i < knownProblemCases.length; i++) {
    const problemCase = knownProblemCases[i];
    const actual = calculator.calculateReimbursement(problemCase.days, problemCase.miles, problemCase.receipts);
    const error = Math.abs(actual - problemCase.expected);
    const currentError = currentErrors[i];
    const improvement = currentError - error;
    
    console.log(`${problemCase.case.toString().padStart(4)} | $${problemCase.expected.toFixed(2).padStart(7)} | $${actual.toFixed(2).padStart(9)} | $${error.toFixed(2).padStart(7)} | ${improvement > 0 ? '+' : ''}$${improvement.toFixed(2)} ${improvement > 0 ? '(BETTER)' : '(WORSE)'}`);
  }
  
  console.log('\n✅ === 1965 CALCULATOR EVALUATION COMPLETE ===');
  
  if (closeMatches > currentBestCloseMatches) {
    console.log('🚀 RECOMMENDATION: Deploy 1965-style calculator - it beats current best!');
  } else {
    console.log('📝 RECOMMENDATION: Refine 1965 approach - patterns identified but need adjustment');
  }
}

if (require.main === module) {
  main();
} 