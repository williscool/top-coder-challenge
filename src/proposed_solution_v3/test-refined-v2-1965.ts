#!/usr/bin/env ts-node

import * as fs from 'fs';
import { Calculator1965RefinedV2 } from './calculator-1965-refined-v2';

interface TestCase {
  input: {
    trip_duration_days: number;
    miles_traveled: number;
    total_receipts_amount: number;
  };
  expected_output: number;
}

function main() {
  console.log('🚀 === TESTING REFINED V2 1965-STYLE CALCULATOR ===');
  console.log('🎯 Fixed range positioning to avoid too many minimum values');
  
  // Load test cases
  const data = fs.readFileSync('public_cases.json', 'utf8');
  const testCases: TestCase[] = JSON.parse(data);
  
  // Create and train calculator
  const calculator = new Calculator1965RefinedV2();
  
  const trainingData = testCases.map(testCase => ({
    days: testCase.input.trip_duration_days,
    miles: testCase.input.miles_traveled,
    receipts: testCase.input.total_receipts_amount,
    expected: testCase.expected_output
  }));
  
  calculator.train(trainingData);
  
  // Test specific problem cases first
  const knownProblemCases = [
    { case: 684, days: 8, miles: 795, receipts: 1645.99, expected: 644.69, description: 'Vacation penalty - MUST preserve perfect match!' },
    { case: 152, days: 4, miles: 69, receipts: 2321.49, expected: 322.00, description: 'Extreme high receipts + low miles' },
    { case: 996, days: 1, miles: 1082, receipts: 1809.49, expected: 446.94, description: 'Single day extreme mileage' },
    { case: 711, days: 5, miles: 516, receipts: 1878.49, expected: 669.85, description: '5-day trip with high receipts' },
    { case: 367, days: 11, miles: 740, receipts: 1171.99, expected: 902.09, description: '11-day trip, unknown rule' },
    
    // Test the previous worst cases that were hitting minimum values
    { case: 52, days: 9, miles: 954, receipts: 1483.39, expected: 2024.20, description: 'Was hitting minimum $644.69' },
    { case: 905, days: 13, miles: 618, receipts: 1982.27, expected: 2000.39, description: 'Was hitting minimum $644.69' },
    { case: 681, days: 12, miles: 852, receipts: 1957.90, expected: 1944.89, description: 'Was hitting minimum $644.69' },
  ];
  
  console.log('\n🎯 === TESTING KNOWN PROBLEM CASES ===');
  console.log('Case | Expected | Refined V2   | Error    | Description');
  console.log('=' .repeat(80));
  
  let problemCasesFixed = 0;
  
  for (const problemCase of knownProblemCases) {
    const actual = calculator.calculateReimbursement(problemCase.days, problemCase.miles, problemCase.receipts);
    const error = Math.abs(actual - problemCase.expected);
    
    console.log(`${problemCase.case.toString().padStart(4)} | $${problemCase.expected.toFixed(2).padStart(7)} | $${actual.toFixed(2).padStart(11)} | $${error.toFixed(2).padStart(7)} | ${problemCase.description}`);
    
    if (error < 50) { // Reasonable error
      problemCasesFixed++;
    }
  }
  
  console.log(`\n🏆 Problem cases with <$50 error: ${problemCasesFixed}/${knownProblemCases.length}`);
  
  // Now run full evaluation
  console.log('\n📊 Running full refined V2 evaluation against 1,000 test cases...');
  
  let successfulRuns = 0;
  let exactMatches = 0;
  let closeMatches = 0;
  let totalError = 0;
  let maxError = 0;
  let maxErrorCase = '';
  
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
      
    } catch (error) {
      console.error(`Case ${i + 1}: Calculation failed - ${error}`);
    }
  }
  
  // Calculate and display results
  if (successfulRuns === 0) {
    console.error('❌ No successful test cases!');
    return;
  }
  
  const avgError = totalError / successfulRuns;
  const exactPct = (exactMatches * 100) / successfulRuns;
  const closePct = (closeMatches * 100) / successfulRuns;
  
  console.log('\n✅ === REFINED V2 1965-STYLE CALCULATOR RESULTS ===');
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
  const comprehensiveScore = 33231.71; // Comprehensive 1965 performance
  const comprehensiveCloseMatches = 9;
  
  const improvementVsKNN = ((currentBestScore - score) / currentBestScore * 100);
  const improvementVsComprehensive = ((comprehensiveScore - score) / comprehensiveScore * 100);
  
  const closeMatchImprovementVsKNN = closeMatches - currentBestCloseMatches;
  const closeMatchImprovementVsComprehensive = closeMatches - comprehensiveCloseMatches;
  
  console.log('\n📊 Performance Comparison:');
  console.log(`vs Current Best (KNN Fast):`);
  console.log(`  Close matches: ${closeMatches} vs ${currentBestCloseMatches} (${closeMatchImprovementVsKNN > 0 ? '+' : ''}${closeMatchImprovementVsKNN})`);
  console.log(`  Score improvement: ${improvementVsKNN.toFixed(1)}% ${improvementVsKNN > 0 ? '(BETTER)' : '(WORSE)'}`);
  
  console.log(`vs Comprehensive 1965:`);
  console.log(`  Close matches: ${closeMatches} vs ${comprehensiveCloseMatches} (${closeMatchImprovementVsComprehensive > 0 ? '+' : ''}${closeMatchImprovementVsComprehensive})`);
  console.log(`  Score improvement: ${improvementVsComprehensive.toFixed(1)}% ${improvementVsComprehensive > 0 ? '(BETTER)' : '(WORSE)'}`);
  
  // Record detection
  if (closeMatches > currentBestCloseMatches) {
    console.log('🏆 NEW OVERALL RECORD! Beat current best close matches!');
  }
  
  if (exactMatches > 8) {
    console.log('🎯 NEW EXACT MATCH RECORD! System reverse engineering improving!');
  }
  
  if (avgError < 55) {
    console.log('💰 NEW AVERAGE ERROR RECORD! Beat KNN baseline!');
  }
  
  console.log('\n✅ === REFINED V2 1965 EVALUATION COMPLETE ===');
  
  // Final recommendation
  if (closeMatches > currentBestCloseMatches) {
    console.log('🚀 RECOMMENDATION: Deploy refined V2 1965 calculator - NEW RECORD!');
  } else if (closeMatches > comprehensiveCloseMatches && avgError < 200) {
    console.log('📈 RECOMMENDATION: Good improvement - continue refinement');
  } else {
    console.log('📝 RECOMMENDATION: More work needed');
  }
}

if (require.main === module) {
  main();
} 