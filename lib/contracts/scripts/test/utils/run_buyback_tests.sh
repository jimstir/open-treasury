#!/bin/bash

# Run Hardhat tests for BuyBack and save output to utils/buyback_test_results.txt
npx hardhat test scripts/test/buyBack.test.js > scripts/test/utils/buyback_test_results.txt 2>&1

echo "BuyBack test results saved to scripts/test/utils/buyback_test_results.txt"
