# Proposed Solution Update 1: Algorithm Overhaul Required

## Executive Summary

**Performance Problem: SOLVED ✅**  
**Algorithm Problem: REQUIRES COMPLETE OVERHAUL ❌**

After implementing fast evaluation (5-10 seconds vs 5-10 minutes) and testing multiple approaches, we've discovered that our original algorithm assumptions were fundamentally incorrect. We're achieving **0% exact matches** with errors averaging **$1,000+**, indicating we need a completely different approach.

## Current Status

### ✅ Performance Achievements
- **Fast evaluation system**: `./fast-eval.sh` runs 1,000 test cases in 5-10 seconds
- **Optimized run.sh**: Eliminates repeated dependency installation
- **Batch processing**: Single Node.js process instead of 1,000 separate processes
- **Development workflow**: Rapid iteration now possible

### ❌ Algorithm Failures
- **Complex multi-component approach**: 0% exact matches, 3-5x overestimation
- **Simple data-driven approach**: 0% exact matches, still wrong ratios
- **Linear regression**: Massive underestimation (predicting $55 vs $784)

## Investigation Methodology

### Scripts Used for Analysis

To reach these conclusions, we developed several diagnostic scripts located in `src/proposed_solution_update_1_investigation/`:

#### 1. `diagnostic.ts` - Core Pattern Analysis
- **Purpose**: Analyzed all 1,000 public cases to extract real patterns
- **Method**: Grouped cases by duration, mileage ranges, and receipt ranges
- **Key Output**: Revealed actual per-day rates, mileage rates, and receipt multipliers
- **Usage**: `yarn ts-node src/proposed_solution_update_1_investigation/diagnostic.ts`

#### 2. `pattern-analysis.ts` - Deep Dive Investigation  
- **Purpose**: Examined specific cases to understand relationships
- **Method**: Analyzed simple cases, 1-day trips, and similar parameter combinations
- **Key Output**: Identified non-linear patterns and interaction effects
- **Usage**: `yarn ts-node src/proposed_solution_update_1_investigation/pattern-analysis.ts`

#### 3. `simple-calculator.ts` & `test-simple.ts` - Data-Driven Approach
- **Purpose**: Tested if using observed per-day rates directly would work
- **Method**: Applied diagnostic findings directly as calculation parameters
- **Result**: Still failed (0% exact matches) - revealed we were double-counting components
- **Key Insight**: Total per-day rates include ALL components, not just base rate

#### 4. `linear-calculator.ts` & `test-linear.ts` - Linear Regression Test
- **Purpose**: Tested if system follows simple linear model: `Output = a×days + b×miles + c×receipts + d`
- **Method**: Gradient descent with feature normalization
- **Result**: Complete failure - predicted $55 vs expected $784
- **Key Insight**: System is highly non-linear with complex business rules

### Investigation Timeline

1. **Started with complex multi-component algorithm** based on theoretical assumptions
2. **Performance testing revealed 5-10 minute evaluation times** - created fast evaluation system
3. **Algorithm testing showed 0% accuracy** - began diagnostic investigation  
4. **Diagnostic analysis (`diagnostic.ts`)** revealed our assumptions were completely wrong
5. **Pattern analysis (`pattern-analysis.ts`)** showed complex non-linear relationships
6. **Simple approach testing** confirmed component interaction issues
7. **Linear regression testing** proved system uses complex business logic, not simple math

### Reproducing the Investigation

All investigation scripts are preserved in `src/proposed_solution_update_1_investigation/` and can be run to verify findings:

```bash
# Core pattern analysis - reveals real rates and multipliers
yarn ts-node src/proposed_solution_update_1_investigation/diagnostic.ts

# Deep pattern examination - shows non-linear relationships  
yarn ts-node src/proposed_solution_update_1_investigation/pattern-analysis.ts

# Test data-driven approach - demonstrates double-counting issue
yarn ts-node src/proposed_solution_update_1_investigation/test-simple.ts

# Test linear regression - proves non-linear system
yarn ts-node src/proposed_solution_update_1_investigation/test-linear.ts
```

**Note**: These scripts formed the empirical basis for rejecting our original theoretical approach and adopting a data-driven strategy.

## Key Discoveries from Diagnostic Analysis

### Real Patterns vs. Our Assumptions

| Component | Our Assumption | Reality | Impact |
|-----------|---------------|---------|---------|
| **Base Rate** | $100/day × 8.74 multiplier | ~$120-873/day varying by duration | 8x overestimation |
| **Mileage Rates** | $0.58/mile decreasing | $19.70/mile for 0-100, $1.45/mile for 1000+ | Completely backwards |
| **Receipt Effect** | Complex curves with $600-800 sweet spot | 8.18x multiplier for low receipts, 0.82x for high | Opposite pattern |
| **Duration Scaling** | 5-day bonus, efficiency bonuses | 1-day = 2.59x higher than 3-day, 5-day lower than 3-day | No 5-day bonus |

