#!/usr/bin/env python3

"""
DEPRECATED: This script has been migrated to TypeScript.
See src/analysis.ts for the current implementation.
"""

import json
import statistics
from collections import defaultdict

def detailed_analysis():
    # Load the data
    with open('public_cases.json', 'r') as f:
        data = json.load(f)
    
    print("=== MILEAGE TIER ANALYSIS ===")
    # Look at 1-day trips to understand mileage calculation
    one_day = [case for case in data if case['input']['trip_duration_days'] == 1]
    
    # Sort by mileage to see the pattern
    one_day.sort(key=lambda x: x['input']['miles_traveled'])
    
    print("Miles -> Output (1-day trips, sorted by mileage)")
    for case in one_day[:20]:  # First 20 to see the pattern
        inp = case['input']
        output = case['expected_output']
        print(f"Miles: {int(inp['miles_traveled']):3d}, Receipts: ${inp['total_receipts_amount']:6.2f}, Output: ${output:7.2f}")
    
    print("\n=== RECEIPT IMPACT ANALYSIS ===")
    # Look at trips with similar days/miles but different receipts
    print("Looking for cases with similar trip parameters but different receipts...")
    
    # Group by (days, miles rounded to nearest 50) to find similar trips
    similar_trips = defaultdict(list)
    for case in data:
        days = case['input']['trip_duration_days']
        miles_bucket = round(case['input']['miles_traveled'] / 50) * 50
        key = (days, miles_bucket)
        similar_trips[key].append(case)
    
    # Find groups with multiple cases
    for key, cases in similar_trips.items():
        if len(cases) >= 3 and key[0] <= 5:  # Focus on shorter trips with multiple examples
            days, miles_bucket = key
            print(f"\n{days} days, ~{miles_bucket} miles:")
            cases.sort(key=lambda x: x['input']['total_receipts_amount'])
            for case in cases:
                inp = case['input']
                output = case['expected_output']
                print(f"  Miles: {int(inp['miles_traveled']):3d}, Receipts: ${inp['total_receipts_amount']:7.2f}, Output: ${output:7.2f}")
    
    print("\n=== EFFICIENCY BONUS ANALYSIS ===")
    # Look for efficiency patterns (miles per day)
    efficiency_data = []
    for case in data:
        inp = case['input']
        efficiency = inp['miles_traveled'] / inp['trip_duration_days']
        efficiency_data.append((efficiency, case))
    
    # Group by efficiency ranges
    efficiency_buckets = defaultdict(list)
    for eff, case in efficiency_data:
        bucket = round(eff / 25) * 25  # Round to nearest 25
        efficiency_buckets[bucket].append((eff, case))
    
    print("Efficiency (miles/day) vs Average Output per Day")
    for bucket in sorted(efficiency_buckets.keys()):
        if len(efficiency_buckets[bucket]) >= 5:  # Only buckets with enough data
            cases = efficiency_buckets[bucket]
            avg_output_per_day = statistics.mean([case['expected_output'] / case['input']['trip_duration_days'] for _, case in cases])
            print(f"{bucket:3d} mi/day: {len(cases):3d} cases, avg ${avg_output_per_day:.2f}/day")
    
    print("\n=== 5-DAY TRIP DETAILED ANALYSIS ===")
    five_day = [case for case in data if case['input']['trip_duration_days'] == 5]
    print("Looking for the 5-day bonus pattern...")
    
    # Sort by efficiency
    five_day.sort(key=lambda x: x['input']['miles_traveled'] / 5)
    
    for case in five_day[:15]:
        inp = case['input']
        output = case['expected_output']
        efficiency = inp['miles_traveled'] / 5
        receipts_per_day = inp['total_receipts_amount'] / 5
        print(f"Miles: {int(inp['miles_traveled']):3d} ({efficiency:5.1f}/day), Receipts: ${inp['total_receipts_amount']:7.2f} (${receipts_per_day:5.2f}/day), Output: ${output:7.2f}")

if __name__ == "__main__":
    detailed_analysis() 