import * as fs from 'fs';

interface TestCase {
    input: {
        trip_duration_days: number;
        miles_traveled: number;
        total_receipts_amount: number;
    };
    expected_output: number;
}

function decomposeFormula() {
    console.log('🔬 Formula Decomposition Analysis');
    console.log('=================================\n');

    const testData = JSON.parse(fs.readFileSync('public_cases.json', 'utf8')) as TestCase[];
    console.log(`Analyzing ${testData.length} test cases to find exact formula...\n`);

    // Test simple linear formula: BASE + DAYS*DAY_RATE + MILES*MILE_RATE + RECEIPTS*RECEIPT_RATE
    console.log('🧮 Testing Linear Formula Combinations');
    console.log('======================================');
    
    let bestFormula = { exactMatches: 0, avgError: Infinity, formula: '' };
    
    // Test ranges based on our polynomial findings
    const bases = [0, 50, 100, 200, 300, 400, 500];
    const dayRates = [50, 75, 100, 125, 150, 175, 200, 250];
    const mileRates = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0, 1.2, 1.5, 2.0];
    const receiptRates = [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5];
    
    let testedCount = 0;
    const totalTests = bases.length * dayRates.length * mileRates.length * receiptRates.length;
    
    for (const base of bases) {
        for (const dayRate of dayRates) {
            for (const mileRate of mileRates) {
                for (const receiptRate of receiptRates) {
                    testedCount++;
                    
                    if (testedCount % 1000 === 0) {
                        console.log(`Progress: ${testedCount}/${totalTests} formulas tested...`);
                    }
                    
                    let exactMatches = 0;
                    let totalError = 0;
                    
                    for (const testCase of testData) {
                        const { trip_duration_days: days, miles_traveled: miles, total_receipts_amount: receipts } = testCase.input;
                        const expected = testCase.expected_output;
                        
                        const calculated = base + days * dayRate + miles * mileRate + receipts * receiptRate;
                        const error = Math.abs(calculated - expected);
                        
                        totalError += error;
                        if (error < 0.01) exactMatches++;
                    }
                    
                    const avgError = totalError / testData.length;
                    
                    if (exactMatches > bestFormula.exactMatches || 
                        (exactMatches === bestFormula.exactMatches && avgError < bestFormula.avgError)) {
                        bestFormula = {
                            exactMatches,
                            avgError,
                            formula: `${base} + ${dayRate}*days + ${mileRate}*miles + ${receiptRate}*receipts`
                        };
                        
                        if (exactMatches > 0) {
                            console.log(`🎯 NEW BEST: ${exactMatches} exact matches!`);
                            console.log(`   Formula: ${bestFormula.formula}`);
                            console.log(`   Average error: $${avgError.toFixed(2)}\n`);
                        }
                    }
                }
            }
        }
    }
    
    console.log(`\n🏆 BEST LINEAR FORMULA FOUND:`);
    console.log(`============================`);
    console.log(`Formula: ${bestFormula.formula}`);
    console.log(`Exact matches: ${bestFormula.exactMatches} (${(bestFormula.exactMatches/testData.length*100).toFixed(1)}%)`);
    console.log(`Average error: $${bestFormula.avgError.toFixed(2)}`);
    
    if (bestFormula.exactMatches > 0) {
        console.log('\n✅ BREAKTHROUGH! Found exact matches');
        showExactMatches(testData, bestFormula.formula);
    } else {
        console.log('\n❌ No exact matches found with linear formulas');
        console.log('💡 The system likely uses:');
        console.log('   - Non-linear calculations');
        console.log('   - Lookup tables');
        console.log('   - Complex conditional logic');
        
        // Test a few specific patterns from our data
        console.log('\n🔍 Testing Specific Patterns from Data');
        console.log('=====================================');
        
        testSpecificPatterns(testData);
    }
}

function showExactMatches(testData: TestCase[], formulaStr: string) {
    console.log('\n🔍 Exact Match Cases:');
    console.log('=====================');
    
    // Parse formula to extract coefficients
    const parts = formulaStr.split(' + ');
    const base = parseFloat(parts[0]);
    const dayRate = parseFloat(parts[1].split('*')[0]);
    const mileRate = parseFloat(parts[2].split('*')[0]);
    const receiptRate = parseFloat(parts[3].split('*')[0]);
    
    const exactMatches: any[] = [];
    
    for (let i = 0; i < testData.length; i++) {
        const testCase = testData[i];
        const { trip_duration_days: days, miles_traveled: miles, total_receipts_amount: receipts } = testCase.input;
        const expected = testCase.expected_output;
        
        const calculated = base + days * dayRate + miles * mileRate + receipts * receiptRate;
        const error = Math.abs(calculated - expected);
        
        if (error < 0.01) {
            exactMatches.push({
                id: i + 1,
                days,
                miles,
                receipts,
                expected,
                calculated
            });
        }
    }
    
    exactMatches.forEach(match => {
        console.log(`Case ${match.id}: ${match.days}d, ${match.miles}mi, $${match.receipts.toFixed(2)} → $${match.expected.toFixed(2)}`);
    });
    
    console.log(`\n🎯 Pattern Analysis:`);
    const dayGroups = new Map<number, number>();
    exactMatches.forEach(m => {
        dayGroups.set(m.days, (dayGroups.get(m.days) || 0) + 1);
    });
    
    console.log('Exact matches by trip duration:');
    for (const [days, count] of Array.from(dayGroups.entries()).sort((a, b) => a[0] - b[0])) {
        console.log(`  ${days}-day trips: ${count} matches`);
    }
}

function testSpecificPatterns(testData: TestCase[]) {
    // Test patterns we observed in the data
    const patterns = [
        { name: 'High day rate, low mile/receipt', base: 0, day: 300, mile: 0.2, receipt: 0.1 },
        { name: 'Medium balanced', base: 100, day: 150, mile: 0.5, receipt: 0.3 },
        { name: 'Low day, high mile', base: 0, day: 100, mile: 1.5, receipt: 0.2 },
        { name: 'Polynomial-inspired', base: 456, day: 26, mile: 0.19, receipt: 0.28 },
    ];
    
    for (const pattern of patterns) {
        let exactMatches = 0;
        let totalError = 0;
        
        for (const testCase of testData) {
            const { trip_duration_days: days, miles_traveled: miles, total_receipts_amount: receipts } = testCase.input;
            const expected = testCase.expected_output;
            
            const calculated = pattern.base + days * pattern.day + miles * pattern.mile + receipts * pattern.receipt;
            const error = Math.abs(calculated - expected);
            
            totalError += error;
            if (error < 0.01) exactMatches++;
        }
        
        const avgError = totalError / testData.length;
        console.log(`${pattern.name}: ${exactMatches} exact matches, $${avgError.toFixed(2)} avg error`);
    }
}

if (require.main === module) {
    decomposeFormula();
} 