### Specific Diagnostic Insights

**From `diagnostic.ts` analysis of 1,000 public cases:**

```
Duration Analysis (Real vs Expected):
• 1-day trips: $873.55/day (extremely high)
• 3-day trips: $336.85/day (standard)  
• 5-day trips: $254.52/day (PENALTY, not bonus!)
• 8+ day trips: $130-180/day (clear penalty)

Mileage Analysis (Real rates):
• 0-100 miles: $19.70/mile
• 101-300 miles: $5.38/mile
• 501-1000 miles: $1.94/mile
• 1000+ miles: $1.45/mile

Receipt Analysis (Real multipliers):
• $0-200: 8.18x multiplier (huge bonus for LOW receipts!)
• $1500+: 0.82x multiplier (penalty for high receipts)
```

**From `pattern-analysis.ts` specific case examination:**

```
Simple Cases (low miles + low receipts):
• 2d, 13mi, $4.67 → $203.52 ($101.76/day, $15.66/mile, 43.58x receipts)
• 1d, 55mi, $3.60 → $126.06 ($126.06/day, $2.29/mile, 35.02x receipts)

Complex Receipt Effect:
• 1d, 43mi, $2149.22 → $1134.47 (high receipts boost output massively)
• 1d, 47mi, $17.97 → $128.91 (low receipts keep output low)

Similar Trips, Different Durations:
• 1d, 276mi, $485.54 → $361.66
• 2d, 222mi, $456.24 → $437.40  
• 3d, 275mi, $543.74 → $572.73
• 4d, 205mi, $545.57 → $682.22
```

**From `test-simple.ts` and `test-linear.ts` failures:**

```
Simple Approach Results:
• Case 370: Expected $784.52, Got $3457.96, Error $2673.44
• Breakdown: Duration=$1217.96, Mileage=$1890, Receipt=$350
• Problem: Double-counting - per-day rates already include mileage/receipt effects

Linear Regression Results:  
• Final coefficients: 3.1721×days + 0.0300×miles + 0.0222×receipts + -1.2603
• Case 370: Expected $784.52, Got $55.58, Error $728.94
• Problem: Massive underestimation suggests non-linear/rule-based system
```

## Root Cause Analysis

### Why Our Approaches Failed

1. **Complex Algorithm**: Built on incorrect assumptions about component interactions
2. **Simple Algorithm**: Used total per-day rates but then added components on top
3. **Linear Regression**: The system is clearly non-linear with complex business rules

### What This Suggests

The systematic investigation through multiple approaches revealed:

#### Evidence from `diagnostic.ts`:
- **Non-uniform scaling**: Per-day rates vary wildly by duration (1-day: $873, 8-day: $180)
- **Inverse receipt relationship**: Low receipts get huge multipliers, high receipts penalized
- **Complex mileage tiers**: Rates vary from $19.70/mile to $1.45/mile

#### Evidence from `pattern-analysis.ts`:  
- **Non-linear interactions**: Similar inputs produce vastly different outputs
- **Context sensitivity**: Same mileage/receipts behave differently based on duration
- **Receipt dominance**: Receipt amount has massive impact on final calculation

#### Evidence from failed approaches:
- **Simple calculator failure**: Double-counting components (per-day rates already include everything)
- **Linear regression failure**: Massive underestimation suggests rule-based system, not mathematical formula

**Conclusion**: The legacy system uses:
- **Lookup tables** or **decision matrices**
- **Piecewise functions** with different rules for different ranges
- **Interaction terms** (days × miles, days × receipts)
- **Business logic rules** rather than mathematical formulas

## Proposed Solution: Data-Driven Reconstruction

### Phase 1: Pattern Mapping (Immediate - 1-2 hours)

#### A. Polynomial Regression
Test if the system uses interaction terms:
```
Reimbursement = a₁×days + a₂×miles + a₃×receipts + 
                a₄×days² + a₅×miles² + a₆×receipts² +
                a₇×days×miles + a₈×days×receipts + a₉×miles×receipts + 
                a₁₀
```

#### B. Decision Tree Approach
Based on Kevin's "six calculation paths" comment:
```
if (days == 1) {
    // Path 1: Single-day calculation
} else if (days <= 4) {
    // Path 2: Short multi-day
} else if (days <= 7) {
    // Path 3: Standard multi-day
} // etc.
```

#### C. Range-Based Rules
Create lookup tables for each dimension:
```typescript
const dayRates = {
  1: 873.55, 2: 523.12, 3: 336.85, 4: 304.49, 5: 254.52,
  6: 227.75, 7: 217.35, 8: 180.33, // ... etc
};

const mileageRates = [
  {min: 0, max: 100, rate: 19.70},
  {min: 101, max: 300, rate: 5.38},
  // ... etc
];
```

