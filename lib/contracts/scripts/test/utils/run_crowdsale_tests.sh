#!/bin/bash

# Run Hardhat tests for Crowdsale and save output to utils/crowdsale_test_results.txt
npx hardhat test scripts/test/crowdsale.test.js > scripts/test/utils/crowdsale_test_results.txt 2>&1

echo "Crowdsale test results saved to scripts/test/utils/crowdsale_test_results.txt"
