# Chainlink Automation Scripts

This directory contains scripts for managing Chainlink Automation upkeeps for the Open Treasury protocol.

## Prerequisites

1. Install dependencies:
   ```bash
   npm install @chainlink/contracts @nomiclabs/hardhat-ethers @nomiclabs/hardhat-waffle ethers hardhat
   ```

2. Configure your `.env` file with the following variables:
   ```
   PRIVATE_KEY=your_private_key
   RPC_URL=your_ethereum_node_url
   ```

## Scripts

### 1. Register Upkeep

Register a new Chainlink Automation upkeep for your contract.

**Usage:**
```bash
npx hardhat run scripts/chainlink/registerUpkeep.js --network <network-name>
```

**Example (Goerli testnet):**
```bash
npx hardhat run scripts/chainlink/registerUpkeep.js --network goerli
```

**Configuration:**
Update the following in `registerUpkeep.js` before running:
- `targetContract`: Address of your deployed JoinPool contract
- `gasLimit`: Gas limit for the upkeep execution
- `adminAddress`: Address that can manage the upkeep
- `linkAmount`: Amount of LINK to fund the upkeep with (in wei)

## How It Works

1. The script connects to the Chainlink Automation Registry contract on the specified network.
2. It registers a new upkeep for your target contract.
3. The upkeep will automatically call your contract's `checkUpkeep` function at regular intervals.
4. When `checkUpkeep` returns `true`, the Automation Network will call your `performUpkeep` function.

## Important Notes

1. Ensure your contract implements the `checkUpkeep` and `performUpkeep` functions as per Chainlink's requirements.
2. The contract must have a sufficient LINK balance to pay for upkeep execution.
3. Monitor your upkeeps at [Chainlink Automation App](https://automation.chain.link/).

## Troubleshooting

- **Insufficient LINK**: Fund your contract with LINK tokens.
- **Upkeep not performing**: Check if `checkUpkeep` is returning `true` under the expected conditions.
- **Gas limit too low**: Increase the gas limit if your `performUpkeep` function requires more gas.
