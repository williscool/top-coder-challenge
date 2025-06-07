#!/usr/bin/env ts-node

import * as fs from 'fs';

interface TestCase {
  input: {
    trip_duration_days: number;
    miles_traveled: number;
    total_receipts_amount: number;
  };
  expected_output: number;
}

function analyzeSpecificPatterns() {
  console.log('🔍 Deep Pattern Analysis');
  console.log('========================');
  console.log();

  const publicCasesData = fs.readFileSync('public_cases.json', 'utf8');
  const testCases: TestCase[] = JSON.parse(publicCasesData);

  // Let's look at very simple cases first
  console.log('🎯 Simple Cases Analysis:');
  console.log('Looking for minimal input cases to understand base patterns...');
  console.log();

  // Find cases with low values to understand base rates
  const simpleCases = testCases
    .filter(c => c.input.miles_traveled <= 100 && c.input.total_receipts_amount <= 100)
    .sort((a, b) => (a.input.miles_traveled + a.input.total_receipts_amount) - (b.input.miles_traveled + b.input.total_receipts_amount))
    .slice(0, 10);

  console.log('📊 Lowest complexity cases:');
  for (const testCase of simpleCases) {
    const { trip_duration_days, miles_traveled, total_receipts_amount } = testCase.input;
    const expected = testCase.expected_output;
    
    console.log(`  ${trip_duration_days}d, ${miles_traveled}mi, $${total_receipts_amount.toFixed(2)} → $${expected}`);
    
    // Try to reverse engineer what the calculation might be
    const perDay = expected / trip_duration_days;
    const perMile = miles_traveled > 0 ? expected / miles_traveled : 0;
    const receiptRatio = total_receipts_amount > 0 ? expected / total_receipts_amount : 0;
    
    console.log(`    Analysis: $${perDay.toFixed(2)}/day, $${perMile.toFixed(2)}/mile, ${receiptRatio.toFixed(2)}x receipts`);
  }

  console.log();
  console.log('🧮 Trying Linear Regression Approach:');
  console.log('Maybe it\'s just: Output = a*days + b*miles + c*receipts + d');
  console.log();

  // Try to find coefficients for a simple linear model
  // Output = a*days + b*miles + c*receipts + d
  // Using first 50 cases for quick analysis
  const sampleCases = testCases.slice(0, 50);
  
  console.log('Sample cases for linear analysis:');
  for (let i = 0; i < Math.min(10, sampleCases.length); i++) {
    const testCase = sampleCases[i];
    const { trip_duration_days, miles_traveled, total_receipts_amount } = testCase.input;
    const expected = testCase.expected_output;
    
    console.log(`  Case ${i+1}: ${trip_duration_days}d + ${miles_traveled}mi + $${total_receipts_amount.toFixed(2)} = $${expected}`);
  }

  console.log();
  console.log('🔬 Pattern Recognition:');
  
  // Look for cases with similar inputs but different outputs
  console.log('Looking for 1-day trips with varying parameters...');
  const oneDayTrips = testCases
    .filter(c => c.input.trip_duration_days === 1)
    .sort((a, b) => a.input.miles_traveled - b.input.miles_traveled)
    .slice(0, 10);

  for (const trip of oneDayTrips) {
    const { miles_traveled, total_receipts_amount } = trip.input;
    const expected = trip.expected_output;
    console.log(`  1d, ${miles_traveled}mi, $${total_receipts_amount.toFixed(2)} → $${expected}`);
  }

  console.log();
  console.log('Looking for similar mile/receipt combinations with different durations...');
  
  // Find cases with similar miles and receipts but different days
  const midRangeCases = testCases
    .filter(c => c.input.miles_traveled >= 200 && c.input.miles_traveled <= 300 &&
                 c.input.total_receipts_amount >= 400 && c.input.total_receipts_amount <= 600)
    .sort((a, b) => a.input.trip_duration_days - b.input.trip_duration_days)
    .slice(0, 8);

  for (const testCase of midRangeCases) {
    const { trip_duration_days, miles_traveled, total_receipts_amount } = testCase.input;
    const expected = testCase.expected_output;
    console.log(`  ${trip_duration_days}d, ${miles_traveled}mi, $${total_receipts_amount.toFixed(2)} → $${expected}`);
  }

  console.log();
  console.log('💡 Key Questions to Answer:');
  console.log('1. Is there a clear linear relationship?');
  console.log('2. Are there interaction terms (days * miles, etc.)?');
  console.log('3. Are there threshold effects or step functions?');
  console.log('4. Could it be a lookup table or decision tree?');
  
  console.log();
  console.log('🎯 Next Steps:');
  console.log('1. Try a simple linear regression: output = a*days + b*miles + c*receipts + d');
  console.log('2. If that doesn\'t work, try polynomial features');
  console.log('3. Consider if it might be a completely different approach (lookup table, etc.)');
}

if (require.main === module) {
  analyzeSpecificPatterns();
} 