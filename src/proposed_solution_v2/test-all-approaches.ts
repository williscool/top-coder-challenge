#!/usr/bin/env ts-node

import * as fs from 'fs';
import { AdvancedPolynomialReimbursementCalculator } from '../advanced-polynomial-calculator';
import { EnhancedPolynomialReimbursementCalculator } from './enhanced-polynomial-calculator';
import { RefinedPolynomialReimbursementCalculator } from './refined-polynomial-calculator';
import { BalancedPolynomialReimbursementCalculator } from './balanced-polynomial-calculator';

interface TestCase {
  input: {
    trip_duration_days: number;
    miles_traveled: number;
    total_receipts_amount: number;
  };
  expected_output: number;
}

interface CalculatorResults {
  name: string;
  exactMatches: number;
  closeMatches: number;
  avgError: number;
  maxError: number;
  score: number;
  exactPct: number;
  closePct: number;
}

function evaluateCalculator(calculator: any, testData: TestCase[], name: string): CalculatorResults {
  let successfulRuns = 0;
  let exactMatches = 0;
  let closeMatches = 0;
  let totalError = 0;
  let maxError = 0;
  
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
      
      if (error < 0.01) exactMatches++;
      if (error < 1.0) closeMatches++;
      
      totalError += error;
      maxError = Math.max(maxError, error);
      
    } catch (error) {
      console.error(`${name} Case ${i + 1}: Calculation failed - ${error}`);
    }
  }
  
  const avgError = totalError / successfulRuns;
  const exactPct = (exactMatches * 100) / successfulRuns;
  const closePct = (closeMatches * 100) / successfulRuns;
  const score = avgError * 100 + (testData.length - exactMatches) * 0.1;
  
  return {
    name,
    exactMatches,
    closeMatches,
    avgError,
    maxError,
    score,
    exactPct,
    closePct
  };
}

