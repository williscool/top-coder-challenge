import {CalculationParameters} from '../constants';

/**
 * Calculate efficiency bonus based on miles per day ratio
 * Formula: base_calculation * efficiency_multiplier
 */
export function calculateEfficiencyBonus(
  miles: number,
  days: number,
  baseAmount: number,
  parameters: CalculationParameters,
): number {
  if (days === 0) return 0;

  // Calculate efficiency (miles per day)
  const efficiency = miles / days;

  // Find the appropriate multiplier
  let multiplier = 1.0; // default no bonus

  for (const tier of parameters.efficiencyBonusRates) {
    if (efficiency >= tier.min && efficiency <= tier.max) {
      multiplier = tier.multiplier;
      break;
    }
  }

  // Apply the efficiency multiplier to the base amount
  const bonusAmount = baseAmount * (multiplier - 1.0);

  return bonusAmount;
}

/**
 * Get the efficiency category for analysis
 */
export function getEfficiencyCategory(miles: number, days: number): string {
  if (days === 0) return 'Invalid';

  const efficiency = miles / days;

  if (efficiency <= 25) return 'Low efficiency (no bonus)';
  if (efficiency <= 50) return 'Slight bonus';
  if (efficiency <= 100) return 'Good efficiency';
  if (efficiency <= 180) return 'Very good efficiency';
  if (efficiency <= 220) return "Kevin's sweet spot (maximum bonus)";
  if (efficiency <= 275) return 'Diminishing returns';
  return 'Excessive travel (penalty)';
}

/**
 * Get the efficiency multiplier for given miles and days
 */
export function getEfficiencyMultiplier(
  miles: number,
  days: number,
  parameters: CalculationParameters,
): number {
  if (days === 0) return 1.0;

  const efficiency = miles / days;

  for (const tier of parameters.efficiencyBonusRates) {
    if (efficiency >= tier.min && efficiency <= tier.max) {
      return tier.multiplier;
    }
  }

  return 1.0; // default
}

/**
 * Check if the trip falls in Kevin's identified sweet spot
 */
export function isInKevinsSweetSpot(miles: number, days: number): boolean {
  if (days === 0) return false;

  const efficiency = miles / days;
  return efficiency >= 180 && efficiency <= 220;
}
