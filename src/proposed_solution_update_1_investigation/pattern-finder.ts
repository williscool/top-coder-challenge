import * as fs from 'fs';

interface TestCase {
    input: {
        trip_duration_days: number;
        miles_traveled: number;
        total_receipts_amount: number;
    };
    expected_output: number;
}

interface RuleCandidate {
    description: string;
    formula: (days: number, miles: number, receipts: number) => number;
    exactMatches: number;
    closeMatches: number;
    avgError: number;
}

function findExactBusinessRules() {
    console.log('🔍 Exact Business Rules Pattern Finder');
    console.log('=====================================\n');

    // Load test cases
    const testData = JSON.parse(fs.readFileSync('public_cases.json', 'utf8')) as TestCase[];
    console.log(`Analyzing ${testData.length} test cases...\n`);
    
    // Extract data for analysis
    const cases = testData.map((tc, idx) => ({
        id: idx + 1,
        days: tc.input.trip_duration_days,
        miles: tc.input.miles_traveled,
        receipts: tc.input.total_receipts_amount,
        expected: tc.expected_output,
        dayRate: tc.expected_output / tc.input.trip_duration_days,
        mileRate: tc.input.miles_traveled > 0 ? tc.expected_output / tc.input.miles_traveled : 0,
        receiptMultiplier: tc.input.total_receipts_amount > 0 ? tc.expected_output / tc.input.total_receipts_amount : 0
    }));
    
    // Look for exact value patterns
    console.log('🔢 Exact Value Analysis:');
    console.log('========================');
    
    // Check for common exact values
    const expectedValues = cases.map(c => c.expected);
    const valueCounts = new Map<number, number>();
    
    expectedValues.forEach(val => {
        valueCounts.set(val, (valueCounts.get(val) || 0) + 1);
    });
    
    const repeatedValues = Array.from(valueCounts.entries())
        .filter(([_, count]) => count > 1)
        .sort((a, b) => b[1] - a[1]);
    
    console.log('Most common exact values:');
    repeatedValues.slice(0, 10).forEach(([value, count]) => {
        console.log(`  $${value.toFixed(2)}: appears ${count} times`);
    });
    
    // Check for rounded patterns
    console.log('\n🎯 Rounding Pattern Analysis:');
    console.log('=============================');
    
    const roundingLevels = [0.01, 0.05, 0.10, 0.25, 0.50, 1.00, 5.00];
    
    for (const round of roundingLevels) {
        const rounded = expectedValues.map(val => Math.round(val / round) * round);
        const exactMatches = rounded.filter((val, idx) => Math.abs(val - expectedValues[idx]) < 0.001).length;
        
        console.log(`Rounding to $${round.toFixed(2)}: ${exactMatches} exact matches (${(exactMatches/expectedValues.length*100).toFixed(1)}%)`);
    }
    
    // Analyze by trip duration
    console.log('\n📅 Trip Duration Analysis:');
    console.log('==========================');
    
    const byDays = new Map<number, typeof cases>();
    cases.forEach(c => {
        if (!byDays.has(c.days)) byDays.set(c.days, []);
        byDays.get(c.days)!.push(c);
    });
    
    for (const [days, dayCases] of Array.from(byDays.entries()).sort((a, b) => a[0] - b[0])) {
        const dayRates = dayCases.map(c => c.dayRate);
        const avgDayRate = dayRates.reduce((sum, rate) => sum + rate, 0) / dayRates.length;
        const minDayRate = Math.min(...dayRates);
        const maxDayRate = Math.max(...dayRates);
        
        console.log(`${days}-day trips (${dayCases.length} cases):`);
        console.log(`  Day rate range: $${minDayRate.toFixed(2)} - $${maxDayRate.toFixed(2)} (avg: $${avgDayRate.toFixed(2)})`);
        
        // Look for common day rates
        const commonDayRates = findCommonValues(dayRates, 0.1);
        if (commonDayRates.length > 0) {
            console.log(`  Most common day rates:`);
            commonDayRates.slice(0, 3).forEach(([rate, count]) => {
                console.log(`    $${rate.toFixed(2)}/day: ${count} cases`);
            });
        }
    }
    
    // Test specific formula hypotheses
    console.log('\n🧮 Formula Testing:');
    console.log('===================');
    
    const formulaCandidates: RuleCandidate[] = [
        {
            description: 'Base + Day Rate + Mile Rate + Receipt %',
            formula: (d, m, r) => 100 + d * 200 + m * 0.5 + r * 0.3,
            exactMatches: 0,
            closeMatches: 0,
            avgError: 0
        },
        {
            description: 'Tiered Day Rate (1d=$150, 2d=$120, 3+d=$100)',
            formula: (d, m, r) => {
                const dayRate = d === 1 ? 150 : d === 2 ? 120 : 100;
                return dayRate * d + m * 0.5 + r * 0.3;
            },
            exactMatches: 0,
            closeMatches: 0,
            avgError: 0
        },
        {
            description: 'Mile Brackets (0-100: $2/mi, 100+: $1/mi)',
            formula: (d, m, r) => {
                const mileReimbursement = m <= 100 ? m * 2 : 100 * 2 + (m - 100) * 1;
                return d * 120 + mileReimbursement + r * 0.3;
            },
            exactMatches: 0,
            closeMatches: 0,
            avgError: 0
        },
        {
            description: 'Receipt Brackets (Low: 2x, High: 0.5x)',
            formula: (d, m, r) => {
                const receiptMultiplier = r < 100 ? 2 : 0.5;
                return d * 120 + m * 0.5 + r * receiptMultiplier;
            },
            exactMatches: 0,
            closeMatches: 0,
            avgError: 0
        },
        {
            description: 'Complex: Day tiers + Mile brackets + Receipt %',
            formula: (d, m, r) => {
                const dayRate = d === 1 ? 175 : d <= 3 ? 140 : 110;
                const mileRate = m <= 50 ? 3 : m <= 200 ? 2 : 1;
                return dayRate * d + mileRate * m + r * 0.25;
            },
            exactMatches: 0,
            closeMatches: 0,
            avgError: 0
        }
    ];
    
    // Test each formula
    for (const candidate of formulaCandidates) {
        let totalError = 0;
        let exactMatches = 0;
        let closeMatches = 0;
        
        for (const testCase of cases) {
            const calculated = candidate.formula(testCase.days, testCase.miles, testCase.receipts);
            const error = Math.abs(calculated - testCase.expected);
            
            totalError += error;
            
            if (error < 0.01) exactMatches++;
            if (error < 1.0) closeMatches++;
        }
        
        candidate.exactMatches = exactMatches;
        candidate.closeMatches = closeMatches;
        candidate.avgError = totalError / cases.length;
        
        console.log(`\n"${candidate.description}":`);
        console.log(`  Exact matches: ${exactMatches} (${(exactMatches/cases.length*100).toFixed(1)}%)`);
        console.log(`  Close matches: ${closeMatches} (${(closeMatches/cases.length*100).toFixed(1)}%)`);
        console.log(`  Average error: $${candidate.avgError.toFixed(2)}`);
    }
    
    // Find the best formula
    const bestFormula = formulaCandidates.reduce((best, current) => 
        current.exactMatches > best.exactMatches ? current : best
    );
    
    console.log(`\n🏆 Best Formula: "${bestFormula.description}"`);
    console.log(`   ${bestFormula.exactMatches} exact matches, $${bestFormula.avgError.toFixed(2)} avg error`);
    
    // If no exact matches, show some specific examples
    if (bestFormula.exactMatches === 0) {
        console.log('\n🔍 Example Cases Analysis:');
        console.log('==========================');
        
        // Show first 10 cases with best formula
        for (let i = 0; i < Math.min(10, cases.length); i++) {
            const c = cases[i];
            const calculated = bestFormula.formula(c.days, c.miles, c.receipts);
            const error = Math.abs(calculated - c.expected);
            
            console.log(`Case ${c.id}: ${c.days}d, ${c.miles}mi, $${c.receipts.toFixed(2)}`);
            console.log(`  Expected: $${c.expected.toFixed(2)}, Calculated: $${calculated.toFixed(2)}, Error: $${error.toFixed(2)}`);
        }
    }
    
    console.log('\n💡 Next Steps:');
    console.log('==============');
    if (bestFormula.exactMatches > 0) {
        console.log('✅ Found some exact matches! Refine this formula.');
    } else {
        console.log('❌ No exact matches found. This suggests:');
        console.log('   - More complex business rules (multiple tiers/brackets)');
        console.log('   - Lookup tables or conditional logic');
        console.log('   - Non-linear calculations');
        console.log('   - Need to analyze more specific patterns');
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
    findExactBusinessRules();
} 