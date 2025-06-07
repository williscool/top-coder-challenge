// Main exports for the Reimbursement Calculator System
export { ReimbursementCalculator, CalculationBreakdown } from './calculator';
export { CalculationParameters, DEFAULT_PARAMETERS } from './constants';

// Component exports
export { calculateBaseComponent, getDurationCategory } from './components/base';
export { calculateMileageComponent, getMileageBreakdown } from './components/mileage';
export { calculateReceiptComponent, getReceiptEfficiencyCategory } from './components/receipts';
export { calculateEfficiencyBonus, getEfficiencyCategory, isInKevinsSweetSpot } from './components/efficiency';
export { applySpecialBonuses, applyDurationModifiers, getModifierDescription } from './components/modifiers';

// Analysis tools
export { ReimbursementAnalyzer, ReimbursementCase } from './analysis';
