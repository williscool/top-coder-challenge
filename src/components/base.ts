import {CalculationParameters} from '../constants';

/**
 * Calculate the base component of reimbursement
 * Formula: base_rate_per_day * trip_duration_days * duration_multiplier
 */
export function calculateBaseComponent(
  days: number,
  parameters: CalculationParameters,
): number {
  // Determine duration category for multiplier lookup
  let durationKey: string;
  if (days === 1) {
    durationKey = '1';
  } else if (days >= 2 && days <= 4) {
    durationKey = days.toString();
  } else if (days === 5) {
    durationKey = '5';
  } else if (days >= 6 && days <= 7) {
    durationKey = days.toString();
  } else {
    durationKey = '8+';
  }

  // Get the appropriate multiplier
  const multiplier =
    parameters.durationMultipliers[durationKey] ||
    parameters.durationMultipliers['8+'];

  // Calculate base component
  const baseComponent = parameters.baseRatePerDay * days * multiplier;

  return baseComponent;
}

/**
 * Get the duration category for a given number of days
 */
export function getDurationCategory(days: number): string {
  if (days === 1) return '1-day';
  if (days >= 2 && days <= 4) return '2-4 days';
  if (days === 5) return '5-day special';
  if (days >= 6 && days <= 7) return '6-7 days';
  return '8+ days (penalty)';
}
