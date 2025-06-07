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

interface PatternAnalysis {
  byDuration: Map<number, {count: number; avgOutput: number; avgPerDay: number; cases: TestCase[]}>;
  byMiles: Array<{range: string; count: number; avgOutput: number; avgPerMile: number}>;
  byReceipts: Array<{range: string; count: number; avgOutput: number; avgRatio: number}>;
  simpleBaselineEstimate: number;
}

function analyzePatternsFromExpectedOutputs(): PatternAnalysis {
  const publicCasesData = fs.readFileSync('public_cases.json', 'utf8');
  const testCases: TestCase[] = JSON.parse(publicCasesData);

  // Group by duration
  const byDuration = new Map<number, {count: number; avgOutput: number; avgPerDay: number; cases: TestCase[]}>();
  
  for (const testCase of testCases) {
    const days = testCase.input.trip_duration_days;
    if (!byDuration.has(days)) {
      byDuration.set(days, {count: 0, avgOutput: 0, avgPerDay: 0, cases: []});
    }
    
    const group = byDuration.get(days)!;
    group.cases.push(testCase);
    group.count++;
  }

  // Calculate averages for each duration
  for (const [days, group] of byDuration) {
    const totalOutput = group.cases.reduce((sum, c) => sum + c.expected_output, 0);
    group.avgOutput = totalOutput / group.count;
    group.avgPerDay = group.avgOutput / days;
  }

  // Analyze mileage patterns (simplified ranges)
  const mileageRanges = [
    {min: 0, max: 100, range: '0-100'},
    {min: 101, max: 300, range: '101-300'},
    {min: 301, max: 500, range: '301-500'},
    {min: 501, max: 1000, range: '501-1000'},
    {min: 1001, max: Infinity, range: '1000+'}
  ];

  const byMiles = mileageRanges.map(range => {
    const casesInRange = testCases.filter(c => 
      c.input.miles_traveled >= range.min && c.input.miles_traveled <= range.max
    );
    
    if (casesInRange.length === 0) return {
      range: range.range, count: 0, avgOutput: 0, avgPerMile: 0
    };

    const avgOutput = casesInRange.reduce((sum, c) => sum + c.expected_output, 0) / casesInRange.length;
    const avgMiles = casesInRange.reduce((sum, c) => sum + c.input.miles_traveled, 0) / casesInRange.length;
    
    return {
      range: range.range,
      count: casesInRange.length,
      avgOutput: avgOutput,
      avgPerMile: avgMiles > 0 ? avgOutput / avgMiles : 0
    };
  });

  // Analyze receipt patterns
  const receiptRanges = [
    {min: 0, max: 200, range: '$0-200'},
    {min: 201, max: 600, range: '$201-600'},
    {min: 601, max: 800, range: '$601-800'},
    {min: 801, max: 1500, range: '$801-1500'},
    {min: 1501, max: Infinity, range: '$1500+'}
  ];

  const byReceipts = receiptRanges.map(range => {
    const casesInRange = testCases.filter(c => 
      c.input.total_receipts_amount >= range.min && c.input.total_receipts_amount <= range.max
    );
    
    if (casesInRange.length === 0) return {
      range: range.range, count: 0, avgOutput: 0, avgRatio: 0
    };

    const avgOutput = casesInRange.reduce((sum, c) => sum + c.expected_output, 0) / casesInRange.length;
    const avgReceipts = casesInRange.reduce((sum, c) => sum + c.input.total_receipts_amount, 0) / casesInRange.length;
    
    return {
      range: range.range,
      count: casesInRange.length,
      avgOutput: avgOutput,
      avgRatio: avgReceipts > 0 ? avgOutput / avgReceipts : 0
    };
  });

  // Simple baseline: find low-mile, low-receipt cases to estimate base rate
  const baselineCases = testCases.filter(c => 
    c.input.miles_traveled <= 50 && c.input.total_receipts_amount <= 50
  );
  
  const simpleBaselineEstimate = baselineCases.length > 0 ? 
    baselineCases.reduce((sum, c) => sum + c.expected_output, 0) / baselineCases.length : 0;

  return {
    byDuration,
    byMiles,
    byReceipts,
    simpleBaselineEstimate
  };
}

function main() {
  console.log('🔍 Diagnostic Analysis of Public Cases');
  console.log('====================================');
  console.log();

  const analysis = analyzePatternsFromExpectedOutputs();

  console.log('📊 Duration Analysis (from actual expected outputs):');
  for (const [days, data] of analysis.byDuration) {
    console.log(`  ${days} day${days > 1 ? 's' : ''}: ${data.count} cases, avg $${data.avgOutput.toFixed(2)} total, $${data.avgPerDay.toFixed(2)}/day`);
  }
  console.log();

  console.log('🛣️  Mileage Analysis:');
  for (const data of analysis.byMiles) {
    if (data.count > 0) {
      console.log(`  ${data.range} miles: ${data.count} cases, avg $${data.avgOutput.toFixed(2)} total, $${data.avgPerMile.toFixed(3)}/mile`);
    }
  }
  console.log();

  console.log('🧾 Receipt Analysis:');
  for (const data of analysis.byReceipts) {
    if (data.count > 0) {
      console.log(`  ${data.range}: ${data.count} cases, avg $${data.avgOutput.toFixed(2)} total, ${data.avgRatio.toFixed(2)}x multiplier`);
    }
  }
  console.log();

  console.log('📝 Key Insights:');
  console.log(`  Baseline estimate (low miles + low receipts): $${analysis.simpleBaselineEstimate.toFixed(2)}`);
  
  // Calculate realistic per-day rates
  const oneDayRate = analysis.byDuration.get(1)?.avgPerDay || 0;
  const multiDayRate = analysis.byDuration.get(3)?.avgPerDay || 0;
  
  console.log(`  1-day trips: $${oneDayRate.toFixed(2)}/day`);
  console.log(`  Multi-day trips: ~$${multiDayRate.toFixed(2)}/day`);
  
  if (oneDayRate > 0 && multiDayRate > 0) {
    console.log(`  Duration multiplier (1-day vs 3-day): ${(oneDayRate / multiDayRate).toFixed(2)}x`);
  }

  console.log();
  console.log('🚨 Current Issues:');
  console.log('  Your parameters are generating values 3-5x too high');
  console.log('  Base rate should be much smaller (probably ~$20-50/day, not $100)');
  console.log('  Duration multipliers should be much smaller (probably 1.5-3x, not 8.74x)');
  console.log('  Efficiency bonuses should be additive, not multiplicative');

  console.log();
  console.log('💡 Next Steps:');
  console.log('  1. Start with realistic base rates from this analysis');
  console.log('  2. Build a simple linear model first');
  console.log('  3. Add complexity gradually while maintaining accuracy');
}

if (require.main === module) {
  main();
} 