# Contract Deployment Guide

This guide explains how to deploy your Open Treasury contracts to testnets and mainnets.

## Prerequisites

1. **Node.js** and **npm** installed
2. **Testnet ETH** for gas fees (get from faucets)
3. **Infura/Alchemy API key** for network access
4. **Wallet with private key** (MetaMask, etc.)

## Setup

### 1. Install Dependencies

```bash
cd lib/contracts
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your values:

```bash
# Get from https://infura.io/
INFURA_API_KEY=your_infura_api_key_here

# Your wallet private key (NEVER commit this!)
PRIVATE_KEY=your_private_key_without_0x_prefix

# For contract verification (optional)
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

## Deployment Options

### Deploy All Contracts

```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia

# Deploy to Goerli testnet
npm run deploy:goerli

# Deploy to Polygon Mumbai
npm run deploy:mumbai
```

### Deploy Individual Contracts

```bash
# Deploy only TreasuryToken
npm run deploy:token

# Deploy only TreasuryVault (requires TreasuryToken)
npm run deploy:vault

# Deploy only BuyBack contract
npm run deploy:buyback

# Deploy only Crowdsale contract
npm run deploy:crowdsale

# Deploy only Lending contract
npm run deploy:lending

# Deploy only JoinPool contract
npm run deploy:joinpool
```

### Custom Deployment

```bash
# Deploy specific contracts to specific network
npx hardhat run scripts/deploy.js --network sepolia TreasuryToken TreasuryVault BuyBack
```

## Deployment Order

Contracts must be deployed in this order due to dependencies:

1. **TreasuryToken** - ERC20 token contract
2. **TreasuryVault** - Main vault contract (requires TreasuryToken)
3. **Policy Contracts** - BuyBack, Crowdsale, Lending, JoinPool (all require TreasuryVault + TreasuryToken)

## Testnet Faucets

- **Sepolia**: <https://sepoliafaucet.com/>
- **Goerli**: <https://goerlifaucet.com/>
- **Mumbai**: <https://faucet.polygon.technology/>

## Deployment Output

After deployment, addresses are saved to `deployments.json`:

```json
{
  "network": "sepolia",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "contracts": {
    "TreasuryToken": "0x...",
    "TreasuryVault": "0x...",
    "BuyBack": "0x...",
    "Crowdsale": "0x...",
    "Lending": "0x...",
    "JoinPool": "0x..."
  }
}
```

## Contract Verification (Optional)

Verify contracts on block explorers:

```bash
# Verify TreasuryToken on Sepolia
npx hardhat verify --network sepolia 0xTOKEN_ADDRESS "Open Treasury Token" "OTT"

# Verify TreasuryVault on Sepolia
npx hardhat verify --network sepolia 0xVAULT_ADDRESS "Open Treasury Vault" 0xTOKEN_ADDRESS "OTV" "OTV"
```

## Security Notes

- **Never commit** your `.env` file or private keys
- **Test thoroughly** on testnets before mainnet deployment
- **Use hardware wallets** for mainnet deployments
- **Backup deployment addresses** for your frontend configuration

## Troubleshooting

### Common Issues

1. **"insufficient funds"** - Get testnet ETH from faucets
2. **"network not found"** - Check your `.env` INFURA_API_KEY
3. **"invalid private key"** - Remove 0x prefix from PRIVATE_KEY
4. **"contract verification failed"** - Check constructor arguments match exactly

### Gas Estimation Issues

- Increase gas price in `hardhat.config.js`
- Try different testnet (Sepolia is usually faster than Goerli)

## Mainnet Deployment

⚠️ **Use with extreme caution!**

For mainnet deployment, uncomment the mainnet networks in `hardhat.config.js` and use:

```bash
npx hardhat run scripts/deploy.js --network ethereum
npx hardhat run scripts/deploy.js --network polygon
```

Mainnet deployments require real ETH and cannot be undone!
