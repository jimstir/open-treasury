const { ethers } = require("hardhat");
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to get user input
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log("=== Treasury Deployment ===");
  
  try {
    // Get main token configuration
    console.log("\n=== Main Token Configuration ===");
    const tokenName = await question("Enter token name (e.g., My Token): ");
    const tokenSymbol = await question("Enter token symbol (e.g., MTK): ");
    const initialSupply = await question("Enter initial token supply (e.g., 1000000 for 1M tokens): ");
    
    // Auto-generate share token configuration
    const shareName = `z${tokenName}`;
    const shareSymbol = `z${tokenSymbol}`;
    
    // Get treasury configuration
    console.log("\n=== Treasury Configuration ===");
    const treasuryName = await question("Enter treasury name (e.g., My Treasury): ");

    const [deployer] = await ethers.getSigners();
    
    // Display deployment summary
    console.log("\n=== Deployment Summary ===");
    console.log("Deployer address:", deployer.address);
    console.log("\nMain Token:");
    console.log(`- Name: ${tokenName} (${tokenSymbol})`);
    console.log(`- Initial Supply: ${initialSupply} ${tokenSymbol}`);
    console.log("\nShare Token (auto-generated):");
    console.log(`- Name: ${shareName} (${shareSymbol})`);
    console.log("\nTreasury:");
    console.log(`- Name: ${treasuryName}`);
    console.log("=========================\n");

    const confirm = await question("Confirm deployment? (y/n): ");
    if (confirm.toLowerCase() !== 'y') {
      console.log("Deployment cancelled.");
      rl.close();
      return;
    }

    // Deploy TreasuryToken
    console.log("\n1. Deploying TreasuryToken...");
    const Token = await ethers.getContractFactory("TreasuryToken");
    const initialSupplyWei = ethers.utils.parseEther(initialSupply);
    const token = await Token.deploy(tokenName, tokenSymbol, initialSupplyWei);
    await token.deployed();
    console.log("✅ TreasuryToken deployed to:", token.address);

    // Deploy TreasuryVault with auto-generated share token name/symbol
    console.log("\n2. Deploying TreasuryVault...");
    const Vault = await ethers.getContractFactory("TreasuryVault");
    const vault = await Vault.deploy(
      treasuryName,   // Treasury name
      token.address,  // TreasuryToken address
      shareName,      // Auto-generated share token name (z + tokenName)
      shareSymbol     // Auto-generated share token symbol (z + tokenSymbol)
    );
    await vault.deployed();
    console.log("✅ TreasuryVault deployed to:", vault.address);

    // Initialize token with vault
    console.log("\n3. Initializing token with vault...");
    const tx = await token.initTreasury(vault.address);
    await tx.wait();
    console.log("✅ Token initialized with vault");

    console.log("\n=== Deployment Complete ===");
    console.log("TreasuryToken:", token.address);
    console.log("TreasuryVault:", vault.address);
    console.log("Share Token Symbol:", shareSymbol);
    console.log("=========================");

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    if (error.transactionHash) {
      console.log("Transaction hash:", error.transactionHash);
    }
  } finally {
    rl.close();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
