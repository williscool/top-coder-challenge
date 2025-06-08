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

interface CategoryStats {
  count: number;
  totalOutput: number;
  avgOutput: number;
  outputs: number[];
  cases: TestCase[];
}

class System1965Analyzer {
  private testCases: TestCase[] = [];

  constructor() {
    this.loadTestCases();
  }

  private loadTestCases(): void {
    const data = fs.readFileSync('public_cases.json', 'utf8');
    this.testCases = JSON.parse(data);
    console.log(`📊 Loaded ${this.testCases.length} test cases for 1965 analysis`);
  }

  // Test 1965 Lookup Table Hypothesis
  analyzeLookupTablePatterns(): void {
    console.log('\n🔍 === 1965 LOOKUP TABLE ANALYSIS ===');
    
    const categoryMap = new Map<string, CategoryStats>();

    this.testCases.forEach((testCase, index) => {
      const category = this.categorizeTrip1965Style(
        testCase.input.trip_duration_days,
        testCase.input.miles_traveled,
        testCase.input.total_receipts_amount
      );

      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          count: 0,
          totalOutput: 0,
          avgOutput: 0,
          outputs: [],
          cases: []
        });
      }

      const stats = categoryMap.get(category)!;
      stats.count++;
      stats.totalOutput += testCase.expected_output;
      stats.outputs.push(testCase.expected_output);
      stats.cases.push(testCase);
    });

    // Calculate averages and analyze consistency
    console.log('\n📋 Category Analysis:');
    console.log('Format: Category | Count | Avg Output | Output Range | Std Dev');
    console.log('=' .repeat(80));

    const categories = Array.from(categoryMap.entries()).sort((a, b) => b[1].count - a[1].count);
    
    for (const [category, stats] of categories.slice(0, 20)) { // Top 20 categories
      stats.avgOutput = stats.totalOutput / stats.count;
      const stdDev = this.calculateStdDev(stats.outputs);
      const minOutput = Math.min(...stats.outputs);
      const maxOutput = Math.max(...stats.outputs);
      
      console.log(`${category.padEnd(25)} | ${stats.count.toString().padStart(5)} | $${stats.avgOutput.toFixed(2).padStart(8)} | $${minOutput.toFixed(2)}-$${maxOutput.toFixed(2)} | $${stdDev.toFixed(2)}`);
      
      // Check for potential exact lookup matches (low standard deviation)
      if (stdDev < 10 && stats.count > 1) {
        console.log(`  🎯 POTENTIAL LOOKUP TABLE ENTRY: Low variation (σ=$${stdDev.toFixed(2)})`);
      }
    }
  }

  // 1965-style input categorization
  private categorizeTrip1965Style(days: number, miles: number, receipts: number): string {
    // Days: Discrete categories (1965 approach)
    let dayCategory: string;
    if (days === 1) dayCategory = 'D1';
    else if (days <= 3) dayCategory = 'D2-3';
    else if (days <= 6) dayCategory = 'D4-6';
    else if (days <= 13) dayCategory = 'D7-13';
    else dayCategory = 'D14+';

    // Miles: Fixed brackets (1965 approach)  
    let mileCategory: string;
    if (miles <= 100) mileCategory = 'M0-100';
    else if (miles <= 300) mileCategory = 'M101-300';
    else if (miles <= 500) mileCategory = 'M301-500';
    else if (miles <= 1000) mileCategory = 'M501-1000';
    else mileCategory = 'M1000+';

    // Receipts: Fixed brackets (1965 approach)
    let receiptCategory: string;
    if (receipts <= 50) receiptCategory = 'R0-50';
    else if (receipts <= 200) receiptCategory = 'R51-200';
    else if (receipts <= 600) receiptCategory = 'R201-600';
    else if (receipts <= 1200) receiptCategory = 'R601-1200';
    else if (receipts <= 2000) receiptCategory = 'R1201-2000';
    else receiptCategory = 'R2000+';

    return `${dayCategory}|${mileCategory}|${receiptCategory}`;
  }

  // Test Fixed-Point Arithmetic Patterns
  analyzeFixedPointArithmetic(): void {
    console.log('\n🔢 === 1965 FIXED-POINT ARITHMETIC ANALYSIS ===');
    
    const outputs = this.testCases.map(tc => tc.expected_output);
    const centsOutputs = outputs.map(output => Math.round(output * 100));
    
    // Test for common 1965 rounding patterns
    const divisors = [1, 5, 10, 25, 50, 100]; // penny, nickel, dime, quarter, half-dollar, dollar
    
    console.log('\n💰 Rounding Pattern Analysis:');
    console.log('Divisor (cents) | Count | Percentage | 1965 Significance');
    console.log('=' .repeat(65));
    
    for (const divisor of divisors) {
      const divisibleCount = centsOutputs.filter(cents => cents % divisor === 0).length;
      const percentage = (divisibleCount / outputs.length * 100).toFixed(1);
      let significance = '';
      
      switch(divisor) {
        case 1: significance = 'All amounts (baseline)'; break;
        case 5: significance = 'Nickel rounding'; break;
        case 10: significance = 'Dime rounding'; break;
        case 25: significance = 'Quarter rounding'; break;
        case 50: significance = 'Half-dollar rounding'; break;
        case 100: significance = 'Dollar rounding'; break;
      }
      
      console.log(`${divisor.toString().padStart(11)} | ${divisibleCount.toString().padStart(5)} | ${percentage.padStart(10)}% | ${significance}`);
    }

    // Check for patterns in decimal places
    console.log('\n📊 Decimal Place Analysis:');
    const decimalPatterns = new Map<string, number>();
    
    outputs.forEach(output => {
      const decimalStr = output.toFixed(2).split('.')[1];
      decimalPatterns.set(decimalStr, (decimalPatterns.get(decimalStr) || 0) + 1);
    });
    
    const sortedDecimals = Array.from(decimalPatterns.entries()).sort((a, b) => b[1] - a[1]);
    console.log('Decimal Ending | Count | Percentage');
    console.log('=' .repeat(35));
    
    for (const [decimal, count] of sortedDecimals.slice(0, 10)) {
      const percentage = (count / outputs.length * 100).toFixed(1);
      console.log(`      .${decimal}     | ${count.toString().padStart(5)} | ${percentage.padStart(10)}%`);
    }
  }

  // Analyze Kevin's 6 Calculation Paths
  analyzeKevinsSixPaths(): void {
    console.log('\n🛤️  === KEVIN\'S 6 CALCULATION PATHS ANALYSIS ===');
    
    const pathMap = new Map<string, CategoryStats>();
    
    this.testCases.forEach(testCase => {
      const path = this.identifyCalculationPath(
        testCase.input.trip_duration_days,
        testCase.input.miles_traveled,
        testCase.input.total_receipts_amount
      );
      
      if (!pathMap.has(path)) {
        pathMap.set(path, {
          count: 0,
          totalOutput: 0,
          avgOutput: 0,
          outputs: [],
          cases: []
        });
      }
      
      const stats = pathMap.get(path)!;
      stats.count++;
      stats.totalOutput += testCase.expected_output;
      stats.outputs.push(testCase.expected_output);
      stats.cases.push(testCase);
    });

    console.log('\n📋 Calculation Path Analysis:');
    console.log('Path Name           | Count | Avg Output | Std Dev | Description');
    console.log('=' .repeat(70));
    
    for (const [path, stats] of pathMap.entries()) {
      stats.avgOutput = stats.totalOutput / stats.count;
      const stdDev = this.calculateStdDev(stats.outputs);
      
      const description = this.getPathDescription(path);
      
      console.log(`${path.padEnd(19)} | ${stats.count.toString().padStart(5)} | $${stats.avgOutput.toFixed(2).padStart(8)} | $${stdDev.toFixed(2).padStart(7)} | ${description}`);
    }
  }

  private identifyCalculationPath(days: number, miles: number, receipts: number): string {
    const efficiency = miles / days;
    const dailySpending = receipts / days;
    
    // Kevin's identified patterns from interviews
    if (days === 1) return 'SINGLE_DAY';
    
    if (days <= 3 && efficiency > 150) return 'HIGH_EFF_SHORT';
    
    if (days >= 4 && days <= 6) {
      if (efficiency >= 180 && efficiency <= 220 && dailySpending < 100) {
        return 'KEVIN_SWEET_SPOT'; // Kevin's guaranteed bonus
      }
      return 'MEDIUM_BALANCED';
    }
    
    if (days >= 7 && efficiency < 100) return 'LONG_LOW_EFF';
    
    if (days >= 8 && dailySpending > 120) return 'VACATION_PENALTY'; // Kevin's penalty
    
    return 'STANDARD';
  }

  private getPathDescription(path: string): string {
    const descriptions: Record<string, string> = {
      'SINGLE_DAY': 'Single day trips',
      'HIGH_EFF_SHORT': 'Short trips with high efficiency (>150 mi/day)',
      'KEVIN_SWEET_SPOT': 'Kevin\'s guaranteed bonus (5d + 180-220 mi/day + <$100/day)',
      'MEDIUM_BALANCED': 'Medium length trips (4-6 days)',
      'LONG_LOW_EFF': 'Long trips with low efficiency (<100 mi/day)',
      'VACATION_PENALTY': 'Kevin\'s vacation penalty (8+ days + >$120/day)',
      'STANDARD': 'Standard calculation path'
    };
    return descriptions[path] || 'Unknown path';
  }

  // Analyze Lisa's Patterns
  analyzeLisasPatterns(): void {
    console.log('\n👩‍💼 === LISA\'S ACCOUNTING PATTERNS ANALYSIS ===');
    
    // Lisa's 5-day bonus analysis
    console.log('\n🏆 Lisa\'s 5-Day Bonus Analysis:');
    const fiveDayTrips = this.testCases.filter(tc => tc.input.trip_duration_days === 5);
    const otherTrips = this.testCases.filter(tc => tc.input.trip_duration_days !== 5);
    
    const fiveDayAvg = fiveDayTrips.reduce((sum, tc) => sum + tc.expected_output, 0) / fiveDayTrips.length;
    const otherAvg = otherTrips.reduce((sum, tc) => sum + tc.expected_output, 0) / otherTrips.length;
    
    console.log(`5-day trips: ${fiveDayTrips.length} cases, $${fiveDayAvg.toFixed(2)} average`);
    console.log(`Other trips: ${otherTrips.length} cases, $${otherAvg.toFixed(2)} average`);
    
    // Lisa's receipt sweet spot analysis ($600-800)
    console.log('\n💰 Lisa\'s Receipt Sweet Spot Analysis ($600-800):');
    const sweetSpotTrips = this.testCases.filter(tc => 
      tc.input.total_receipts_amount >= 600 && tc.input.total_receipts_amount <= 800
    );
    const nonsweetSpotTrips = this.testCases.filter(tc => 
      tc.input.total_receipts_amount < 600 || tc.input.total_receipts_amount > 800
    );
    
    const sweetSpotAvg = sweetSpotTrips.reduce((sum, tc) => sum + tc.expected_output, 0) / sweetSpotTrips.length;
    const nonsweetSpotAvg = nonsweetSpotTrips.reduce((sum, tc) => sum + tc.expected_output, 0) / nonsweetSpotTrips.length;
    
    console.log(`Sweet spot trips: ${sweetSpotTrips.length} cases, $${sweetSpotAvg.toFixed(2)} average`);
    console.log(`Non-sweet spot trips: ${nonsweetSpotTrips.length} cases, $${nonsweetSpotAvg.toFixed(2)} average`);
  }

  // Analyze high-error cases from our current results
  analyzeHighErrorCases(): void {
    console.log('\n❌ === HIGH-ERROR CASE ANALYSIS (1965 PERSPECTIVE) ===');
    
    const highErrorCases = [
      { case: 684, days: 8, miles: 795, receipts: 1645.99, expected: 644.69, got: 1543.96 },
      { case: 152, days: 4, miles: 69, receipts: 2321.49, expected: 322.00, got: 1139.08 },
      { case: 996, days: 1, miles: 1082, receipts: 1809.49, expected: 446.94, got: 1237.29 },
      { case: 711, days: 5, miles: 516, receipts: 1878.49, expected: 669.85, got: 1412.83 },
      { case: 367, days: 11, miles: 740, receipts: 1171.99, expected: 902.09, got: 1626.61 }
    ];
    
    console.log('\n🔍 1965 System Analysis of High-Error Cases:');
    console.log('Case | Days | Miles | Receipts | Expected | Got      | 1965 Analysis');
    console.log('=' .repeat(80));
    
    for (const errorCase of highErrorCases) {
      const efficiency = errorCase.miles / errorCase.days;
      const dailySpending = errorCase.receipts / errorCase.days;
      const error = Math.abs(errorCase.got - errorCase.expected);
      
      let analysis = '';
      
      // Apply 1965 logic analysis
      if (errorCase.days >= 8 && dailySpending > 120) {
        analysis = 'VACATION PENALTY (Kevin\'s rule)';
      } else if (errorCase.receipts > 2000) {
        analysis = 'HIGH RECEIPT PENALTY (Marcus\'s threshold)';
      } else if (errorCase.days === 1 && errorCase.miles > 1000) {
        analysis = 'SINGLE DAY + EXTREME MILEAGE (special path)';
      } else if (errorCase.days === 5 && errorCase.receipts > 1500) {
        analysis = '5-DAY BONUS vs RECEIPT PENALTY (conflict)';
      } else {
        analysis = 'UNKNOWN 1965 RULE';
      }
      
      console.log(`${errorCase.case.toString().padStart(4)} | ${errorCase.days.toString().padStart(4)} | ${errorCase.miles.toString().padStart(5)} | $${errorCase.receipts.toFixed(2).padStart(8)} | $${errorCase.expected.toFixed(2).padStart(7)} | $${errorCase.got.toFixed(2).padStart(7)} | ${analysis}`);
    }
  }

  private calculateStdDev(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance);
  }

  runFullAnalysis(): void {
    console.log('🕰️  === 1965 REIMBURSEMENT SYSTEM ANALYSIS ===');
    console.log('Analyzing 60-year-old system architecture patterns...\n');
    
    this.analyzeLookupTablePatterns();
    this.analyzeFixedPointArithmetic();
    this.analyzeKevinsSixPaths();
    this.analyzeLisasPatterns();
    this.analyzeHighErrorCases();
    
    console.log('\n✅ === ANALYSIS COMPLETE ===');
    console.log('📋 Next steps:');
    console.log('1. Use lookup table patterns to build 1965-style rate schedules');
    console.log('2. Implement Kevin\'s 6 calculation paths as discrete decision tree');
    console.log('3. Apply Lisa\'s fixed breakpoints and bonuses');
    console.log('4. Test 1965-style calculator against high-error cases');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new System1965Analyzer();
  analyzer.runFullAnalysis();
} 