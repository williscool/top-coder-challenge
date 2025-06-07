import { CalculationParameters } from '../constants';

/**
 * Calculate the receipt component with optimization curves
 * Formula: receipts * receipt_multiplier * receipt_efficiency_curve
 */
export function calculateReceiptComponent(
  receipts: number,
  days: number,
  parameters: CalculationParameters
): number {
  if (receipts === 0) return 0;

  // Find the appropriate multiplier based on receipt amount
  let multiplier = 0.25; // default
  
  for (const tier of parameters.receiptMultipliers) {
    if (receipts >= tier.min && receipts <= tier.max) {
      multiplier = tier.rate;
      break;
    }
  }

  // Apply penalty for very low receipts on multi-day trips
  // This captures the pattern where low receipts on longer trips get penalized
  if (days > 1 && receipts < 50) {
    multiplier *= 0.5; // Additional penalty
  }

  // Calculate base receipt component
  let receiptComponent = receipts * multiplier;

  // Apply diminishing returns for very high amounts
  if (receipts > 2000) {
    const excessAmount = receipts - 2000;
    receiptComponent = (2000 * multiplier) + (excessAmount * 0.1);
  }

  return receiptComponent;
}

/**
 * Get the receipt efficiency category
 */
export function getReceiptEfficiencyCategory(receipts: number): string {
  if (receipts <= 200) return 'Low (penalty)';
  if (receipts <= 600) return 'Standard';
  if (receipts <= 800) return 'Optimal (Lisa\'s sweet spot)';
  if (receipts <= 1500) return 'High (diminishing returns)';
  return 'Excessive (penalty)';
}

/**
 * Get the effective receipt rate for a given amount
 */
export function getEffectiveReceiptRate(
  receipts: number,
  days: number,
  parameters: CalculationParameters
): number {
  if (receipts === 0) return 0;
  
  const receiptComponent = calculateReceiptComponent(receipts, days, parameters);
  return receiptComponent / receipts;
} 