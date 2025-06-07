import {CalculationParameters} from '../constants';

/**
 * Apply special bonuses and modifiers
 */
export function applySpecialBonuses(
  amount: number,
  days: number,
  miles: number,
  receipts: number,
  parameters: CalculationParameters,
): number {
  let finalAmount = amount;

  // Apply 5-day trip bonus - Lisa's consistent observation
  if (days === 5) {
    const fiveDayBonus = calculateFiveDayBonus(miles, receipts, parameters);
    finalAmount += fiveDayBonus;
  }

  // Apply long trip penalty for 8+ days
  if (days >= 8) {
    const penalty = amount * parameters.specialBonuses.longTripPenalty;
    finalAmount -= penalty;
  }

  return finalAmount;
}

/**
 * Calculate the 5-day trip bonus based on efficiency and other factors
 */
function calculateFiveDayBonus(
  miles: number,
  receipts: number,
  parameters: CalculationParameters,
): number {
  let bonus = parameters.specialBonuses.fiveDayBonus;

  // Efficiency affects the bonus amount
  const efficiency = miles / 5;

  if (efficiency >= 180 && efficiency <= 220) {
    // Kevin's sweet spot gets maximum bonus
    bonus *= 1.5;
  } else if (efficiency >= 100 && efficiency < 180) {
    // Good efficiency gets standard bonus
    bonus *= 1.0;
  } else if (efficiency < 100) {
    // Low efficiency gets reduced bonus
    bonus *= 0.7;
  } else {
    // Very high efficiency gets moderate bonus
    bonus *= 1.2;
  }

  // Receipt amount also affects bonus
  if (receipts >= 600 && receipts <= 800) {
    // Lisa's optimal range gets additional bonus
    bonus *= 1.2;
  } else if (receipts < 200) {
    // Low receipts reduce bonus
    bonus *= 0.8;
  }

  return bonus;
}

/**
 * Apply duration-specific modifiers that aren't captured in base calculation
 */
export function applyDurationModifiers(amount: number, days: number): number {
  let modifiedAmount = amount;

  // Weekend overlap bonus (implied from patterns)
  // This is speculative based on some patterns in the data
  if (days >= 2 && days <= 4) {
    // Short multi-day trips might get a small weekend bonus
    const weekendBonus = amount * 0.05; // 5% bonus
    modifiedAmount += weekendBonus;
  }

  return modifiedAmount;
}

/**
 * Check if trip qualifies for 5-day bonus
 */
export function qualifiesForFiveDayBonus(days: number): boolean {
  return days === 5;
}

/**
 * Check if trip gets long trip penalty
 */
export function hasLongTripPenalty(days: number): boolean {
  return days >= 8;
}

/**
 * Get a description of applied modifiers
 */
export function getModifierDescription(days: number, miles: number): string[] {
  const modifiers: string[] = [];

  if (days === 5) {
    modifiers.push("5-day trip bonus (Lisa's observation)");
  }

  if (days >= 8) {
    modifiers.push('Long trip penalty (8+ days)');
  }

  if (days >= 2 && days <= 4) {
    modifiers.push('Short multi-day bonus');
  }

  const efficiency = miles / days;
  if (efficiency >= 180 && efficiency <= 220 && days === 5) {
    modifiers.push("Enhanced 5-day bonus (Kevin's sweet spot)");
  }

  return modifiers;
}
