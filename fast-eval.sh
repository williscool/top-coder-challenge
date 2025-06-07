#!/bin/bash

# Fast Batch Evaluation Script
# This script runs all 1,000 test cases in a single Node.js process for maximum performance

set -e

echo "🚀 Fast Batch Evaluation - Reimbursement System"
echo "==============================================="
echo

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo "❌ Error: jq is required but not installed!"
    echo "Please install jq to parse JSON files:"
    echo "  macOS: brew install jq"  
    echo "  Ubuntu/Debian: sudo apt-get install jq"
    echo "  CentOS/RHEL: sudo yum install jq"
    exit 1
fi

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is required but not installed!"
    echo "Please install Node.js:"
    echo "  macOS: brew install node"
    echo "  Ubuntu/Debian: sudo apt-get install nodejs"
    exit 1
fi

# Check if public cases exist
if [ ! -f "public_cases.json" ]; then
    echo "❌ Error: public_cases.json not found!"
    echo "Please ensure the public cases file is in the current directory."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    yarn install
fi

# Compile TypeScript if needed
if [ ! -f "build/src/batch-eval.js" ] || [ "src/batch-eval.ts" -nt "build/src/batch-eval.js" ]; then
    echo "🔨 Compiling TypeScript..."
    yarn compile
fi

echo "⚡ Running batch evaluation (much faster than individual processes)..."
echo

# Run the batch evaluation using compiled JavaScript for maximum performance
if [ -f "build/src/batch-eval.js" ]; then
    node build/src/batch-eval.js
else
    # Fallback to ts-node if compiled version doesn't exist
    yarn ts-node src/batch-eval.ts
fi

echo
echo "🎉 Batch evaluation complete!"
echo
echo "💡 Performance comparison:"
echo "  • Original eval.sh: ~5-10 minutes (1,000 separate processes)"
echo "  • This script: ~5-10 seconds (single process)"
echo
echo "📝 Next steps:"
echo "  1. Use this script for fast iteration during development"
echo "  2. Use original eval.sh for final validation (if needed)"
echo "  3. Run './generate_results.sh' when ready to submit" 