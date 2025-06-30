const { ethers } = require("hardhat");

async function main() {
  // Get the first account from the configured accounts
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy TreasuryToken
  console.log("Deploying TreasuryToken...");
  const TreasuryToken = await ethers.getContractFactory("TreasuryToken");
  const initialSupply = ethers.utils.parseEther("1000000"); // 1M tokens with 18 decimals
  const token = await TreasuryToken.deploy(
    "Test Treasury Token", 
    "TTT",
    initialSupply
  );
  await token.deployed();
  console.log("TreasuryToken deployed to:", token.address);
  console.log("Initial supply:", initialSupply.toString(), "tokens minted to", deployer.address);

  // Deploy TreasuryVault
  console.log("Deploying TreasuryVault...");
  const TreasuryVault = await ethers.getContractFactory("TreasuryVault");
  const vault = await TreasuryVault.deploy(
    "Test Treasury", // resName
    token.address,    // tToken (ERC20 token address)
    "Test Treasury Vault Shares", // name
    "tTVS"           // symbol
  );
  await vault.deployed();
  console.log("TreasuryVault deployed to:", vault.address);

  // Initialize the token with the vault as the owner
  console.log("Transferring token ownership to vault...");
  const tx = await token.initTreasury(vault.address);
  await tx.wait();
  console.log("Token ownership transferred to vault");

  console.log("\nDeployment Summary:");
  console.log("==================");
  console.log(`TreasuryToken: ${token.address}`);
  console.log(`TreasuryVault: ${vault.address}`);
  console.log(`Initial Supply: ${initialSupply.toString()} TTT`);
  console.log("\nYou can now interact with the contracts using the Hardhat console or write tests.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
