# Proposed Solution V2 Scripts

This directory contains the scripts for the V2 investigation phase, which achieved the **first exact match** and **best overall performance** (14 close matches, $54.40 average error).

## Core Calculators

### Enhanced Polynomial Calculator
- **File**: `enhanced-polynomial-calculator.ts`
- **Strategy**: Advanced polynomial with business rule constraints
- **Achievement**: 🎯 **First exact match** (Case 127)
- **Performance**: 1 exact match, 6 close matches, $165.52 avg error
- **Key Innovation**: Receipt penalty system for high-receipt cases

### Balanced Polynomial Calculator  
- **File**: `balanced-polynomial-calculator.ts`
- **Strategy**: Conservative business rule corrections
- **Performance**: 0 exact matches, 7 close matches, $105.25 avg error
- **Approach**: Minimal corrections to preserve original polynomial strength

### Refined Polynomial Calculator
- **File**: `refined-polynomial-calculator.ts`
- **Strategy**: Moderate business rule enhancements
- **Performance**: 0 exact matches, 8 close matches, $146.50 avg error
- **Approach**: Middle ground between original and enhanced

### Ensemble Calculator
- **File**: `ensemble-calculator.ts`
- **Strategy**: Smart switching between Original and Enhanced
- **Performance**: 1 exact match, 10 close matches, $96.57 avg error
- **Method**: Use Enhanced for specific patterns, Original for stability

### K-Nearest Neighbors Calculator
- **File**: `knn-calculator.ts`
- **Strategy**: Similarity-based matching with business-aware metrics
- **Performance**: 🏆 **14 close matches** (best), $54.40 avg error (best)
- **Methods**: Standard KNN and Advanced KNN with pattern recognition

### Optimized KNN Calculator
- **File**: `optimized-knn.ts`
- **Strategy**: Multi-metric ensemble with larger neighborhoods
- **Performance**: 1 exact match, 10 close matches, $70.67 avg error
- **Methods**: Euclidean, Manhattan, business-aware, exact match bonus

## Test Scripts

### Enhanced vs Original Comparison
- **File**: `test-enhanced.ts`
- **Purpose**: Compare Enhanced Polynomial against Original
- **Usage**: `yarn ts-node src/proposed_solution_v2/test-enhanced.ts`

### Comprehensive Algorithm Comparison
- **File**: `test-all-approaches.ts`
- **Purpose**: Compare all 4 polynomial variants (Original, Enhanced, Refined, Balanced)
- **Usage**: `yarn ts-node src/proposed_solution_v2/test-all-approaches.ts`
- **Output**: Performance matrix with exact matches, close matches, avg error

### Ensemble Method Testing
- **File**: `test-ensemble.ts`
- **Purpose**: Test ensemble approach combining multiple calculators
- **Usage**: `yarn ts-node src/proposed_solution_v2/test-ensemble.ts`

### KNN Method Testing
- **File**: `test-knn.ts`
- **Purpose**: Compare Standard vs Advanced KNN approaches
- **Usage**: `yarn ts-node src/proposed_solution_v2/test-knn.ts`
- **Output**: Detailed similarity metrics and performance comparison

### Optimized KNN Testing
- **File**: `test-optimized-knn.ts`
- **Purpose**: Test multi-metric ensemble KNN approach
- **Usage**: `yarn ts-node src/proposed_solution_v2/test-optimized-knn.ts`

## Analysis Scripts

### Success Pattern Analysis
- **File**: `success-analysis.ts`
- **Purpose**: Analyze patterns in successful exact/close matches
- **Usage**: `yarn ts-node src/proposed_solution_v2/success-analysis.ts`
- **Output**: Detailed breakdown of successful cases, patterns, and insights

## Key Achievements

### Performance Comparison
| Calculator | Exact | Close | Avg Error | Score | Close % |
|------------|-------|-------|-----------|-------|---------|
| **Original** | 0 | 8 | $85.44 | 8643.64 | 0.8% |
| **Enhanced** | **1** ✅ | 6 | $165.52 | 16651.61 | 0.6% |
| **Balanced** | 0 | 7 | $105.25 | 10625.25 | 0.7% |
| **Ensemble** | 1 | 10 | $96.57 | 9757.17 | 1.0% |
| **🏆 Advanced KNN** | 0 | **14** | **$54.40** | **5539.69** | **1.4%** |
| **Optimized KNN** | 1 | 10 | $70.67 | 7167.26 | 1.0% |

### Breakthrough Moments
1. **First Exact Match**: Enhanced Polynomial achieved exact match on Case 127
2. **Best Close Match Rate**: Advanced KNN achieved 14 close matches (1.4%)
3. **Best Average Error**: Advanced KNN reduced error to $54.40 (36% improvement)

### Key Insights
- **Business rules beat pure math**: Enhanced polynomial with constraints found exact matches
- **Similarity-based approaches work**: KNN outperformed regression for business rule systems
- **Pattern-aware similarity crucial**: Advanced KNN significantly outperformed standard metrics
- **Conservative enhancements better**: Balanced approach often outperformed aggressive corrections

## Usage Examples

### Quick Performance Check
```bash
# Test current best performer
yarn ts-node src/proposed_solution_v2/test-knn.ts

# Compare all approaches
yarn ts-node src/proposed_solution_v2/test-all-approaches.ts
```

### Detailed Analysis
```bash
# Analyze successful patterns
yarn ts-node src/proposed_solution_v2/success-analysis.ts

# Test specific enhanced polynomial
yarn ts-node src/proposed_solution_v2/test-enhanced.ts
```

### Development Workflow
```bash
# Fast evaluation after changes
./fast-eval.sh

# Full validation
./eval.sh
```

## Next Steps

Based on V2 results, the next phase should focus on:

1. **Deploy Advanced KNN** - Update main system to use best performer
2. **Exact Match Pattern Analysis** - Deep dive into Case 127 success
3. **Hybrid Approach** - Combine Enhanced (exact matches) + Advanced KNN (close matches)
4. **Lookup Table Investigation** - System may use exact case matching
5. **Rule Mining** - Extract explicit business rules from successful cases

## Related Documentation

- **Main Documentation**: `docs/proposed_solution_update_v2.md`
- **V1 Investigation**: `src/proposed_solution_update_1_investigation/`
- **Original Approach**: `src/algorithm_approaches/` 