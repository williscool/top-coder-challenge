export interface CalculationParameters {
  baseRatePerDay: number;
  durationMultipliers: Record<string, number>;
  mileageTierRates: Array<{min: number; max: number; rate: number}>;
  receiptMultipliers: Array<{min: number; max: number; rate: number}>;
  efficiencyBonusRates: Array<{min: number; max: number; multiplier: number}>;
  specialBonuses: {
    fiveDayBonus: number;
    longTripPenalty: number;
  };
}

export const DEFAULT_PARAMETERS: CalculationParameters = {
  // Base rate foundation - identified from low-receipt, low-mileage cases
  baseRatePerDay: 100,

  // Duration multipliers based on per-day analysis from investigation
  durationMultipliers: {
    '1': 8.74, // Extremely high single-day rate
    '2': 5.23, // High short-trip rate
    '3': 3.37, // Stabilizing rate
    '4': 3.37, // Similar to 3-day
    '5': 2.55, // 5-day gets special bonus separately
    '6': 2.2, // Standard multi-day rate
    '7': 2.2, // Standard multi-day rate
    '8+': 1.8, // Penalty for long trips
  },

  // Tiered mileage rates - decreasing marginal value
  mileageTierRates: [
    {min: 0, max: 100, rate: 0.58}, // First 100 miles - full rate
    {min: 101, max: 300, rate: 0.45}, // Next 200 miles - reduced
    {min: 301, max: 500, rate: 0.32}, // Next 200 miles - further reduced
    {min: 501, max: Infinity, rate: 0.18}, // 500+ miles - minimal rate
  ],

  // Receipt optimization curves - Lisa's observation about $600-800 sweet spot
  receiptMultipliers: [
    {min: 0, max: 200, rate: 0.15}, // Penalty for low receipts on multi-day
    {min: 201, max: 600, rate: 0.25}, // Standard rate
    {min: 601, max: 800, rate: 0.35}, // Optimal range - Lisa's observation
    {min: 801, max: 1500, rate: 0.28}, // Diminishing returns
    {min: 1501, max: Infinity, rate: 0.18}, // Excessive spending penalty
  ],

  // Efficiency bonus rates - Kevin's sweet spot analysis
  efficiencyBonusRates: [
    {min: 0, max: 25, multiplier: 1.0}, // No bonus
    {min: 26, max: 50, multiplier: 1.1}, // Slight bonus
    {min: 51, max: 100, multiplier: 1.2}, // Good efficiency
    {min: 101, max: 180, multiplier: 1.4}, // Very good
    {min: 181, max: 220, multiplier: 1.8}, // Kevin's sweet spot
    {min: 221, max: 275, multiplier: 1.6}, // Diminishing returns
    {min: 276, max: Infinity, multiplier: 1.3}, // Excessive travel penalty
  ],

  // Special bonuses identified from patterns
  specialBonuses: {
    fiveDayBonus: 200, // 5-day trip bonus from Lisa's observation
    longTripPenalty: 0.1, // 10% penalty for 8+ day trips
  },
};
