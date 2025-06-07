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

interface AnalysisResult {
    case_id: number;
    days: number;
    miles: number;
    receipts: number;
    expected: number;
    predicted: number;
    error: number;
    day_rate: number;
    mile_rate: number;
    receipt_rate: number;
}

function analyzeBusinessRules() {
    console.log('🔍 Business Rules Analysis');
    console.log('==========================\n');

    // Load test cases
    const testData = JSON.parse(fs.readFileSync('public_cases.json', 'utf8')) as TestCase[];
    
    const calculator = new AdvancedPolynomialReimbursementCalculator();
    
    // Get all predictions
    const results: AnalysisResult[] = [];
    
    for (let i = 0; i < testData.length; i++) {
        const testCase = testData[i];
        const { trip_duration_days: days, miles_traveled: miles, total_receipts_amount: receipts } = testCase.input;
        const expected = testCase.expected_output;
        
        const predicted = calculator.calculateReimbursement(days, miles, receipts);
        const error = Math.abs(predicted - expected);
        
        results.push({
            case_id: i + 1,
            days,
            miles,
            receipts,
            expected,
            predicted,
            error,
            day_rate: expected / days,
            mile_rate: miles > 0 ? expected / miles : 0,
            receipt_rate: receipts > 0 ? expected / receipts : 0
        });
    }
    
    // Sort by error (best first)
    results.sort((a, b) => a.error - b.error);
    
    console.log('📊 Best Predictions (Lowest Error):');
    console.log('=====================================');
    for (let i = 0; i < 20; i++) {
        const r = results[i];
        console.log(`Case ${r.case_id}: ${r.days}d, ${r.miles}mi, $${r.receipts.toFixed(2)}`);
        console.log(`  Expected: $${r.expected.toFixed(2)}, Predicted: $${r.predicted.toFixed(2)}, Error: $${r.error.toFixed(2)}`);
        console.log(`  Rates: $${r.day_rate.toFixed(2)}/day, $${r.mile_rate.toFixed(2)}/mile, ${r.receipt_rate.toFixed(2)}x receipts\n`);
    }
    
    // Analyze close matches (within $1)
    const closeMatches = results.filter(r => r.error < 1.0);
    console.log(`\n🎯 Close Matches Analysis (${closeMatches.length} cases within $1):`);
    console.log('============================================================');
    
    if (closeMatches.length > 0) {
        // Group by trip duration
        const byDays = new Map<number, AnalysisResult[]>();
        closeMatches.forEach(r => {
            if (!byDays.has(r.days)) byDays.set(r.days, []);
            byDays.get(r.days)!.push(r);
        });
        
        for (const [days, cases] of byDays) {
            console.log(`\n${days}-day trips (${cases.length} close matches):`);
            const avgDayRate = cases.reduce((sum, c) => sum + c.day_rate, 0) / cases.length;
            const avgMileRate = cases.reduce((sum, c) => sum + c.mile_rate, 0) / cases.length;
            const avgReceiptRate = cases.reduce((sum, c) => sum + c.receipt_rate, 0) / cases.length;
            
            console.log(`  Average rates: $${avgDayRate.toFixed(2)}/day, $${avgMileRate.toFixed(2)}/mile, ${avgReceiptRate.toFixed(2)}x receipts`);
            
            // Show a few examples
            for (let i = 0; i < Math.min(3, cases.length); i++) {
                const c = cases[i];
                console.log(`    Case ${c.case_id}: ${c.miles}mi, $${c.receipts.toFixed(2)} → $${c.expected.toFixed(2)} (error: $${c.error.toFixed(2)})`);
            }
        }
    }
    
    // Look for exact patterns in the expected outputs
    console.log('\n🔢 Pattern Analysis in Expected Outputs:');
    console.log('=======================================');
    
    // Round to different precision levels to find patterns
    const roundings = [1, 5, 10, 25, 50, 100];
    
    for (const round of roundings) {
        const rounded = results.map(r => Math.round(r.expected / round) * round);
        const uniqueRounded = new Set(rounded);
        const exactMatches = rounded.filter((val, idx) => val === results[idx].expected).length;
        
        console.log(`Rounding to $${round}: ${uniqueRounded.size} unique values, ${exactMatches} exact matches`);
    }
    
    // Check for common denominators or patterns
    console.log('\n🧮 Common Rate Patterns:');
    console.log('========================');
    
    // Analyze day rates
    const dayRates = results.map(r => r.day_rate);
    const commonDayRates = findCommonValues(dayRates, 0.1);
    console.log('Most common day rates:');
    commonDayRates.slice(0, 10).forEach(([rate, count]) => {
        console.log(`  $${rate.toFixed(2)}/day: ${count} cases`);
    });
    
    // Analyze mile rates  
    const mileRates = results.filter(r => r.miles > 0).map(r => r.mile_rate);
    const commonMileRates = findCommonValues(mileRates, 0.01);
    console.log('\nMost common mile rates:');
    commonMileRates.slice(0, 10).forEach(([rate, count]) => {
        console.log(`  $${rate.toFixed(2)}/mile: ${count} cases`);
    });
    
    // Try to find formula patterns
    console.log('\n🔬 Formula Pattern Detection:');
    console.log('============================');
    
    // Check if any simple formulas work exactly
    let exactFormulaMatches = 0;
    
    for (const result of results.slice(0, 100)) { // Test on first 100 cases
        const { days, miles, receipts, expected } = result;
        
        // Try various simple formulas
        const formulas: [string, number][] = [
            ['days * 300 + miles * 0.5 + receipts * 0.3', days * 300 + miles * 0.5 + receipts * 0.3],
            ['days * 250 + miles * 0.6 + receipts * 0.4', days * 250 + miles * 0.6 + receipts * 0.4],
            ['days * 200 + miles * 0.7 + receipts * 0.5', days * 200 + miles * 0.7 + receipts * 0.5],
            ['days * 350 + miles * 0.45 + receipts * 0.25', days * 350 + miles * 0.45 + receipts * 0.25],
        ];
        
        for (const [formula, calculated] of formulas) {
            if (Math.abs(calculated - expected) < 0.01) {
                console.log(`✅ EXACT MATCH: Case ${result.case_id} - ${formula} = $${calculated.toFixed(2)}`);
                exactFormulaMatches++;
            }
        }
    }
    
    console.log(`\nFound ${exactFormulaMatches} exact formula matches in first 100 cases.`);
    
    // Summary
    console.log('\n📋 Summary:');
    console.log('===========');
    console.log(`- Total cases analyzed: ${results.length}`);
    console.log(`- Close matches (within $1): ${closeMatches.length} (${(closeMatches.length/results.length*100).toFixed(1)}%)`);
    console.log(`- Average error: $${(results.reduce((sum, r) => sum + r.error, 0) / results.length).toFixed(2)}`);
    console.log(`- Best error: $${results[0].error.toFixed(2)}`);
    console.log(`- Worst error: $${results[results.length-1].error.toFixed(2)}`);
    
    if (closeMatches.length > 0) {
        console.log('\n💡 Next Steps:');
        console.log('==============');
        console.log('1. Analyze the close matches to identify exact business rule patterns');
        console.log('2. Look for threshold-based or bracket-based calculations');
        console.log('3. Try rule-based approach instead of regression');
        console.log('4. Consider that there might be exact lookup tables or fixed rates');
    }
}

function findCommonValues(values: number[], tolerance: number): [number, number][] {
    const counts = new Map<number, number>();
    
    for (const value of values) {
        let found = false;
        for (const [existingValue, count] of counts) {
            if (Math.abs(value - existingValue) <= tolerance) {
                counts.set(existingValue, count + 1);
                found = true;
                break;
            }
        }
        if (!found) {
            counts.set(value, 1);
        }
    }
    
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
}

if (require.main === module) {
    analyzeBusinessRules();
} 