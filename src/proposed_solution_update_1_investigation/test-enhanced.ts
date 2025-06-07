#!/usr/bin/env ts-node

import * as fs from 'fs';
import { AdvancedPolynomialReimbursementCalculator } from '../advanced-polynomial-calculator';
import { EnhancedPolynomialReimbursementCalculator } from './enhanced-polynomial-calculator';

interface TestCase {
  input: {
    trip_duration_days: number;
    miles_traveled: number;
    total_receipts_amount: number;
  };
  expected_output: number;
}

function evaluateCalculator(calculator: any, testData: TestCase[], name: string) {
  let successfulRuns = 0;
  let exactMatches = 0;
  let closeMatches = 0;
  let totalError = 0;
  let maxError = 0;
  let maxErrorCase = '';
  
  for (let i = 0; i < testData.length; i++) {
    const testCase = testData[i];
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
      console.error(`${name} Case ${i + 1}: Calculation failed - ${error}`);
    }
  }
  
  // Calculate and display results
  if (successfulRuns === 0) {
    console.error(`❌ ${name}: No successful test cases!`);
    return null;
  }
  
  const avgError = totalError / successfulRuns;
  const exactPct = (exactMatches * 100) / successfulRuns;
  const closePct = (closeMatches * 100) / successfulRuns;
  const score = avgError * 100 + (testData.length - exactMatches) * 0.1;
  
  return {
    name,
    successfulRuns,
    exactMatches,
    closeMatches,
    avgError,
    maxError,
    exactPct,
    closePct,
    score,
    maxErrorCase
  };
}

function main() {
  console.log('🆚 Enhanced vs Original Calculator Comparison');
  console.log('============================================\n');

  // Load test cases
  const testData: TestCase[] = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));
  
  // Prepare training data
  const trainingData = testData.map(tc => ({
    days: tc.input.trip_duration_days,
    miles: tc.input.miles_traveled,
    receipts: tc.input.total_receipts_amount,
    expected: tc.expected_output
  }));

  console.log('Training Original Advanced Polynomial Calculator...');
  const originalCalculator = new AdvancedPolynomialReimbursementCalculator();
  originalCalculator.train(trainingData);
  console.log('✅ Original training complete!\n');

  console.log('Training Enhanced Polynomial Calculator...');
  const enhancedCalculator = new EnhancedPolynomialReimbursementCalculator();
  enhancedCalculator.train(trainingData);
  console.log('✅ Enhanced training complete!\n');

  console.log('📊 Evaluating both calculators...\n');
  
  // Evaluate both calculators
  const originalResults = evaluateCalculator(originalCalculator, testData, 'Original');
  const enhancedResults = evaluateCalculator(enhancedCalculator, testData, 'Enhanced');

  if (!originalResults || !enhancedResults) {
    console.error('❌ Evaluation failed!');
    return;
  }

  // Display comparison
  console.log('📈 Comparison Results:');
  console.log('=====================');
  console.log();
  
  console.log('📊 ORIGINAL Advanced Polynomial:');
  console.log(`  Exact matches: ${originalResults.exactMatches} (${originalResults.exactPct.toFixed(1)}%)`);
  console.log(`  Close matches: ${originalResults.closeMatches} (${originalResults.closePct.toFixed(1)}%)`);
  console.log(`  Average error: $${originalResults.avgError.toFixed(2)}`);
  console.log(`  Maximum error: $${originalResults.maxError.toFixed(2)}`);
  console.log(`  Score: ${originalResults.score.toFixed(2)}`);
  console.log();

  console.log('🚀 ENHANCED Polynomial with Business Rules:');
  console.log(`  Exact matches: ${enhancedResults.exactMatches} (${enhancedResults.exactPct.toFixed(1)}%)`);
  console.log(`  Close matches: ${enhancedResults.closeMatches} (${enhancedResults.closePct.toFixed(1)}%)`);
  console.log(`  Average error: $${enhancedResults.avgError.toFixed(2)}`);
  console.log(`  Maximum error: $${enhancedResults.maxError.toFixed(2)}`);
  console.log(`  Score: ${enhancedResults.score.toFixed(2)}`);
  console.log();

  // Calculate improvements
  const exactImprovement = enhancedResults.exactMatches - originalResults.exactMatches;
  const errorImprovement = originalResults.avgError - enhancedResults.avgError;
  const scoreImprovement = originalResults.score - enhancedResults.score;
  const maxErrorImprovement = originalResults.maxError - enhancedResults.maxError;

  console.log('📈 IMPROVEMENT SUMMARY:');
  console.log('======================');
  console.log(`Exact matches: ${exactImprovement > 0 ? '+' : ''}${exactImprovement} cases`);
  console.log(`Average error: ${errorImprovement > 0 ? '-' : '+'}$${Math.abs(errorImprovement).toFixed(2)} (${errorImprovement > 0 ? 'better' : 'worse'})`);
  console.log(`Maximum error: ${maxErrorImprovement > 0 ? '-' : '+'}$${Math.abs(maxErrorImprovement).toFixed(2)} (${maxErrorImprovement > 0 ? 'better' : 'worse'})`);
  console.log(`Score: ${scoreImprovement > 0 ? '-' : '+'}${Math.abs(scoreImprovement).toFixed(2)} (${scoreImprovement > 0 ? 'better' : 'worse'})`);
  console.log();

  if (enhancedResults.exactMatches > originalResults.exactMatches) {
    console.log('🎉 Enhanced calculator found more exact matches!');
  } else if (enhancedResults.avgError < originalResults.avgError) {
    console.log('🎯 Enhanced calculator has lower average error!');
  } else {
    console.log('🤔 Enhanced calculator needs more tuning...');
  }

  console.log('\n💡 Next Steps:');
  if (enhancedResults.exactMatches === 0) {
    console.log('1. Analyze specific business rule patterns further');
    console.log('2. Look for exact value lookups or tier systems');
    console.log('3. Consider ensemble methods');
  } else {
    console.log('1. Fine-tune the business rules for better performance');
    console.log('2. Analyze remaining high-error cases');
    console.log('3. Consider additional rule-based corrections');
  }
}

if (require.main === module) {
  main();
} 