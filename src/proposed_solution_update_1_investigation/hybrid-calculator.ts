export class HybridReimbursementCalculator {
    calculateReimbursement(days: number, miles: number, receipts: number): number {
        // Base linear formula discovered: 100 + 50*days + 0.6*miles + 0.3*receipts
        let reimbursement = 100 + (days * 50) + (miles * 0.6) + (receipts * 0.3);
        
        // Apply context-dependent adjustments based on patterns
        reimbursement = this.applyDayAdjustments(reimbursement, days, miles, receipts);
        reimbursement = this.applyMileageAdjustments(reimbursement, days, miles, receipts);
        reimbursement = this.applyReceiptAdjustments(reimbursement, days, miles, receipts);
        reimbursement = this.applyEfficiencyAdjustments(reimbursement, days, miles, receipts);
        
        return Math.round(reimbursement * 100) / 100;
    }
    
    private applyDayAdjustments(amount: number, days: number, miles: number, receipts: number): number {
        // Pattern: Single-day trips often have different rates
        if (days === 1) {
            // High-mileage single day trips get significant bonus
            if (miles > 500) {
                amount *= 1.8; // Large single-day trip bonus
            } else if (miles > 200) {
                amount *= 1.4; // Medium single-day trip bonus
            } else {
                amount *= 1.2; // Small single-day trip bonus
            }
        }
        
        // Pattern: Very long trips have diminishing day rates
        if (days >= 10) {
            // Reduce the per-day component for very long trips
            const dayComponent = days * 50;
            const adjustedDayComponent = dayComponent * 0.7; // 30% reduction
            amount = amount - dayComponent + adjustedDayComponent;
        }
        
        // Pattern: Weekend patterns (3, 7, 14 day trips might have different rules)
        if (days === 3 || days === 7 || days === 14) {
            amount *= 1.1; // Small weekend bonus
        }
        
        return amount;
    }
    
    private applyMileageAdjustments(amount: number, days: number, miles: number, receipts: number): number {
        const milesPerDay = miles / days;
        
        // Pattern: Very high daily mileage gets different treatment
        if (milesPerDay > 300) {
            // Replace linear mile component with bracket system for high-mileage days
            const baseMileComponent = miles * 0.6;
            const bracketComponent = this.calculateMileageBrackets(miles);
            amount = amount - baseMileComponent + bracketComponent;
        }
        
        // Pattern: Very low mileage might have minimum guarantees
        if (milesPerDay < 20) {
            const minimumMileageBonus = days * 30; // $30/day minimum mileage value
            amount += minimumMileageBonus;
        }
        
        return amount;
    }
    
    private calculateMileageBrackets(miles: number): number {
        // Bracket system for high-mileage cases
        let mileageReimbursement = 0;
        
        if (miles <= 100) {
            mileageReimbursement = miles * 2.0;
        } else if (miles <= 300) {
            mileageReimbursement = 100 * 2.0 + (miles - 100) * 1.2;
        } else if (miles <= 600) {
            mileageReimbursement = 100 * 2.0 + 200 * 1.2 + (miles - 300) * 0.8;
        } else {
            mileageReimbursement = 100 * 2.0 + 200 * 1.2 + 300 * 0.8 + (miles - 600) * 0.5;
        }
        
        return mileageReimbursement;
    }
    
    private applyReceiptAdjustments(amount: number, days: number, miles: number, receipts: number): number {
        const receiptsPerDay = receipts / days;
        
        // Pattern: Very low receipts get higher multiplier
        if (receipts < 20) {
            const baseReceiptComponent = receipts * 0.3;
            const adjustedReceiptComponent = receipts * 2.0; // Much higher multiplier for low receipts
            amount = amount - baseReceiptComponent + adjustedReceiptComponent;
        }
        
        // Pattern: Very high receipts get diminishing returns
        if (receiptsPerDay > 200) {
            const baseReceiptComponent = receipts * 0.3;
            const adjustedReceiptComponent = receipts * 0.15; // Lower multiplier for high receipts
            amount = amount - baseReceiptComponent + adjustedReceiptComponent;
        }
        
        // Pattern: Medium receipts in specific ranges might get bonuses
        if (receipts >= 100 && receipts <= 500) {
            amount *= 1.05; // Small bonus for reasonable receipt amounts
        }
        
        return amount;
    }
    
    private applyEfficiencyAdjustments(amount: number, days: number, miles: number, receipts: number): number {
        const milesPerDay = miles / days;
        const receiptsPerDay = receipts / days;
        
        // Efficiency scoring based on balanced ratios
        let efficiencyMultiplier = 1.0;
        
        // Sweet spot for miles per day (moderate travel)
        if (milesPerDay >= 80 && milesPerDay <= 150) {
            efficiencyMultiplier *= 1.15;
        }
        
        // Sweet spot for receipts per day (reasonable expenses)
        if (receiptsPerDay >= 30 && receiptsPerDay <= 100) {
            efficiencyMultiplier *= 1.1;
        }
        
        // Penalty for very unbalanced trips
        if (milesPerDay > 400 && receiptsPerDay < 20) {
            efficiencyMultiplier *= 0.8; // High travel, low expenses - unusual
        }
        
        if (milesPerDay < 30 && receiptsPerDay > 200) {
            efficiencyMultiplier *= 0.85; // Low travel, high expenses - unusual
        }
        
        // Bonus for what seems like efficient business travel
        const efficiency = (milesPerDay * 0.3 + receiptsPerDay * 0.1) / days;
        if (efficiency >= 25 && efficiency <= 50) {
            efficiencyMultiplier *= 1.08; // Good efficiency bonus
        }
        
        return amount * efficiencyMultiplier;
    }
}

// Test helper function
export function testHybridCalculator() {
    const calculator = new HybridReimbursementCalculator();
    
    // Test the two known exact matches
    console.log('🧪 Testing Known Exact Matches:');
    console.log('===============================');
    
    // Case 70: 7d, 748mi, $241.73 → $971.31
    const result1 = calculator.calculateReimbursement(7, 748, 241.73);
    console.log(`Case 70: Expected $971.31, Got $${result1.toFixed(2)}, Error: $${Math.abs(result1 - 971.31).toFixed(2)}`);
    
    // Case 497: 3d, 1187mi, $1632.14 → $1451.85
    const result2 = calculator.calculateReimbursement(3, 1187, 1632.14);
    console.log(`Case 497: Expected $1451.85, Got $${result2.toFixed(2)}, Error: $${Math.abs(result2 - 1451.85).toFixed(2)}`);
    
    console.log('\n🔍 Testing Additional Cases:');
    console.log('============================');
    
    // Test some varied cases
    const testCases = [
        { days: 1, miles: 100, receipts: 50, desc: 'Short single-day trip' },
        { days: 1, miles: 800, receipts: 200, desc: 'Long single-day trip' },
        { days: 5, miles: 300, receipts: 600, desc: 'Medium business trip' },
        { days: 10, miles: 200, receipts: 1000, desc: 'Long low-mileage trip' },
        { days: 3, miles: 500, receipts: 100, desc: 'High-efficiency trip' }
    ];
    
    testCases.forEach(test => {
        const result = calculator.calculateReimbursement(test.days, test.miles, test.receipts);
        console.log(`${test.desc}: ${test.days}d, ${test.miles}mi, $${test.receipts} → $${result.toFixed(2)}`);
    });
}

// Export for CLI usage
export { HybridReimbursementCalculator as ReimbursementCalculator }; 