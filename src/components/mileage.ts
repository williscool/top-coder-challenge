import {CalculationParameters} from '../constants';

/**
 * Calculate the mileage component using tiered rates
 * Formula: Σ(miles_in_tier * tier_rate)
 */
export function calculateMileageComponent(
  miles: number,
  parameters: CalculationParameters,
): number {
  let mileageComponent = 0;
  let remainingMiles = miles;

  // Process each tier in order
  for (const tier of parameters.mileageTierRates) {
    if (remainingMiles <= 0) break;

    // Calculate miles in this tier
    const maxMilesInTier =
      tier.max === Infinity
        ? remainingMiles
        : Math.min(remainingMiles, tier.max - tier.min + 1);

    const milesInTier = Math.min(remainingMiles, maxMilesInTier);

    // Add cost for this tier
    mileageComponent += milesInTier * tier.rate;

    // Reduce remaining miles
    remainingMiles -= milesInTier;
  }

  return mileageComponent;
}

/**
 * Get the effective mileage rate for a given total miles
 * (for analysis purposes)
 */
export function getEffectiveMileageRate(
  miles: number,
  parameters: CalculationParameters,
): number {
  if (miles === 0) return 0;

  const totalMileageCost = calculateMileageComponent(miles, parameters);
  return totalMileageCost / miles;
}

/**
 * Get breakdown of mileage calculation by tier
 */
export function getMileageBreakdown(
  miles: number,
  parameters: CalculationParameters,
): Array<{tier: number; miles: number; rate: number; cost: number}> {
  const breakdown: Array<{
    tier: number;
    miles: number;
    rate: number;
    cost: number;
  }> = [];
  let remainingMiles = miles;
  let tierIndex = 0;

  for (const tier of parameters.mileageTierRates) {
    if (remainingMiles <= 0) break;

    const maxMilesInTier =
      tier.max === Infinity
        ? remainingMiles
        : Math.min(remainingMiles, tier.max - tier.min + 1);

    const milesInTier = Math.min(remainingMiles, maxMilesInTier);
    const cost = milesInTier * tier.rate;

    breakdown.push({
      tier: tierIndex + 1,
      miles: milesInTier,
      rate: tier.rate,
      cost: cost,
    });

    remainingMiles -= milesInTier;
    tierIndex++;
  }

  return breakdown;
}
