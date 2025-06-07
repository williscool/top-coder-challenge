#!/usr/bin/env ts-node

import * as fs from 'fs';
import { AdvancedPolynomialReimbursementCalculator } from '../advanced-polynomial-calculator';

interface TestCase {
  input: {
    trip_duration_days: number;
    miles_traveled: number;
    total_receipts_amount: number;
  };
  expected_output: number;
}

interface ErrorCase {
  caseId: number;
  days: number;
  miles: number;
  receipts: number;
  expected: number;
  predicted: number;
  error: number;
  efficiency: number;
  receiptsPerDay: number;
  receiptsPerMile: number;
}

function main() {
  console.log('🔍 Diagnostic Analysis - Finding Improvement Opportunities');
  console.log('========================================================\n');

  // Load test cases
  const testData: TestCase[] = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));
  
  // Train the calculator
  const trainingData = testData.map(tc => ({
    days: tc.input.trip_duration_days,
    miles: tc.input.miles_traveled,
    receipts: tc.input.total_receipts_amount,
    expected: tc.expected_output
  }));

  console.log('Training advanced polynomial calculator...');
  const calculator = new AdvancedPolynomialReimbursementCalculator();
  calculator.train(trainingData);
  console.log('✅ Training complete!\n');

  // Analyze errors
  const errorCases: ErrorCase[] = [];
  
  for (let i = 0; i < testData.length; i++) {
    const tc = testData[i];
    const { trip_duration_days, miles_traveled, total_receipts_amount } = tc.input;
    const expected = tc.expected_output;
    
    const predicted = calculator.calculateReimbursement(trip_duration_days, miles_traveled, total_receipts_amount);
    const error = Math.abs(predicted - expected);
    
    errorCases.push({
      caseId: i + 1,
      days: trip_duration_days,
      miles: miles_traveled,
      receipts: total_receipts_amount,
      expected,
      predicted,
      error,
      efficiency: miles_traveled / trip_duration_days,
      receiptsPerDay: total_receipts_amount / trip_duration_days,
      receiptsPerMile: miles_traveled > 0 ? total_receipts_amount / miles_traveled : 0
    });
  }

  // Sort by error (worst first)
  errorCases.sort((a, b) => b.error - a.error);

  console.log('📊 Top 20 Worst Performing Cases:');
  console.log('=================================');
  
  errorCases.slice(0, 20).forEach(ec => {
    console.log(`Case ${ec.caseId}: ${ec.days}d, ${ec.miles}mi, $${ec.receipts.toFixed(2)}`);
    console.log(`  Expected: $${ec.expected.toFixed(2)}, Predicted: $${ec.predicted.toFixed(2)}, Error: $${ec.error.toFixed(2)}`);
    console.log(`  Efficiency: ${ec.efficiency.toFixed(1)} mi/day, Receipts: $${ec.receiptsPerDay.toFixed(2)}/day`);
    console.log('');
  });

  // Analyze patterns in high-error cases
  console.log('🔍 Pattern Analysis of High-Error Cases:');
  console.log('=======================================');

  const highErrorCases = errorCases.slice(0, 100); // Top 100 worst cases

  // Group by trip duration
  const errorByDays = new Map<number, ErrorCase[]>();
  highErrorCases.forEach(ec => {
    if (!errorByDays.has(ec.days)) errorByDays.set(ec.days, []);
    errorByDays.get(ec.days)!.push(ec);
  });

  console.log('High errors by trip duration:');
  Array.from(errorByDays.entries()).sort((a, b) => a[0] - b[0]).forEach(([days, cases]) => {
    const avgError = cases.reduce((sum, ec) => sum + ec.error, 0) / cases.length;
    console.log(`  ${days} days: ${cases.length} cases, avg error: $${avgError.toFixed(2)}`);
  });

  // Analyze efficiency patterns in high-error cases
  console.log('\nHigh errors by efficiency ranges:');
  const efficiencyRanges = [
    { min: 0, max: 50, label: '0-50 mi/day' },
    { min: 50, max: 100, label: '50-100 mi/day' },
    { min: 100, max: 150, label: '100-150 mi/day' },
    { min: 150, max: 200, label: '150-200 mi/day' },
    { min: 200, max: 300, label: '200-300 mi/day' },
    { min: 300, max: 1000, label: '300+ mi/day' }
  ];

  efficiencyRanges.forEach(range => {
    const casesInRange = highErrorCases.filter(ec => ec.efficiency >= range.min && ec.efficiency < range.max);
    if (casesInRange.length > 0) {
      const avgError = casesInRange.reduce((sum, ec) => sum + ec.error, 0) / casesInRange.length;
      console.log(`  ${range.label}: ${casesInRange.length} cases, avg error: $${avgError.toFixed(2)}`);
    }
  });

  // Look for potential rule-based patterns
  console.log('\n🎯 Potential Business Rules (Based on High-Error Cases):');
  console.log('======================================================');

  // Check for specific value patterns
  const roundingErrors = highErrorCases.filter(ec => {
    const diff = ec.expected - ec.predicted;
    return Math.abs(diff % 50) < 5 || Math.abs(diff % 25) < 2;
  });

  console.log(`Cases with potential rounding/tier jumps: ${roundingErrors.length}`);
  if (roundingErrors.length > 0) {
    console.log('Sample rounding cases:');
    roundingErrors.slice(0, 5).forEach(ec => {
      const diff = ec.expected - ec.predicted;
      console.log(`  Case ${ec.caseId}: Expected $${ec.expected.toFixed(2)}, Got $${ec.predicted.toFixed(2)}, Diff: ${diff > 0 ? '+' : ''}$${diff.toFixed(2)}`);
    });
  }

  // Check for systematic under/over-prediction by trip type
  console.log('\nSystematic prediction bias:');
  const shortTrips = errorCases.filter(ec => ec.days <= 3);
  const longTrips = errorCases.filter(ec => ec.days >= 7);
  
  const shortTripBias = shortTrips.reduce((sum, ec) => sum + (ec.predicted - ec.expected), 0) / shortTrips.length;
  const longTripBias = longTrips.reduce((sum, ec) => sum + (ec.predicted - ec.expected), 0) / longTrips.length;
  
  console.log(`  Short trips (1-3 days): avg bias ${shortTripBias > 0 ? '+' : ''}$${shortTripBias.toFixed(2)} (${shortTripBias > 0 ? 'over' : 'under'}-predicting)`);
  console.log(`  Long trips (7+ days): avg bias ${longTripBias > 0 ? '+' : ''}$${longTripBias.toFixed(2)} (${longTripBias > 0 ? 'over' : 'under'}-predicting)`);

  // Feature importance analysis
  console.log('\n🔧 Current Model Feature Importance:');
  console.log('===================================');
  
  const featureImportance = calculator.getFeatureImportance();
  console.log('Top 10 most important features:');
  featureImportance.slice(0, 10).forEach((feat: any, idx: number) => {
    console.log(`  ${idx + 1}. ${feat.feature}: ${feat.coefficient.toFixed(3)} (importance: ${feat.importance.toFixed(3)})`);
  });

  // Suggestions for improvement
  console.log('\n💡 Improvement Suggestions:');
  console.log('===========================');
  
  if (Math.abs(shortTripBias) > 10 || Math.abs(longTripBias) > 10) {
    console.log('✨ Add trip duration bias correction factors');
  }
  
  if (roundingErrors.length > 20) {
    console.log('✨ Implement post-processing rounding rules');
  }
  
  const highEfficiencyErrors = highErrorCases.filter(ec => ec.efficiency > 200).length;
  if (highEfficiencyErrors > 10) {
    console.log('✨ Add special handling for high-efficiency trips');
  }
  
  const lowEfficiencyErrors = highErrorCases.filter(ec => ec.efficiency < 50).length;
  if (lowEfficiencyErrors > 10) {
    console.log('✨ Add special handling for low-efficiency trips');
  }

  console.log('\n🎯 Next Steps:');
  console.log('1. Focus on the systematic biases identified above');
  console.log('2. Consider adding rule-based post-processing');
  console.log('3. Look for more specific business rule patterns');
  console.log('4. Test hybrid approaches combining polynomial + rules');
}

if (require.main === module) {
  main();
} 