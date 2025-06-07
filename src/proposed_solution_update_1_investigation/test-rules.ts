import * as fs from 'fs';
import { RulesReimbursementCalculator } from './rules-calculator';

interface TestCase {
    input: {
        trip_duration_days: number;
        miles_traveled: number;
        total_receipts_amount: number;
    };
    expected_output: number;
}

function testRulesCalculator() {
    console.log('🧪 Testing Rules-Based Calculator');
    console.log('=================================\n');

    // Load test cases
    const testData = JSON.parse(fs.readFileSync('public_cases.json', 'utf8')) as TestCase[];
    const calculator = new RulesReimbursementCalculator();
    
    let totalError = 0;
    let exactMatches = 0;
    let closeMatches = 0;
    let maxError = 0;
    let maxErrorCase = '';
    
    const results: Array<{
        case_id: number;
        days: number;
        miles: number;
        receipts: number;
        expected: number;
        calculated: number;
        error: number;
    }> = [];
    
    console.log('📊 Testing on full dataset (1,000 cases):');
    
    for (let i = 0; i < testData.length; i++) {
        const testCase = testData[i];
        const { trip_duration_days: days, miles_traveled: miles, total_receipts_amount: receipts } = testCase.input;
        const expected = testCase.expected_output;
        
        const calculated = calculator.calculateReimbursement(days, miles, receipts);
        const error = Math.abs(calculated - expected);
        
        results.push({
            case_id: i + 1,
            days,
            miles,
            receipts,
            expected,
            calculated,
            error
        });
        
        totalError += error;
        
        if (error < 0.01) exactMatches++;
        if (error < 1.0) closeMatches++;
        
        if (error > maxError) {
            maxError = error;
            maxErrorCase = `Case ${i + 1}: ${days}d, ${miles}mi, $${receipts.toFixed(2)}`;
        }
    }
    
    const avgError = totalError / testData.length;
    
    console.log(`  Exact matches (±$0.01): ${exactMatches}/${testData.length} (${(exactMatches/testData.length*100).toFixed(1)}%)`);
    console.log(`  Close matches (±$1.00): ${closeMatches}/${testData.length} (${(closeMatches/testData.length*100).toFixed(1)}%)`);
    console.log(`  Average error: $${avgError.toFixed(2)}`);
    console.log(`  Maximum error: $${maxError.toFixed(2)}`);
    console.log(`  Worst case: ${maxErrorCase}`);
    
    // Sort by error to find best and worst cases
    results.sort((a, b) => a.error - b.error);
    
    console.log('\n🎯 Best Predictions (Lowest Error):');
    for (let i = 0; i < Math.min(10, results.length); i++) {
        const r = results[i];
        console.log(`  Case ${r.case_id}: ${r.days}d, ${r.miles}mi, $${r.receipts.toFixed(2)}`);
        console.log(`    Expected: $${r.expected.toFixed(2)}, Calculated: $${r.calculated.toFixed(2)}, Error: $${r.error.toFixed(2)}`);
    }
    
    console.log('\n🔥 Worst Predictions (Highest Error):');
    for (let i = results.length - 10; i < results.length; i++) {
        const r = results[i];
        console.log(`  Case ${r.case_id}: ${r.days}d, ${r.miles}mi, $${r.receipts.toFixed(2)}`);
        console.log(`    Expected: $${r.expected.toFixed(2)}, Calculated: $${r.calculated.toFixed(2)}, Error: $${r.error.toFixed(2)}`);
    }
    
    // Compare with our previous best result
    console.log('\n📈 Performance Comparison:');
    console.log('==========================');
    console.log('Rules Calculator vs Advanced Polynomial:');
    console.log(`  Rules - Exact matches: ${exactMatches} (${(exactMatches/testData.length*100).toFixed(1)}%)`);
    console.log(`  Advanced Poly - Exact matches: 0 (0.0%)`);
    console.log(`  Rules - Close matches: ${closeMatches} (${(closeMatches/testData.length*100).toFixed(1)}%)`);
    console.log(`  Advanced Poly - Close matches: 8 (0.8%)`);
    console.log(`  Rules - Average error: $${avgError.toFixed(2)}`);
    console.log(`  Advanced Poly - Average error: $85.44`);
    
    if (exactMatches > 0) {
        console.log('\n✅ SUCCESS: Found exact matches!');
        console.log('This suggests we\'re on the right track with rule-based approach.');
    } else if (avgError < 85.44) {
        console.log('\n🟡 IMPROVEMENT: Better average error than polynomial approach.');
        console.log('Need to refine rules further for exact matches.');
    } else {
        console.log('\n❌ REGRESSION: Worse than polynomial approach.');
        console.log('Need to revise rule-based strategy.');
    }
    
    // Analyze patterns in exact matches
    if (exactMatches > 0) {
        const exactMatchCases = results.filter(r => r.error < 0.01);
        console.log('\n🔍 Analyzing Exact Matches:');
        console.log('===========================');
        
        const dayDistribution = new Map<number, number>();
        exactMatchCases.forEach(r => {
            dayDistribution.set(r.days, (dayDistribution.get(r.days) || 0) + 1);
        });
        
        console.log('Exact matches by trip duration:');
        for (const [days, count] of Array.from(dayDistribution.entries()).sort((a, b) => a[0] - b[0])) {
            console.log(`  ${days}-day trips: ${count} exact matches`);
        }
        
        // Look for patterns
        console.log('\nPatterns in exact matches:');
        exactMatchCases.slice(0, 5).forEach(r => {
            const efficiency = r.miles / r.days;
            const receiptRatio = r.receipts / r.expected;
            console.log(`  Case ${r.case_id}: ${efficiency.toFixed(1)} mi/day, ${receiptRatio.toFixed(2)} receipt ratio`);
        });
    }
    
    console.log('\n🚀 Next Steps:');
    console.log('==============');
    if (exactMatches > 10) {
        console.log('1. ✅ Great progress! Update CLI to use rules calculator');
        console.log('2. 🔧 Fine-tune rules for remaining cases');
        console.log('3. 📊 Run ./fast-eval.sh to test performance');
    } else if (exactMatches > 0) {
        console.log('1. 🔍 Analyze exact match patterns to improve rules');
        console.log('2. 🎯 Focus on specific trip duration or mileage patterns');
        console.log('3. 🔧 Refine efficiency multipliers and adjustments');
    } else {
        console.log('1. 📊 Rules approach needs major revision');
        console.log('2. 🔍 May need more sophisticated pattern analysis');
        console.log('3. 🤔 Consider hybrid approach or lookup tables');
    }
}

if (require.main === module) {
    testRulesCalculator();
} 