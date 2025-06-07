export class RulesReimbursementCalculator {
    calculateReimbursement(days: number, miles: number, receipts: number): number {
        // Base day rate calculation using discovered patterns
        const baseDayRate = this.calculateBaseDayRate(days);
        
        // Mile rate with brackets (from diagnostic analysis)
        const mileReimbursement = this.calculateMileReimbursement(miles);
        
        // Receipt processing with discovered multipliers
        const receiptReimbursement = this.calculateReceiptReimbursement(receipts, days, miles);
        
        // Efficiency adjustments (high variation suggests efficiency factors)
        const efficiencyMultiplier = this.calculateEfficiencyMultiplier(days, miles, receipts);
        
        // Base calculation
        let reimbursement = baseDayRate * days + mileReimbursement + receiptReimbursement;
        
        // Apply efficiency adjustments
        reimbursement *= efficiencyMultiplier;
        
        // Apply final adjustments for specific patterns
        reimbursement = this.applyFinalAdjustments(reimbursement, days, miles, receipts);
        
        return Math.round(reimbursement * 100) / 100;
    }
    
    private calculateBaseDayRate(days: number): number {
        // Based on discovered average day rates
        if (days === 1) return 873.55;
        if (days === 2) return 523.12;
        if (days === 3) return 336.85;
        if (days === 4) return 304.49;
        if (days === 5) return 254.52;
        if (days === 6) return 227.75;
        if (days === 7) return 217.35;
        if (days === 8) return 180.33;
        if (days === 9) return 159.85;
        if (days === 10) return 149.61;
        if (days === 11) return 145.51;
        if (days === 12) return 134.62;
        if (days === 13) return 128.90;
        if (days === 14) return 121.93;
        
        // For longer trips, continue the decline
        return Math.max(100, 150 - (days - 10) * 5);
    }
    
    private calculateMileReimbursement(miles: number): number {
        // Based on diagnostic analysis - tiered mile rates
        if (miles <= 100) {
            return miles * 19.70;
        } else if (miles <= 200) {
            return 100 * 19.70 + (miles - 100) * 15.0;
        } else if (miles <= 500) {
            return 100 * 19.70 + 100 * 15.0 + (miles - 200) * 8.0;
        } else if (miles <= 1000) {
            return 100 * 19.70 + 100 * 15.0 + 300 * 8.0 + (miles - 500) * 3.0;
        } else {
            return 100 * 19.70 + 100 * 15.0 + 300 * 8.0 + 500 * 3.0 + (miles - 1000) * 1.45;
        }
    }
    
    private calculateReceiptReimbursement(receipts: number, days: number, miles: number): number {
        // Receipt processing with context-dependent multipliers
        let multiplier: number;
        
        // Low receipts get high multiplier (8.18x discovered)
        if (receipts < 50) {
            multiplier = 8.18;
        } else if (receipts < 200) {
            multiplier = 3.0;
        } else if (receipts < 500) {
            multiplier = 1.5;
        } else if (receipts < 1000) {
            multiplier = 0.95;
        } else {
            multiplier = 0.82; // High receipts penalty discovered
        }
        
        return receipts * multiplier;
    }
    
    private calculateEfficiencyMultiplier(days: number, miles: number, receipts: number): number {
        // Efficiency calculation based on miles per day
        const milesPerDay = miles / days;
        const receiptsPerDay = receipts / days;
        
        let efficiency = 1.0;
        
        // Good efficiency range (moderate miles per day)
        if (milesPerDay >= 50 && milesPerDay <= 200) {
            efficiency *= 1.1;
        } else if (milesPerDay < 20) {
            efficiency *= 0.9; // Low efficiency penalty
        } else if (milesPerDay > 300) {
            efficiency *= 0.95; // Very high mileage slight penalty
        }
        
        // Receipt efficiency  
        if (receiptsPerDay >= 10 && receiptsPerDay <= 100) {
            efficiency *= 1.05; // Reasonable receipt levels
        } else if (receiptsPerDay > 200) {
            efficiency *= 0.9; // High receipt penalty
        }
        
        // Trip type adjustments
        if (days === 1 && miles > 200) {
            efficiency *= 1.2; // Long single-day trips get bonus
        }
        
        if (days >= 10 && milesPerDay < 50) {
            efficiency *= 0.85; // Long low-activity trips penalized
        }
        
        return efficiency;
    }
    
    private applyFinalAdjustments(amount: number, days: number, miles: number, receipts: number): number {
        // Apply specific business rule adjustments
        
        // Minimum reimbursement thresholds
        const minimumPerDay = days <= 3 ? 100 : 80;
        amount = Math.max(amount, days * minimumPerDay);
        
        // Maximum caps for very high amounts
        if (days === 1 && amount > 2000) {
            amount = 2000;
        } else if (days <= 3 && amount > 2500) {
            amount = 2500;
        } else if (amount > 5000) {
            amount = 5000;
        }
        
        // Round to specific patterns found in data
        // 19.5% round to $0.05, so apply occasional rounding
        if (Math.random() < 0.195) {
            amount = Math.round(amount * 20) / 20; // Round to $0.05
        }
        
        return amount;
    }
}

// Export for testing
export { RulesReimbursementCalculator as ReimbursementCalculator }; 