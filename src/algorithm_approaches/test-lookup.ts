#!/usr/bin/env ts-node

import * as fs from 'fs';
import { LookupReimbursementCalculator } from './lookup-calculator';

interface TestCase {
  input: {
    trip_duration_days: number;
    miles_traveled: number;
    total_receipts_amount: number;
  };
  expected_output: number;
}

function testLookupApproach() {
  console.log('🧪 Testing Lookup Table Approach');
  console.log('=================================');
  console.log('Using direct mapping from diagnostic analysis findings');
  console.log();

  const publicCasesData = fs.readFileSync('public_cases.json', 'utf8');
  const testCases: TestCase[] = JSON.parse(publicCasesData);

  // Test on a sample to get quick feedback
  console.log('📊 Testing on full dataset (1,000 cases):');
  
  const calculator = new LookupReimbursementCalculator();
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
      const calculated = calculator.calculateReimbursement(trip_duration_days, miles_traveled, total_receipts_amount);
      const error = Math.abs(calculated - expected);
      
      if (error < 0.01) exactMatches++;
      if (error < 1.0) closeMatches++;
      totalError += error;
      
      if (error > maxError) {
        maxError = error;
        maxErrorCase = `Case ${i + 1}: ${trip_duration_days}d, ${miles_traveled}mi, $${total_receipts_amount}`;
      }
    } catch (error) {
      console.log(`Case ${i + 1}: Calculation failed - ${error}`);
    }
  }

  const avgError = totalError / testCases.length;
  const exactPct = (exactMatches / testCases.length) * 100;
  const closePct = (closeMatches / testCases.length) * 100;

  console.log(`  Exact matches (±$0.01): ${exactMatches}/${testCases.length} (${exactPct.toFixed(1)}%)`);
  console.log(`  Close matches (±$1.00): ${closeMatches}/${testCases.length} (${closePct.toFixed(1)}%)`);
  console.log(`  Average error: $${avgError.toFixed(2)}`);
  console.log(`  Maximum error: $${maxError.toFixed(2)}`);
  console.log(`  Worst case: ${maxErrorCase}`);
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
    const calculated = calculator.calculateReimbursement(testCase.days, testCase.miles, testCase.receipts);
    const error = Math.abs(calculated - testCase.expected);
    const breakdown = calculator.getBreakdown(testCase.days, testCase.miles, testCase.receipts);
    const improvement = error < 50 ? '🎉 EXCELLENT' : error < 100 ? '✅ MAJOR IMPROVEMENT' : error < 200 ? '🟡 Good improvement' : '❌ Still poor';
    
    console.log(`  Case ${testCase.caseNum}: ${testCase.days}d, ${testCase.miles}mi, $${testCase.receipts}`);
    console.log(`    Expected: $${testCase.expected}, Got: $${calculated}, Error: $${error.toFixed(2)} ${improvement}`);
    console.log(`    Breakdown: A=$${breakdown.strategyA}, B=$${breakdown.strategyB}, C=$${breakdown.strategyC}`);
    console.log(`    Components: Day=$${breakdown.dayRate}/day, Mile=$${breakdown.mileageComponent}, Receipt=$${breakdown.receiptComponent}`);
    console.log();
  }

  // Show some strategy comparisons
  console.log('📐 Strategy Analysis for Sample Cases:');
  const sampleCases = [
    {days: 1, miles: 50, receipts: 10, desc: "Simple 1-day trip"},
    {days: 3, miles: 200, receipts: 300, desc: "Standard 3-day trip"},
    {days: 7, miles: 800, receipts: 1200, desc: "Long trip, high expenses"},
  ];

  for (const sample of sampleCases) {
    const breakdown = calculator.getBreakdown(sample.days, sample.miles, sample.receipts);
    console.log(`  ${sample.desc} (${sample.days}d, ${sample.miles}mi, $${sample.receipts}):`);
    console.log(`    Strategy A (scaled day rate): $${breakdown.strategyA}`);
    console.log(`    Strategy B (component-based): $${breakdown.strategyB}`);
    console.log(`    Strategy C (weighted combo): $${breakdown.strategyC} ← USED`);
    console.log();
  }

  // Comparison analysis
  console.log('📊 Comparison Analysis:');
  console.log(`  vs Original complex approach: ${avgError < 1000 ? '✅ Much better' : '❌ Still worse'} (was $1,027 avg error)`);
  console.log(`  vs Polynomial approach: ${avgError < 187 ? '✅ Better' : avgError < 250 ? '🟡 Similar' : '❌ Worse'} (was $187 avg error)`);
  
  console.log();
  console.log('📈 Progress Tracking:');
  console.log('  Target: >10% exact matches for significant improvement');
  console.log('  Target: >50% exact matches for good performance');
  console.log('  Target: >95% exact matches for excellent performance');
  
  if (exactMatches > 500) {
    console.log('🎉 BREAKTHROUGH! Lookup approach is working excellently!');
    console.log('💡 Next: Fine-tune the lookup tables and optimize strategies');
  } else if (exactMatches > 100) {
    console.log('🎉 MAJOR SUCCESS! Lookup approach is working well!');
    console.log('💡 Next: Optimize the strategy weights and parameters');
  } else if (exactMatches > 10) {
    console.log('✅ Good progress! Lookup approach shows promise.');
    console.log('💡 Next: Refine the tier values and strategy logic');
  } else if (avgError < 150) {
    console.log('🟡 Some improvement over polynomial regression.');
    console.log('💡 Next: Try decision tree approach or hybrid methods');
  } else {
    console.log('❌ Lookup approach not sufficient.');
    console.log('💡 Move to Step 3: Decision tree approach');
  }

  console.log();
  console.log('🚀 Next Steps from Action Plan:');
  console.log('  1. If results are good: Update CLI and test with fast-eval.sh');
  console.log('  2. If results are mixed: Try decision tree approach');
  console.log('  3. If results are poor: Move to Step 3 (decision tree) immediately');
}

if (require.main === module) {
  testLookupApproach();
} 