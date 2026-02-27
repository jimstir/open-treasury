#!/bin/bash

# Run Hardhat tests and save output to utils/test_results.txt
npx hardhat test scripts/test/treasuryVault.test.js > scripts/test/utils/test_results.txt 2>&1

echo "Test results saved to scripts/test/utils/test_results.txt"
