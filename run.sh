#!/bin/bash

# Black Box Challenge - Reimbursement Calculator Implementation
# This script takes three parameters and outputs the reimbursement amount
# Usage: ./run.sh <trip_duration_days> <miles_traveled> <total_receipts_amount>

set -e

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is required but not installed!"
    echo "Please install Node.js:"
    echo "  macOS: brew install node"
    echo "  Ubuntu/Debian: sudo apt-get install nodejs"
    exit 1
fi

# Check if yarn is available
if ! command -v yarn &> /dev/null; then
    echo "❌ Error: yarn is required but not installed!"
    echo "Please install yarn:"
    echo "  macOS: brew install yarn"
    echo "  Ubuntu/Debian: sudo apt-get install yarn"
    exit 1
fi

# Check if we have exactly 3 arguments
if [ $# -ne 3 ]; then
    echo "❌ Error: Exactly 3 arguments required" >&2
    echo "Usage: $0 <trip_duration_days> <miles_traveled> <total_receipts_amount>" >&2
    exit 1
fi

# Only install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    yarn
fi

# Use compiled JavaScript instead of ts-node for better performance
if [ -f "build/src/cli.js" ]; then
    node build/src/cli.js "$1" "$2" "$3"
else
    # Fallback to ts-node if compiled version doesn't exist
    yarn start "$1" "$2" "$3"
fi 