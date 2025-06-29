const { ethers } = require("hardhat");
const { deployTreasuryWithToken } = require("./deploy/02_deploy_treasury_vault");

/**
 * Main function to deploy a new treasury with its associated token
 * @param {Object} treasuryData - Treasury configuration data
 * @param {string} treasuryData.treasuryName - Name of the treasury
 * @param {string} treasuryData.tokenName - Name of the treasury token
 * @param {string} treasuryData.tokenSymbol - Symbol of the treasury token
 * @param {string} treasuryData.initialSupply - Initial token supply (in wei)
 * @param {boolean} treasuryData.isAgent - Whether the deployer is an agent
 * @returns {Promise<Object>} Object containing deployed contract addresses
 */
async function deployTreasury(treasuryData) {
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    
    // Set default owner to deployer if not provided
    const ownerAddress = treasuryData.ownerAddress || deployer.address;
    
    // Deploy both contracts
    const { tokenAddress, treasuryAddress } = await deployTreasuryWithToken({
      ...treasuryData,
      ownerAddress,
    });

    console.log("Deployment completed successfully!");
    console.log("TreasuryToken deployed to:", tokenAddress);
    console.log("TreasuryVault deployed to:", treasuryAddress);

    return {
      success: true,
      tokenAddress,
      treasuryAddress,
      transactionHash: "" // You might want to capture this from the deployment receipt
    };
  } catch (error) {
    console.error("Deployment failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export for use in other modules
module.exports = { deployTreasury };

// For direct execution (for testing)
if (require.main === module) {
  // Example usage:
  const treasuryData = {
    treasuryName: process.env.RESERVE_NAME || "My Test Treasury",
    tokenName: process.env.TOKEN_NAME || "Test Treasury Token",
    tokenSymbol: process.env.TOKEN_SYMBOL || "TRT",
    initialSupply: process.env.INITIAL_SUPPLY || ethers.utils.parseEther("1000000"),
    isAgent: false
  };

  deployTreasury(treasuryData)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
