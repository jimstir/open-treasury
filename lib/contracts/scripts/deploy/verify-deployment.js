const { ethers } = require("hardhat");

async function main() {
  // Deployed contract addresses from the deployment
  const TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const VAULT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const [signer] = await ethers.getSigners();
  
  // Get contract factories
  const Token = await ethers.getContractFactory("TreasuryToken");
  const Vault = await ethers.getContractFactory("TreasuryVault");
  
  // Attach to deployed contracts
  const token = Token.attach(TOKEN_ADDRESS);
  const vault = Vault.attach(VAULT_ADDRESS);
  
  // Verify token details
  console.log("\n=== Token Details ===");
  console.log("Name:", await token.name());
  console.log("Symbol:", await token.symbol());
  console.log("Total Supply:", (await token.totalSupply()).toString());
  console.log("Owner:", await token.owner());
  
  // Verify vault details
  console.log("\n=== Vault Details ===");
  console.log("Treasury Name:", await vault.name());
  console.log("Asset Token:", await vault.asset());
  console.log("Share Token Name:", await vault.name());
  console.log("Share Token Symbol:", await vault.symbol());
  
  // Verify token-vault connection
  console.log("\n=== Token-Vault Connection ===");
  console.log("Token balance of Vault:", (await token.balanceOf(VAULT_ADDRESS)).toString());
  console.log("Vault's asset balance:", (await vault.totalAssets()).toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
