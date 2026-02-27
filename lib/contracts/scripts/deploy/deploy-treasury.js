const { ethers } = require("hardhat");
const axios = require('axios');
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

// Helper function to save deployed treasury to the database
async function saveDeployedTreasury(treasuryData) {
  const API_URL = process.env.DEPLOY_API_URL || 'http://localhost:4000/api/deployed-treasuries';
  
  // Format data to match API expectations
  const payload = {
    name: treasuryData.name,
    tokenName: treasuryData.tokenName,  // Keep camelCase as expected by API
    tokenSymbol: treasuryData.tokenSymbol,
    tokenAddress: treasuryData.tokenAddress.toLowerCase(),  // Ensure consistent casing
    vaultAddress: treasuryData.vaultAddress.toLowerCase(),  // Ensure consistent casing
    ownerAddress: treasuryData.ownerAddress.toLowerCase()   // Ensure consistent casing
  };
  
  console.log('Saving to database with payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await axios.post(API_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Treasury saved to database:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to save treasury to database');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      console.error('Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
}

/**
 * Deploys a new Treasury with associated token
 * @param {Object} config - Configuration object
 * @param {string} config.treasuryName - Name of the treasury
 * @param {string} config.tokenName - Name of the ERC20 token
 * @param {string} config.tokenSymbol - Symbol of the ERC20 token
 * @param {string} config.initialSupply - Initial supply of tokens to mint (as a decimal string)
 * @param {boolean} config.saveToDb - Whether to save to database
 * @returns {Promise<Object>} Object containing deployed contract addresses and details
 */
async function deployTreasury({ treasuryName, tokenName, tokenSymbol, initialSupply, saveToDb = (process.env.DEPLOY_SAVE_TO_DB === 'true') }) {
  const [deployer] = await ethers.getSigners();
  const initialSupplyWei = ethers.utils.parseEther(initialSupply);
  
  // Auto-generate share token configuration
  const shareName = `z${tokenName}`;
  const shareSymbol = `z${tokenSymbol}`;

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

  // Deploy TreasuryToken
  console.log("1. Deploying TreasuryToken...");
  const Token = await ethers.getContractFactory("TreasuryToken");
  const token = await Token.deploy(tokenName, tokenSymbol, initialSupplyWei);
  await token.deployed();
  console.log("✅ TreasuryToken deployed to:", token.address);

  // Deploy TreasuryVault
  console.log("\n2. Deploying TreasuryVault...");
  const Vault = await ethers.getContractFactory("TreasuryVault");
  const vault = await Vault.deploy(
    treasuryName,   // Treasury name
    token.address,  // TreasuryToken address
    shareName,      // Share token name
    shareSymbol     // Share token symbol
  );
  await vault.deployed();
  console.log("✅ TreasuryVault deployed to:", vault.address);

  // Initialize token with vault
  console.log("\n3. Initializing token with vault...");
  const tx = await token.initTreasury(vault.address);
  await tx.wait();
  console.log("✅ Token initialized with vault");

  // Save to database if enabled and API URL configured
  const apiUrl = process.env.DEPLOY_API_URL;
  if (saveToDb && apiUrl) {
    console.log("\n4. Saving to database via:", apiUrl);
    await saveDeployedTreasury({
      name: treasuryName,
      tokenName,
      tokenSymbol,
      tokenAddress: token.address,
      vaultAddress: vault.address,
      ownerAddress: deployer.address,
      initialSupply: initialSupplyWei.toString(),
      shareTokenName: shareName,
      shareTokenSymbol: shareSymbol
    });
  } else if (saveToDb && !apiUrl) {
    console.warn("\n⚠️ saveToDb=true but DEPLOY_API_URL is not set. Skipping DB save.");
  } else {
    console.log("\nℹ️ Skipping DB save (saveToDb is false)");
  }

  const result = {
    treasury: {
      name: treasuryName,
      address: vault.address,
      owner: deployer.address
    },
    token: {
      name: tokenName,
      symbol: tokenSymbol,
      address: token.address,
      initialSupply: initialSupplyWei.toString()
    },
    shareToken: {
      name: shareName,
      symbol: shareSymbol
    }
  };

  console.log("\n=== Deployment Complete ===");
  console.log("Treasury:", result.treasury.address);
  console.log("Token:", result.token.address);
  console.log("Share Token:", result.shareToken.symbol);
  console.log("=========================");

  return result;
}

// For direct execution via CLI
if (require.main === module) {
  (async () => {
    try {
      // Check for command line arguments
      const [,, treasuryName, tokenName, tokenSymbol, initialSupply] = process.argv.slice(2);
      
      let config = {};
      
      if (treasuryName && tokenName && tokenSymbol && initialSupply) {
        // Use command line arguments if provided
        config = { treasuryName, tokenName, tokenSymbol, initialSupply };
      } else {
        // Otherwise, prompt for input
        console.log("=== Treasury Deployment ===\n");
        console.log("=== Main Token Configuration ===");
        config.tokenName = await question("Enter token name (e.g., My Token): ");
        config.tokenSymbol = await question("Enter token symbol (e.g., MTK): ");
        config.initialSupply = await question("Enter initial token supply (e.g., 1000000 for 1M tokens): ");
        
        console.log("\n=== Treasury Configuration ===");
        config.treasuryName = await question("Enter treasury name (e.g., My Treasury): ");
        
        const saveDb = await question("Save to database? (y/n, default: n): ");
        config.saveToDb = saveDb.trim() === '' ? false : saveDb.toLowerCase() === 'y';
      }
      
      await deployTreasury(config);
    } catch (error) {
      console.error("\n❌ Deployment failed:\n", error);
      if (error.transactionHash) {
        console.log("Transaction hash:", error.transactionHash);
      }
      process.exit(1);
    } finally {
      rl.close();
    }
  })();
}

module.exports = { deployTreasury };
