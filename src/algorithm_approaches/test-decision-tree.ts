#!/usr/bin/env ts-node

import * as fs from 'fs';
import { DecisionTreeReimbursementCalculator } from './decision-tree-calculator';

interface TestCase {
  input: {
    trip_duration_days: number;
    miles_traveled: number;
    total_receipts_amount: number;
  };
  expected_output: number;
}

function testDecisionTreeApproach() {
  console.log('🧪 Testing Decision Tree Approach');
  console.log('=================================');
  console.log('Based on Kevin\'s insight about "six calculation paths"');
  console.log();

  const publicCasesData = fs.readFileSync('public_cases.json', 'utf8');
  const testCases: TestCase[] = JSON.parse(publicCasesData);

  console.log('📊 Testing on full dataset (1,000 cases):');
  
  const calculator = new DecisionTreeReimbursementCalculator();
  let exactMatches = 0;
  let closeMatches = 0;
  let totalError = 0;
  let maxError = 0;
  let maxErrorCase = '';

  // Track path usage
  const pathUsage = new Map<string, number>();

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

      // Track path usage
      const breakdown = calculator.getBreakdown(trip_duration_days, miles_traveled, total_receipts_amount);
      pathUsage.set(breakdown.path, (pathUsage.get(breakdown.path) || 0) + 1);

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

  // Show path usage statistics
  console.log('📊 Decision Tree Path Usage:');
  for (const [path, count] of pathUsage.entries()) {
    const percentage = (count / testCases.length) * 100;
    console.log(`  ${path}: ${count} cases (${percentage.toFixed(1)}%)`);
  }
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
    console.log(`    Path: ${breakdown.path}`);
    console.log(`    Logic: ${breakdown.calculation}`);
    console.log(`    Efficiency: ${breakdown.milesPerDay} mi/day, $${breakdown.receiptsPerDay}/day receipts`);
    console.log();
  }

  // Show sample calculations for each path
  console.log('📐 Sample Calculations by Path:');
  const pathSamples = [
    {days: 1, miles: 50, receipts: 20, desc: "Single day trip"},
    {days: 3, miles: 150, receipts: 200, desc: "Short trip, low expense"},
    {days: 4, miles: 800, receipts: 1200, desc: "Short trip, high expense"},
    {days: 6, miles: 1200, receipts: 800, desc: "Medium trip (Kevin's efficiency zone)"},
    {days: 10, miles: 1500, receipts: 1000, desc: "Long trip"},
    {days: 15, miles: 2000, receipts: 1500, desc: "Extended trip"},
  ];

  for (const sample of pathSamples) {
    const breakdown = calculator.getBreakdown(sample.days, sample.miles, sample.receipts);
    console.log(`  ${sample.desc} (${sample.days}d, ${sample.miles}mi, $${sample.receipts}):`);
    console.log(`    Path: ${breakdown.path} → $${breakdown.final}`);
    console.log(`    Logic: ${breakdown.calculation}`);
    console.log();
  }

  // Comparison analysis
  console.log('📊 Performance Comparison:');
  console.log(`  vs Original complex: ${avgError < 1000 ? '✅ Much better' : '❌ Still worse'} (was $1,027 avg error)`);
  console.log(`  vs Polynomial: ${avgError < 187 ? '✅ Better' : avgError < 250 ? '🟡 Similar' : '❌ Worse'} (was $187 avg error)`);
  console.log(`  vs Lookup tables: ${avgError < 1031 ? '✅ Better' : '❌ Worse'} (was $1,031 avg error)`);
  
  console.log();
  console.log('📈 Progress Tracking:');
  console.log('  Target: >10% exact matches for significant improvement');
  console.log('  Target: >50% exact matches for good performance');
  console.log('  Target: >95% exact matches for excellent performance');
  
  if (exactMatches > 500) {
    console.log('🎉 BREAKTHROUGH! Decision tree approach is working excellently!');
    console.log('💡 Next: Fine-tune the path logic and thresholds');
  } else if (exactMatches > 100) {
    console.log('🎉 MAJOR SUCCESS! Decision tree approach is working well!');
    console.log('💡 Next: Optimize the calculation formulas for each path');
  } else if (exactMatches > 10) {
    console.log('✅ Good progress! Decision tree approach shows promise.');
    console.log('💡 Next: Refine the path determination and calculations');
  } else if (avgError < 150) {
    console.log('🟡 Some improvement! Decision tree approach has potential.');
    console.log('💡 Next: Try hybrid approach combining best methods');
  } else {
    console.log('❌ Decision tree approach needs refinement.');
    console.log('💡 Next: Analyze failed cases and adjust path logic');
  }

  console.log();
  console.log('🚀 Next Steps from Action Plan:');
  console.log('  1. If results are excellent: Update CLI and prepare for submission');
  console.log('  2. If results are good: Fine-tune and optimize further');
  console.log('  3. If results are mixed: Try hybrid approach (polynomial + decision tree)');
  console.log('  4. If results are poor: Back to analysis phase');
}

if (require.main === module) {
  testDecisionTreeApproach();
} 