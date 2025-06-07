# Algorithm Approaches

This directory contains the various algorithm implementations we tested during the reimbursement calculator optimization process.

## Scripts

### Basic Polynomial Approach
- `polynomial-calculator.ts` - Simple polynomial regression with interaction terms
- `test-polynomial.ts` - Test script for the basic polynomial approach
- **Result**: $187.75 average error (82% improvement over original)

### Lookup Table Approach  
- `lookup-calculator.ts` - Data-driven lookup tables based on diagnostic findings
- `test-lookup.ts` - Test script for the lookup table approach
- **Result**: $1,031 average error (worse than polynomial due to double-counting)

### Decision Tree Approach
- `decision-tree-calculator.ts` - Six calculation paths based on trip duration
- `test-decision-tree.ts` - Test script for the decision tree approach  
- **Result**: $781 average error (worse than polynomial)

### Advanced Polynomial Approach (CURRENT)
- `test-advanced-polynomial.ts` - Test script for the advanced polynomial approach
- **Note**: The actual `advanced-polynomial-calculator.ts` remains in `src/` as it's the current production implementation
- **Result**: $85.44 average error (92% improvement over original)

## Usage

Each approach can be tested independently using its respective test script:

```bash
# Test basic polynomial
npx ts-node src/algorithm_approaches/test-polynomial.ts

# Test lookup table  
npx ts-node src/algorithm_approaches/test-lookup.ts

# Test decision tree
npx ts-node src/algorithm_approaches/test-decision-tree.ts

# Test advanced polynomial (current approach)
npx ts-node src/algorithm_approaches/test-advanced-polynomial.ts
```

## Performance Timeline

1. **Original Calculator**: $1,027.99 average error
2. **Basic Polynomial**: $187.75 average error (82% improvement)
3. **Lookup Tables**: $1,031 average error (regression)
4. **Decision Tree**: $781 average error (better than lookup, worse than polynomial)
5. **Advanced Polynomial**: $85.44 average error (92% improvement) - **CURRENT** 