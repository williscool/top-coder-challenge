#!/usr/bin/env python3

"""
DEPRECATED: This script has been migrated to TypeScript.
See src/analysis.ts for the current implementation.
"""

import json
import statistics

def analyze_data():
    # Load the data
    with open('public_cases.json', 'r') as f:
        data = json.load(f)
    
    print(f"Total cases: {len(data)}")
    
    # Group by trip duration
    by_days = {}
    for case in data:
        days = case['input']['trip_duration_days']
        if days not in by_days:
            by_days[days] = []
        by_days[days].append(case)
    
    print("\n=== PER-DAY ANALYSIS ===")
    for days in sorted(by_days.keys()):
        cases = by_days[days]
        outputs = [c['expected_output'] for c in cases]
        avg_output = statistics.mean(outputs)
        print(f"{days} days: {len(cases)} cases, avg output: ${avg_output:.2f}, avg per day: ${avg_output/days:.2f}")
        
        # Show a few examples
        if len(cases) <= 5:
            for case in cases:
                inp = case['input']
                print(f"  Days: {inp['trip_duration_days']}, Miles: {inp['miles_traveled']}, Receipts: ${inp['total_receipts_amount']:.2f}, Output: ${case['expected_output']:.2f}")
    
    print("\n=== 1-DAY TRIP ANALYSIS (looking for base + mileage pattern) ===")
    one_day_cases = by_days[1][:10]
    for case in one_day_cases:
        inp = case['input']
        output = case['expected_output']
        # Assume base ~$100, see what mileage rate would be
        remaining = output - 100
        rate_per_mile = remaining / inp['miles_traveled'] if inp['miles_traveled'] > 0 else 0
        print(f"Miles: {inp['miles_traveled']}, Receipts: ${inp['total_receipts_amount']:.2f}, Output: ${output:.2f}, Implied rate: ${rate_per_mile:.3f}/mile")
    
    print("\n=== 5-DAY TRIP ANALYSIS (looking for bonus pattern) ===")
    five_day_cases = by_days[5][:10]
    for case in five_day_cases:
        inp = case['input']
        output = case['expected_output']
        base_expected = 5 * 100  # 5 days * $100
        bonus = output - base_expected
        efficiency = inp['miles_traveled'] / inp['trip_duration_days']
        print(f"Miles: {inp['miles_traveled']}, Receipts: ${inp['total_receipts_amount']:.2f}, Output: ${output:.2f}, Bonus over base: ${bonus:.2f}, Efficiency: {efficiency:.1f} mi/day")

if __name__ == "__main__":
    analyze_data() 