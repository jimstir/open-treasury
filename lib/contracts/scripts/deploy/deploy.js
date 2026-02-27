const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

// Deployment configuration
const DEPLOYMENTS_FILE = path.join(__dirname, '../deployments.json');

// Load existing deployments or create empty object
function loadDeployments() {
  try {
    const data = fs.readFileSync(DEPLOYMENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// Save deployments to file
function saveDeployments(deployments) {
  const network = network.name;
  const timestamp = new Date().toISOString();

  const deploymentData = {
    network,
    timestamp,
    contracts: deployments
  };

  // Create deployments directory if it doesn't exist
  const dir = path.dirname(DEPLOYMENTS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(DEPLOYMENTS_FILE, JSON.stringify(deploymentData, null, 2));
  console.log(`✅ Deployments saved to ${DEPLOYMENTS_FILE}`);
}

async function deployTreasuryToken(name = "Open Treasury Token", symbol = "OTT") {
  console.log(`🚀 Deploying TreasuryToken: ${name} (${symbol})`);

  const TreasuryToken = await ethers.getContractFactory("TreasuryToken");
  const treasuryToken = await TreasuryToken.deploy(name, symbol, ethers.parseEther("1000000")); // 1M initial supply
  await treasuryToken.waitForDeployment();

  const address = await treasuryToken.getAddress();
  console.log(`✅ TreasuryToken deployed to: ${address}`);

  return { contract: treasuryToken, address };
}

async function deployTreasuryVault(treasuryTokenAddress, name = "Open Treasury Vault", symbol = "OTV") {
  console.log(`🚀 Deploying TreasuryVault: ${name} (${symbol})`);

  const TreasuryVault = await ethers.getContractFactory("TreasuryVault");
  const treasuryVault = await TreasuryVault.deploy(
    name,
    treasuryTokenAddress,
    symbol,
    "OTV"
  );
  await treasuryVault.waitForDeployment();

  const address = await treasuryVault.getAddress();
  console.log(`✅ TreasuryVault deployed to: ${address}`);

  return { contract: treasuryVault, address };
}

async function deployBuyBack(treasuryVaultAddress, treasuryTokenAddress) {
  console.log(`🚀 Deploying BuyBack contract`);

  const BuyBack = await ethers.getContractFactory("BuyBack");
  
  // Get the treasury token contract instance
  const treasuryToken = await ethers.getContractAt("TreasuryToken", treasuryTokenAddress);
  
  const buyBack = await BuyBack.deploy(treasuryVaultAddress, treasuryToken);
  await buyBack.waitForDeployment();

  const address = await buyBack.getAddress();
  console.log(`✅ BuyBack deployed to: ${address}`);

  return { contract: buyBack, address };
}

async function deployCrowdsale(treasuryVaultAddress, treasuryTokenAddress) {
  console.log(`🚀 Deploying Crowdsale contract`);

  const Crowdsale = await ethers.getContractFactory("Crowdsale");
  
  // Get the treasury token contract instance
  const treasuryToken = await ethers.getContractAt("TreasuryToken", treasuryTokenAddress);
  
  const crowdsale = await Crowdsale.deploy(treasuryToken, treasuryVaultAddress, 100); // Default ratio of 100
  await crowdsale.waitForDeployment();

  const address = await crowdsale.getAddress();
  console.log(`✅ Crowdsale deployed to: ${address}`);

  return { contract: crowdsale, address };
}

async function deployLending(treasuryVaultAddress, treasuryTokenAddress) {
  console.log(`🚀 Deploying Lending contract`);

  const Lending = await ethers.getContractFactory("Lending");
  const lending = await Lending.deploy(treasuryVaultAddress, treasuryTokenAddress);
  await lending.waitForDeployment();

  const address = await lending.getAddress();
  console.log(`✅ Lending deployed to: ${address}`);

  return { contract: lending, address };
}

async function deployJoinPool(treasuryVaultAddress, treasuryTokenAddress) {
  console.log(`🚀 Deploying JoinPool contract`);

  const JoinPool = await ethers.getContractFactory("JoinPool");
  const joinPool = await JoinPool.deploy(treasuryVaultAddress, treasuryTokenAddress);
  await joinPool.waitForDeployment();

  const address = await joinPool.getAddress();
  console.log(`✅ JoinPool deployed to: ${address}`);

  return { contract: joinPool, address };
}

async function main() {
  const args = process.argv.slice(2);
  const deployments = loadDeployments();

  console.log(`🌐 Deploying to network: ${network.name}`);
  console.log(`📋 Available contracts: TreasuryToken, TreasuryVault, BuyBack, Crowdsale, Lending, JoinPool`);
  console.log(`💡 Usage: npx hardhat run scripts/deploy.js --network <network> <contract1> <contract2> ...`);
  console.log(`💡 Example: npx hardhat run scripts/deploy.js --network sepolia TreasuryToken TreasuryVault\n`);

  if (args.length === 0) {
    console.log(`❌ No contracts specified. Deploying all contracts...\n`);

    // Deploy all contracts in order
    try {
      // 1. Deploy TreasuryToken
      const { address: tokenAddress } = await deployTreasuryToken();
      deployments.TreasuryToken = tokenAddress;

      // 2. Deploy TreasuryVault
      const { address: vaultAddress } = await deployTreasuryVault(tokenAddress);
      deployments.TreasuryVault = vaultAddress;

      // 3. Deploy policy contracts
      const { address: buyBackAddress } = await deployBuyBack(vaultAddress, tokenAddress);
      deployments.BuyBack = buyBackAddress;

      const { address: crowdsaleAddress } = await deployCrowdsale(vaultAddress, tokenAddress);
      deployments.Crowdsale = crowdsaleAddress;

      const { address: lendingAddress } = await deployLending(vaultAddress, tokenAddress);
      deployments.Lending = lendingAddress;

      const { address: joinPoolAddress } = await deployJoinPool(vaultAddress, tokenAddress);
      deployments.JoinPool = joinPoolAddress;

      saveDeployments(deployments);

      console.log(`\n🎉 All contracts deployed successfully!`);
      console.log(`📄 Deployment summary saved to: ${DEPLOYMENTS_FILE}`);

    } catch (error) {
      console.error(`❌ Deployment failed:`, error);
      process.exit(1);
    }

  } else {
    // Deploy specific contracts
    for (const contractName of args) {
      try {
        switch (contractName.toLowerCase()) {
          case 'treasurytoken':
            const { address: tokenAddr } = await deployTreasuryToken();
            deployments.TreasuryToken = tokenAddr;
            break;

          case 'treasuryvault':
            if (!deployments.TreasuryToken) {
              throw new Error("TreasuryToken must be deployed first");
            }
            const { address: vaultAddr } = await deployTreasuryVault(deployments.TreasuryToken);
            deployments.TreasuryVault = vaultAddr;
            break;

          case 'buyback':
            if (!deployments.TreasuryVault || !deployments.TreasuryToken) {
              throw new Error("TreasuryVault and TreasuryToken must be deployed first");
            }
            const { address: buyBackAddr } = await deployBuyBack(deployments.TreasuryVault, deployments.TreasuryToken);
            deployments.BuyBack = buyBackAddr;
            break;

          case 'crowdsale':
            if (!deployments.TreasuryVault || !deployments.TreasuryToken) {
              throw new Error("TreasuryVault and TreasuryToken must be deployed first");
            }
            const { address: crowdsaleAddr } = await deployCrowdsale(deployments.TreasuryVault, deployments.TreasuryToken);
            deployments.Crowdsale = crowdsaleAddr;
            break;

          case 'lending':
            if (!deployments.TreasuryVault || !deployments.TreasuryToken) {
              throw new Error("TreasuryVault and TreasuryToken must be deployed first");
            }
            const { address: lendingAddr } = await deployLending(deployments.TreasuryVault, deployments.TreasuryToken);
            deployments.Lending = lendingAddr;
            break;

          case 'joinpool':
            if (!deployments.TreasuryVault || !deployments.TreasuryToken) {
              throw new Error("TreasuryVault and TreasuryToken must be deployed first");
            }
            const { address: joinPoolAddr } = await deployJoinPool(deployments.TreasuryVault, deployments.TreasuryToken);
            deployments.JoinPool = joinPoolAddr;
            break;

          default:
            console.log(`⚠️  Unknown contract: ${contractName}`);
            console.log(`📋 Available: TreasuryToken, TreasuryVault, BuyBack, Crowdsale, Lending, JoinPool`);
            continue;
        }

        saveDeployments(deployments);
        console.log(`✅ ${contractName} deployed successfully\n`);

      } catch (error) {
        console.error(`❌ Failed to deploy ${contractName}:`, error.message);
      }
    }
  }

  // Display final deployment summary
  console.log(`\n📊 Final Deployment Summary for ${network.name}:`);
  Object.entries(deployments).forEach(([name, address]) => {
    console.log(`  ${name}: ${address}`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
