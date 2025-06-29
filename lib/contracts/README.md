# Open Treasury Smart Contracts

This directory contains the smart contracts for the Open Treasury project.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Compile contracts:
   ```bash
   npx hardhat compile
   ```

3. Run tests:
   ```bash
   npx hardhat test
   ```

## Project Structure

- `/contracts` - Solidity smart contracts
- `/test` - Test files
- `/artifacts` - Compiled contracts (auto-generated)
- `/cache` - Build cache (auto-generated)

## Dependencies

- OpenZeppelin Contracts
- Hardhat (development)
- Hardhat Toolbox (testing and deployment utilities)