### Phase 2: Systematic Testing (2-3 hours)

#### Testing Strategy
1. **Use fast evaluation** for rapid iteration
2. **Test each approach** in isolation
3. **Measure improvement** progressively
4. **Target metrics**: 
   - First goal: >10% exact matches
   - Second goal: >50% exact matches  
   - Final goal: >95% exact matches

#### Implementation Order
1. **Polynomial regression** (test if interaction terms help)
2. **Simple lookup tables** (test if it's just hardcoded values)
3. **Decision tree** (test if it's rule-based)
4. **Hybrid approach** (combine the best elements)

### Phase 3: Fine-Tuning (1-2 hours)

#### Parameter Optimization
- Use gradient descent or grid search on best-performing approach
- Focus on reducing average error and increasing exact matches
- Cross-validate to prevent overfitting

#### Validation
- Test on high-error cases identified by diagnostic
- Ensure robust performance across all input ranges
- Validate with both `./fast-eval.sh` and `./eval.sh`

## Immediate Action Plan

### Step 1: Quick Test (30 minutes)
```bash
# Test polynomial regression approach
yarn ts-node src/test-polynomial.ts
./fast-eval.sh
```

### Step 2: Range-Based Lookup (45 minutes)
```bash
# Test simple lookup table approach  
yarn ts-node src/test-lookup.ts
./fast-eval.sh
```

### Step 3: Decision Tree (45 minutes)
```bash
# Test rule-based approach
yarn ts-node src/test-decision-tree.ts
./fast-eval.sh
```

### Step 4: Best Approach Refinement (30 minutes)
- Optimize parameters of best-performing approach
- Final validation with `./eval.sh`

## Implementation Priorities

### High Priority (Must Try)
1. **Polynomial regression** - Test interaction terms (days×miles, etc.)
2. **Lookup table approach** - Direct mapping from diagnostic analysis
3. **Decision tree** - Based on Kevin's "six paths" insight

### Medium Priority (Try if Above Fails)
1. **Neural network** - If patterns are too complex for manual modeling
2. **Ensemble methods** - Combine multiple approaches
3. **Genetic algorithm** - Evolve optimal parameters

### Low Priority (Last Resort)
1. **Brute force parameter search** - Exhaustive grid search
2. **Manual case-by-case analysis** - If systematic approaches fail

## Success Metrics

### Minimum Viable Performance
- **>10% exact matches** (currently 0%)
- **<$500 average error** (currently $1,000+)
- **<$1,500 max error** (currently $2,700+)

### Target Performance  
- **>50% exact matches**
- **<$100 average error**
- **<$500 max error**

### Stretch Goal
- **>95% exact matches**
- **<$10 average error**  
- **<$100 max error**

## Tools & Resources

### Development Workflow
```bash
# Fast iteration cycle (5-10 seconds)
./fast-eval.sh

# Final validation (1-2 minutes)  
./eval.sh

# New approach testing
yarn ts-node src/test-[approach].ts
```

### Diagnostic Tools
- `src/proposed_solution_update_1_investigation/diagnostic.ts` - Pattern analysis (revealed real rates/multipliers)
- `src/proposed_solution_update_1_investigation/pattern-analysis.ts` - Specific case analysis (showed non-linear patterns)
- `src/proposed_solution_update_1_investigation/simple-calculator.ts` - Data-driven approach test (proved double-counting issue)
- `src/proposed_solution_update_1_investigation/linear-calculator.ts` - Linear regression test (proved non-linear system)
- `src/batch-eval.ts` - Fast batch processing (enables rapid iteration)

### Key Data Files
- `public_cases.json` - 1,000 training cases
- `INTERVIEWS.md` - Employee insights
- High-error cases: Cases 370, 912, 358, 267, 528

## Lessons Learned

### What NOT to Do
1. **Don't assume complex mathematical models** - Real system might be simpler
2. **Don't build on unvalidated assumptions** - Test each component individually
3. **Don't ignore the diagnostic data** - The real patterns are in the numbers

### What TO Do
1. **Start with the simplest approach that could work**
2. **Use fast evaluation for rapid iteration**
3. **Focus on understanding patterns, not theoretical elegance**
4. **Test frequently and measure progress**

## Next Steps

1. **Implement polynomial regression** approach first
2. **Use fast evaluation** for immediate feedback
3. **Iterate rapidly** through different approaches
4. **Document findings** and refine based on results
5. **Target first improvement within 2 hours**

---

**The foundation is now solid - fast evaluation works perfectly. Time to find the right algorithm through systematic experimentation.** 