#!/bin/bash

# Run Hardhat tests for Lending and save output to utils/lending_test_results.txt
npx hardhat test scripts/test/lending.test.js > scripts/test/utils/lending_test_results.txt 2>&1

echo "Lending test results saved to scripts/test/utils/lending_test_results.txt"
