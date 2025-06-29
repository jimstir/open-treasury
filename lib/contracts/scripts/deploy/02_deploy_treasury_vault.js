const { ethers } = require("hardhat");
const { deployTreasuryToken } = require("./01_deploy_treasury_token");

async function deployTreasuryVault(
  isAgent,
  treasuryName,
  ownerAddress,
  treasuryTokenAddress,
  tokenName,
  tokenSymbol
) {
  const TreasuryVault = await ethers.getContractFactory("TreasuryVault");
  const treasuryVault = await TreasuryVault.deploy(
    isAgent,
    treasuryName,
    ownerAddress,
    treasuryTokenAddress,
    tokenName,
    tokenSymbol
  );
  
  await treasuryVault.deployed();
  console.log(`TreasuryVault deployed to: ${treasuryVault.address}`);
  return treasuryVault.address;
}

async function deployTreasuryWithToken(treasuryData) {
  const {
    isAgent,
    treasuryName,
    ownerAddress,
    tokenName,
    tokenSymbol,
    initialSupply
  } = treasuryData;

  // Deploy TreasuryToken first
  console.log("Deploying TreasuryToken...");
  const tokenAddress = await deployTreasuryToken(
    tokenName,
    tokenSymbol,
    initialSupply
  );

  // Deploy TreasuryVault with the deployed token
  console.log("Deploying TreasuryVault...");
  const treasuryAddress = await deployTreasuryVault(
    isAgent,
    treasuryName,
    ownerAddress,
    tokenAddress,
    tokenName,
    tokenSymbol
  );

  return {
    tokenAddress,
    treasuryAddress
  };
}

module.exports = {
  deployTreasuryVault,
  deployTreasuryWithToken
};

// For direct execution (for testing)
if (require.main === module) {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying TreasuryVault with the account:", deployer.address);
  
  const treasuryData = {
    isAgent: false, // Set based on your needs
    treasuryName: process.env.RESERVE_NAME || "Test Treasury",
    ownerAddress: process.env.OWNER_ADDRESS || deployer.address,
    tokenName: process.env.TOKEN_NAME || "Test Treasury Token",
    tokenSymbol: process.env.TOKEN_SYMBOL || "TRT",
    initialSupply: process.env.INITIAL_SUPPLY || ethers.utils.parseEther("1000000")
  };

  deployTreasuryWithToken(treasuryData)
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