function main() {
  console.log('🏆 Comprehensive Calculator Performance Comparison (Including Balanced)');
  console.log('======================================================================\n');

  // Load test cases
  const testData: TestCase[] = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));
  
  // Prepare training data
  const trainingData = testData.map(tc => ({
    days: tc.input.trip_duration_days,
    miles: tc.input.miles_traveled,
    receipts: tc.input.total_receipts_amount,
    expected: tc.expected_output
  }));

  // Train all calculators
  console.log('🔧 Training Original Advanced Polynomial...');
  const originalCalculator = new AdvancedPolynomialReimbursementCalculator();
  originalCalculator.train(trainingData);
  console.log('✅ Original complete!\n');

  console.log('🔧 Training Enhanced Polynomial...');
  const enhancedCalculator = new EnhancedPolynomialReimbursementCalculator();
  enhancedCalculator.train(trainingData);
  console.log('✅ Enhanced complete!\n');

  console.log('🔧 Training Refined Polynomial...');
  const refinedCalculator = new RefinedPolynomialReimbursementCalculator();
  refinedCalculator.train(trainingData);
  console.log('✅ Refined complete!\n');

  console.log('🔧 Training Balanced Polynomial...');
  const balancedCalculator = new BalancedPolynomialReimbursementCalculator();
  balancedCalculator.train(trainingData);
  console.log('✅ Balanced complete!\n');

  console.log('📊 Evaluating all calculators...\n');
  
  // Evaluate all calculators (suppress console.log during evaluation)
  const originalLog = console.log;
  console.log = () => {}; // Suppress correction messages
  
  const originalResults = evaluateCalculator(originalCalculator, testData, 'Original');
  const enhancedResults = evaluateCalculator(enhancedCalculator, testData, 'Enhanced');
  const refinedResults = evaluateCalculator(refinedCalculator, testData, 'Refined');
  const balancedResults = evaluateCalculator(balancedCalculator, testData, 'Balanced');
  
  console.log = originalLog; // Restore console.log

  // Display comprehensive comparison
  console.log('🏆 PERFORMANCE COMPARISON');
  console.log('========================');
  console.log();
  
  const results = [originalResults, enhancedResults, refinedResults, balancedResults];
  
  // Header
  console.log('Calculator      | Exact | Close | Avg Error | Max Error |   Score   | Close %');
  console.log('----------------|-------|-------|-----------|-----------|----------|--------');
  
  // Results table
  results.forEach(r => {
    const name = r.name.padEnd(14);
    const exact = `${r.exactMatches}`.padStart(5);
    const close = `${r.closeMatches}`.padStart(5);
    const avgErr = `$${r.avgError.toFixed(2)}`.padStart(9);
    const maxErr = `$${r.maxError.toFixed(2)}`.padStart(9);
    const score = `${r.score.toFixed(2)}`.padStart(9);
    const closePct = `${r.closePct.toFixed(1)}%`.padStart(7);
    
    console.log(`${name} | ${exact} | ${close} | ${avgErr} | ${maxErr} | ${score} | ${closePct}`);
  });
  
  console.log();
  
  // Find best performer in each category
  const bestExact = results.reduce((best, current) => 
    current.exactMatches > best.exactMatches ? current : best);
  const bestAvgError = results.reduce((best, current) => 
    current.avgError < best.avgError ? current : best);
  const bestScore = results.reduce((best, current) => 
    current.score < best.score ? current : best);
  
  console.log('🏅 CATEGORY WINNERS:');
  console.log('===================');
  console.log(`🎯 Most Exact Matches: ${bestExact.name} (${bestExact.exactMatches} cases)`);
  console.log(`📉 Lowest Average Error: ${bestAvgError.name} ($${bestAvgError.avgError.toFixed(2)})`);
  console.log(`🏆 Best Overall Score: ${bestScore.name} (${bestScore.score.toFixed(2)})`);
  console.log();
  
  // Progress analysis
  console.log('📈 PROGRESS ANALYSIS:');
  console.log('=====================');
  
  const originalToEnhanced = {
    exactDiff: enhancedResults.exactMatches - originalResults.exactMatches,
    errorDiff: originalResults.avgError - enhancedResults.avgError,
    scoreDiff: originalResults.score - enhancedResults.score
  };
  
  const originalToRefined = {
    exactDiff: refinedResults.exactMatches - originalResults.exactMatches,
    errorDiff: originalResults.avgError - refinedResults.avgError,
    scoreDiff: originalResults.score - refinedResults.score
  };
  
  console.log('Original → Enhanced:');
  console.log(`  Exact matches: ${originalToEnhanced.exactDiff > 0 ? '+' : ''}${originalToEnhanced.exactDiff}`);
  console.log(`  Average error: ${originalToEnhanced.errorDiff > 0 ? '-' : '+'}$${Math.abs(originalToEnhanced.errorDiff).toFixed(2)}`);
  console.log(`  Score: ${originalToEnhanced.scoreDiff > 0 ? '-' : '+'}${Math.abs(originalToEnhanced.scoreDiff).toFixed(2)}`);
  console.log();
  
  console.log('Original → Refined:');
  console.log(`  Exact matches: ${originalToRefined.exactDiff > 0 ? '+' : ''}${originalToRefined.exactDiff}`);
  console.log(`  Average error: ${originalToRefined.errorDiff > 0 ? '-' : '+'}$${Math.abs(originalToRefined.errorDiff).toFixed(2)}`);
  console.log(`  Score: ${originalToRefined.scoreDiff > 0 ? '-' : '+'}${Math.abs(originalToRefined.scoreDiff).toFixed(2)}`);
  console.log();
  
  // Recommendations
  console.log('💡 RECOMMENDATIONS:');
  console.log('==================');
  
  if (bestExact.exactMatches > 0) {
    console.log(`✅ ${bestExact.name} found exact matches! This is the breakthrough we needed.`);
    console.log('   Focus on analyzing what patterns this approach captures correctly.');
    
    if (bestExact.name !== bestAvgError.name) {
      console.log(`⚖️  However, ${bestAvgError.name} has better average error.`);
      console.log('   Consider combining the best aspects of both approaches.');
    }
  } else {
    console.log('❌ Still no exact matches. Consider:');
    console.log('   1. More aggressive rule-based post-processing');
    console.log('   2. Lookup table approach for specific patterns');
    console.log('   3. Ensemble methods combining multiple approaches');
  }
  
  // Next steps
  console.log('\n🎯 NEXT STEPS:');
  console.log('==============');
  
  if (bestScore.name === 'Refined') {
    console.log('1. The refined approach is working! Update your main calculator to use it.');
    console.log('2. Analyze the specific corrections that led to exact matches.');
    console.log('3. Fine-tune the correction thresholds for even better performance.');
  } else if (bestScore.name === 'Original') {
    console.log('1. The business rules may be too aggressive - go back to the original.');
    console.log('2. Try more subtle corrections or different patterns.');
    console.log('3. Focus on ensemble methods rather than rule-based corrections.');
  } else {
    console.log('1. Investigate why the enhanced approach got exact matches.');
    console.log('2. Try to make it less aggressive while preserving the exact match capability.');
    console.log('3. Consider hybrid approaches.');
  }
}

if (require.main === module) {
  main();
} 