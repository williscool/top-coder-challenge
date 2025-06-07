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

interface SuccessCase {
  caseId: number;
  days: number;
  miles: number;
  receipts: number;
  expected: number;
  predicted: number;
  error: number;
  efficiency: number;
  receiptsPerDay: number;
  isExact: boolean;
  isClose: boolean;
}

function main() {
  console.log('🔍 Success Pattern Analysis - Understanding What Works');
  console.log('====================================================\n');

  // Load test cases
  const testData: TestCase[] = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));
  
  // Train both calculators
  const trainingData = testData.map(tc => ({
    days: tc.input.trip_duration_days,
    miles: tc.input.miles_traveled,
    receipts: tc.input.total_receipts_amount,
    expected: tc.expected_output
  }));

  console.log('Training calculators...');
  const originalCalculator = new AdvancedPolynomialReimbursementCalculator();
  const enhancedCalculator = new EnhancedPolynomialReimbursementCalculator();
  
  // Train silently
  const originalLog = console.log;
  console.log = () => {};
  originalCalculator.train(trainingData);
  enhancedCalculator.train(trainingData);
  console.log = originalLog;
  
  console.log('✅ Training complete!\n');

  // Analyze results
  const originalSuccesses: SuccessCase[] = [];
  const enhancedSuccesses: SuccessCase[] = [];
  
  for (let i = 0; i < testData.length; i++) {
    const tc = testData[i];
    const { trip_duration_days, miles_traveled, total_receipts_amount } = tc.input;
    const expected = tc.expected_output;
    
    // Test original calculator
    const originalPredicted = originalCalculator.calculateReimbursement(trip_duration_days, miles_traveled, total_receipts_amount);
    const originalError = Math.abs(originalPredicted - expected);
    
    if (originalError < 1.0) { // Close match
      originalSuccesses.push({
        caseId: i + 1,
        days: trip_duration_days,
        miles: miles_traveled,
        receipts: total_receipts_amount,
        expected,
        predicted: originalPredicted,
        error: originalError,
        efficiency: miles_traveled / trip_duration_days,
        receiptsPerDay: total_receipts_amount / trip_duration_days,
        isExact: originalError < 0.01,
        isClose: originalError < 1.0
      });
    }
    
    // Test enhanced calculator (suppress penalties output)
    console.log = () => {};
    const enhancedPredicted = enhancedCalculator.calculateReimbursement(trip_duration_days, miles_traveled, total_receipts_amount);
    console.log = originalLog;
    const enhancedError = Math.abs(enhancedPredicted - expected);
    
    if (enhancedError < 1.0) { // Close match
      enhancedSuccesses.push({
        caseId: i + 1,
        days: trip_duration_days,
        miles: miles_traveled,
        receipts: total_receipts_amount,
        expected,
        predicted: enhancedPredicted,
        error: enhancedError,
        efficiency: miles_traveled / trip_duration_days,
        receiptsPerDay: total_receipts_amount / trip_duration_days,
        isExact: enhancedError < 0.01,
        isClose: enhancedError < 1.0
      });
    }
  }

  console.log('📊 SUCCESS PATTERN ANALYSIS');
  console.log('===========================\n');

  console.log(`Original Calculator: ${originalSuccesses.length} close matches`);
  console.log(`Enhanced Calculator: ${enhancedSuccesses.length} close matches\n`);

  // Analyze Original successes
  if (originalSuccesses.length > 0) {
    console.log('🎯 ORIGINAL CALCULATOR SUCCESS PATTERNS:');
    console.log('========================================');
    
    originalSuccesses.forEach(sc => {
      console.log(`Case ${sc.caseId}: ${sc.days}d, ${sc.miles}mi, $${sc.receipts.toFixed(2)}`);
      console.log(`  Expected: $${sc.expected.toFixed(2)}, Got: $${sc.predicted.toFixed(2)}, Error: $${sc.error.toFixed(2)}`);
      console.log(`  Efficiency: ${sc.efficiency.toFixed(1)} mi/day, Receipts: $${sc.receiptsPerDay.toFixed(2)}/day`);
      console.log('');
    });

    // Find patterns in Original successes
    console.log('ORIGINAL SUCCESS PATTERNS:');
    console.log('==========================');
    
    const dayGroups = new Map<number, SuccessCase[]>();
    originalSuccesses.forEach(sc => {
      if (!dayGroups.has(sc.days)) dayGroups.set(sc.days, []);
      dayGroups.get(sc.days)!.push(sc);
    });

    console.log('By trip duration:');
    Array.from(dayGroups.entries()).sort((a, b) => a[0] - b[0]).forEach(([days, cases]) => {
      console.log(`  ${days} days: ${cases.length} successes`);
    });

    const efficiencyRanges = [
      { min: 0, max: 50, label: '0-50 mi/day' },
      { min: 50, max: 100, label: '50-100 mi/day' },
      { min: 100, max: 200, label: '100-200 mi/day' },
      { min: 200, max: 1000, label: '200+ mi/day' }
    ];

    console.log('\nBy efficiency:');
    efficiencyRanges.forEach(range => {
      const count = originalSuccesses.filter(sc => sc.efficiency >= range.min && sc.efficiency < range.max).length;
      if (count > 0) {
        console.log(`  ${range.label}: ${count} successes`);
      }
    });

    console.log('\nBy receipt level:');
    const receiptRanges = [
      { min: 0, max: 500, label: '$0-500' },
      { min: 500, max: 1000, label: '$500-1000' },
      { min: 1000, max: 2000, label: '$1000-2000' },
      { min: 2000, max: 5000, label: '$2000+' }
    ];

    receiptRanges.forEach(range => {
      const count = originalSuccesses.filter(sc => sc.receipts >= range.min && sc.receipts < range.max).length;
      if (count > 0) {
        console.log(`  ${range.label}: ${count} successes`);
      }
    });
  }

  // Analyze Enhanced successes  
  if (enhancedSuccesses.length > 0) {
    console.log('\n🚀 ENHANCED CALCULATOR SUCCESS PATTERNS:');
    console.log('========================================');
    
    enhancedSuccesses.forEach(sc => {
      const marker = sc.isExact ? '🎯 EXACT' : '🎯 CLOSE';
      console.log(`${marker} Case ${sc.caseId}: ${sc.days}d, ${sc.miles}mi, $${sc.receipts.toFixed(2)}`);
      console.log(`  Expected: $${sc.expected.toFixed(2)}, Got: $${sc.predicted.toFixed(2)}, Error: $${sc.error.toFixed(2)}`);
      console.log(`  Efficiency: ${sc.efficiency.toFixed(1)} mi/day, Receipts: $${sc.receiptsPerDay.toFixed(2)}/day`);
      console.log('');
    });

    // Find the exact match case specifically
    const exactMatches = enhancedSuccesses.filter(sc => sc.isExact);
    if (exactMatches.length > 0) {
      console.log('🏆 EXACT MATCH ANALYSIS:');
      console.log('========================');
      exactMatches.forEach(sc => {
        console.log(`Case ${sc.caseId} - THE BREAKTHROUGH CASE:`);
        console.log(`  Input: ${sc.days} days, ${sc.miles} miles, $${sc.receipts.toFixed(2)} receipts`);
        console.log(`  Expected: $${sc.expected.toFixed(2)}`);
        console.log(`  Predicted: $${sc.predicted.toFixed(2)}`);
        console.log(`  Error: $${sc.error.toFixed(4)}`);
        console.log(`  Efficiency: ${sc.efficiency.toFixed(2)} mi/day`);
        console.log(`  Daily receipts: $${sc.receiptsPerDay.toFixed(2)}/day`);
        console.log('');
        console.log('🔍 This pattern should be expanded to similar cases!');
      });
    }
  }

  // Compare success patterns
  console.log('\n📈 IMPROVEMENT OPPORTUNITIES:');
  console.log('=============================');
  
  const combinedSuccesses = new Set([
    ...originalSuccesses.map(sc => sc.caseId),
    ...enhancedSuccesses.map(sc => sc.caseId)
  ]);

  console.log(`Combined unique successes: ${combinedSuccesses.size} cases`);
  console.log(`Target for 20%: 200 cases`);
  console.log(`Gap to close: ${200 - combinedSuccesses.size} more cases needed\n`);

  if (enhancedSuccesses.length > 0) {
    console.log('💡 ENHANCEMENT STRATEGY:');
    console.log('========================');
    console.log('1. The Enhanced calculator found exact matches - this is the key breakthrough!');
    console.log('2. Focus on making the business rules less aggressive');
    console.log('3. Try to expand the exact match pattern to similar cases');
    console.log('4. Consider ensemble approach: Original (for avg error) + Enhanced (for exact matches)');
  }

  if (originalSuccesses.length > enhancedSuccesses.length) {
    console.log('⚠️  Original calculator has more close matches - Enhanced may be too aggressive');
    console.log('   Consider dialing back the penalty amounts');
  }
}

if (require.main === module) {
  main();
} 