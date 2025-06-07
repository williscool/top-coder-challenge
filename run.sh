#!/bin/bash

# Black Box Challenge - Reimbursement Calculator Implementation
# This script takes three parameters and outputs the reimbursement amount
# Usage: ./run.sh <trip_duration_days> <miles_traveled> <total_receipts_amount>

# Check if we have exactly 3 arguments
if [ $# -ne 3 ]; then
    echo "Error: Exactly 3 arguments required" >&2
    echo "Usage: $0 <trip_duration_days> <miles_traveled> <total_receipts_amount>" >&2
    exit 1
fi

# Run the TypeScript CLI directly with ts-node
# This calls our calculator implementation
npx ts-node src/cli.ts "$1" "$2" "$3" 