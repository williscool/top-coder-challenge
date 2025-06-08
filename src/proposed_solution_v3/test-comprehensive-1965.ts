#!/usr/bin/env ts-node

import * as fs from 'fs';
import { Calculator1965Comprehensive } from './calculator-1965-comprehensive';

interface TestCase {
  input: {
    trip_duration_days: number;
    miles_traveled: number;
    total_receipts_amount: number;
  };
  expected_output: number;
}

function main() {
  console.log('🚀 === TESTING COMPREHENSIVE 1965-STYLE CALCULATOR ===');
  console.log('🎯 Fixing coverage gaps and fallback calculation issues');
  
  // Load test cases
  const data = fs.readFileSync('public_cases.json', 'utf8');
  const testCases: TestCase[] = JSON.parse(data);
  
  // Create and train calculator
  const calculator = new Calculator1965Comprehensive();
  
  const trainingData = testCases.map(testCase => ({
    days: testCase.input.trip_duration_days,
    miles: testCase.input.miles_traveled,
    receipts: testCase.input.total_receipts_amount,
    expected: testCase.expected_output
  }));
  
  calculator.train(trainingData);
  
  // Test specific problem cases first
  const knownProblemCases = [
    { case: 684, days: 8, miles: 795, receipts: 1645.99, expected: 644.69, description: 'Vacation penalty - PERFECT in advanced!' },
    { case: 152, days: 4, miles: 69, receipts: 2321.49, expected: 322.00, description: 'Extreme high receipts + low miles' },
    { case: 996, days: 1, miles: 1082, receipts: 1809.49, expected: 446.94, description: 'Single day extreme mileage' },
    { case: 711, days: 5, miles: 516, receipts: 1878.49, expected: 669.85, description: '5-day trip with high receipts' },
    { case: 367, days: 11, miles: 740, receipts: 1171.99, expected: 902.09, description: '11-day trip, unknown rule' },
    
    // Test the worst D14+ cases that were getting $400 fallbacks
    { case: 883, days: 14, miles: 530, receipts: 2028.06, expected: 2079.14, description: 'D14+ high receipts (was $400 fallback)' },
    { case: 742, days: 14, miles: 595, receipts: 2140.61, expected: 1989.13, description: 'D14+ high receipts (was $400 fallback)' },
    { case: 712, days: 14, miles: 904, receipts: 2005.96, expected: 1970.01, description: 'D14+ high receipts (was $400 fallback)' },
  ];
  
  console.log('\n🎯 === TESTING KNOWN PROBLEM CASES ===');
  console.log('Case | Expected | Comprehensive | Error    | vs Advanced | Description');
  console.log('=' .repeat(90));
  
  let problemCasesFixed = 0;
  let problemCasesImproved = 0;
  
  // Previous advanced results for comparison
  const advancedResults = new Map([
    [684, 644.69], // Perfect
    [152, 400.00], // Was fallback
    [996, 500.00], // Was fallback  
    [711, 792.65], // From lookup table
    [367, 1513.13], // From lookup table
    [883, 400.00], // Was fallback
    [742, 400.00], // Was fallback
    [712, 400.00], // Was fallback
  ]);
  
  for (const problemCase of knownProblemCases) {
    const actual = calculator.calculateReimbursement(problemCase.days, problemCase.miles, problemCase.receipts);
    const error = Math.abs(actual - problemCase.expected);
    const advancedResult = advancedResults.get(problemCase.case) || 0;
    const advancedError = Math.abs(advancedResult - problemCase.expected);
    const improvement = advancedError - error;
    
    console.log(`${problemCase.case.toString().padStart(4)} | $${problemCase.expected.toFixed(2).padStart(7)} | $${actual.toFixed(2).padStart(12)} | $${error.toFixed(2).padStart(7)} | ${improvement > 0 ? '+' : ''}${improvement.toFixed(2).padStart(7)} | ${problemCase.description}`);
    
    if (error < 10) { // Very close
      problemCasesFixed++;
    }
    if (improvement > 0) { // Better than advanced
      problemCasesImproved++;
    }
  }
  
  console.log(`\n🏆 Problem cases with <$10 error: ${problemCasesFixed}/${knownProblemCases.length}`);
  console.log(`📈 Problem cases improved vs advanced: ${problemCasesImproved}/${knownProblemCases.length}`);
  
  // Now run full evaluation
  console.log('\n📊 Running full comprehensive evaluation against 1,000 test cases...');
  
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
  
  console.log('\n✅ === COMPREHENSIVE 1965-STYLE CALCULATOR RESULTS ===');
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
  const currentBestScore = 5539.69; // Current KNN performance (fast-eval)
  const currentBestCloseMatches = 14;
  const knnRegularScore = 7896.00; // Regular eval KNN
  const knnRegularCloseMatches = 8;
  const advancedScore = 42823.15; // Advanced 1965 performance
  const advancedCloseMatches = 6;
  
  const improvementVsKNN = ((currentBestScore - score) / currentBestScore * 100);
  const improvementVsKNNRegular = ((knnRegularScore - score) / knnRegularScore * 100);
  const improvementVsAdvanced = ((advancedScore - score) / advancedScore * 100);
  
  const closeMatchImprovementVsKNN = closeMatches - currentBestCloseMatches;
  const closeMatchImprovementVsKNNRegular = closeMatches - knnRegularCloseMatches;
  const closeMatchImprovementVsAdvanced = closeMatches - advancedCloseMatches;
  
  console.log('\n📊 Performance Comparison:');
  console.log(`vs Current Best (KNN Fast):`);
  console.log(`  Close matches: ${closeMatches} vs ${currentBestCloseMatches} (${closeMatchImprovementVsKNN > 0 ? '+' : ''}${closeMatchImprovementVsKNN})`);
  console.log(`  Score improvement: ${improvementVsKNN.toFixed(1)}% ${improvementVsKNN > 0 ? '(BETTER)' : '(WORSE)'}`);
  
  console.log(`vs KNN Regular:`);
  console.log(`  Close matches: ${closeMatches} vs ${knnRegularCloseMatches} (${closeMatchImprovementVsKNNRegular > 0 ? '+' : ''}${closeMatchImprovementVsKNNRegular})`);
  console.log(`  Score improvement: ${improvementVsKNNRegular.toFixed(1)}% ${improvementVsKNNRegular > 0 ? '(BETTER)' : '(WORSE)'}`);
  
  console.log(`vs Advanced 1965:`);
  console.log(`  Close matches: ${closeMatches} vs ${advancedCloseMatches} (${closeMatchImprovementVsAdvanced > 0 ? '+' : ''}${closeMatchImprovementVsAdvanced})`);
  console.log(`  Score improvement: ${improvementVsAdvanced.toFixed(1)}% ${improvementVsAdvanced > 0 ? '(BETTER)' : '(WORSE)'}`);
  
  // Record detection
  if (closeMatches > currentBestCloseMatches) {
    console.log('🏆 NEW RECORD! Beat current best close matches!');
  }
  
  if (exactMatches > 5) { // Previous best was 5
    console.log('🎯 NEW EXACT MATCH RECORD! System reverse engineering improving!');
  }
  
  if (avgError < 55) { // Beat KNN fast-eval average
    console.log('💰 NEW AVERAGE ERROR RECORD! Beat KNN baseline!');
  }
  
  // Show worst cases
  console.log('\n❌ Top 5 Worst Cases (Comprehensive 1965):');
  console.log('Case | Days | Miles | Receipts | Expected | Actual   | Error    | Category | Fallback?');
  console.log('=' .repeat(95));
  
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
    
    // Check if this would be a fallback case
    const fallbackIndicator = calculator['lookupTable'].has(category) ? 'TABLE' : 'FALLBACK';
    
    console.log(`${worst.case.toString().padStart(4)} | ${worst.days.toString().padStart(4)} | ${worst.miles.toString().padStart(5)} | $${worst.receipts.toFixed(2).padStart(8)} | $${worst.expected.toFixed(2).padStart(7)} | $${worst.actual.toFixed(2).padStart(7)} | $${worst.error.toFixed(2).padStart(7)} | ${category.padEnd(20)} | ${fallbackIndicator}`);
  }
  
  console.log('\n✅ === COMPREHENSIVE 1965 EVALUATION COMPLETE ===');
  
  // Final recommendation
  if (closeMatches > currentBestCloseMatches) {
    console.log('🚀 RECOMMENDATION: Deploy comprehensive 1965 calculator - NEW RECORD!');
  } else if (closeMatches > advancedCloseMatches) {
    console.log('📈 RECOMMENDATION: Major improvement over advanced 1965 - continue refinement');
  } else if (problemCasesImproved >= 5) {
    console.log('📈 RECOMMENDATION: Strong progress on problem cases - continue refinement');
  } else if (avgError < 200) {
    console.log('📈 RECOMMENDATION: Decent performance - continue refinement');
  } else {
    console.log('📝 RECOMMENDATION: Needs significant work');
  }
  
  // Show specific insights for next iteration
  console.log('\n💡 Insights for next iteration:');
  if (problemCasesFixed < 5) {
    console.log('  - Range positioning logic needs further adjustment for problem cases');
  }
  if (exactMatches < 10) {
    console.log('  - Consider more precise sub-pattern detection within categories');
  }
  if (closeMatches < 20) {
    console.log('  - May need hybrid approach with KNN for edge cases');
  }
  if (avgError > currentBestScore / 100) {
    console.log('  - Fallback calculation may still need refinement');
  }
  
  // Next step recommendations based on performance
  if (closeMatches > currentBestCloseMatches) {
    console.log('\n🎯 NEXT STEPS: V3 SUCCESS! Ready for ensemble or production deployment');
  } else if (closeMatches > advancedCloseMatches) {
    console.log('\n🎯 NEXT STEPS: Promising - consider hybrid with KNN for fallback cases');
  } else {
    console.log('\n🎯 NEXT STEPS: Continue 1965 system refinement or try ensemble approach');
  }
}

if (require.main === module) {
  main();
} 