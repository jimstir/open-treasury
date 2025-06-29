// scripts/deploy/02_deploy_treasury_and_token.js
// Deploy TreasuryToken, then TreasuryVault, then transfer ownership

const { ethers } = require("hardhat");

async function main() {
  // These could be replaced with CLI args or env vars
  const tokenName = process.env.TOKEN_NAME || "GovernanceToken";
  const tokenSymbol = process.env.TOKEN_SYMBOL || "GTKN";
  const treasuryName = process.env.RESERVE_NAME || "My Treasury";
  const treasuryOwner = process.env.RESERVE_OWNER || (await ethers.getSigners())[0].address;

  // 1. Deploy TreasuryToken
  const TreasuryToken = await ethers.getContractFactory("TreasuryToken");
  const treasuryToken = await TreasuryToken.deploy(tokenName, tokenSymbol);
  await treasuryToken.deployed();
  console.log("TreasuryToken deployed to:", treasuryToken.address);

  // 2. Deploy TreasuryVault with TreasuryToken address
  const TreasuryVault = await ethers.getContractFactory("TreasuryVault");
  const treasuryVault = await TreasuryVault.deploy(
    treasuryName,
    treasuryOwner,
    treasuryToken.address,
    tokenName,
    tokenSymbol
  );
  await treasuryVault.deployed();
  console.log("TreasuryVault deployed to:", treasuryVault.address);

  // 3. Transfer token contract ownership to TreasuryVault
  const tx = await treasuryToken.initTreasury(treasuryVault.address);
  await tx.wait();
  console.log(`Ownership of TreasuryToken transferred to TreasuryVault (${treasuryVault.address})`);

  // 4. Return deployed addresses (for scripting)
  return {
    treasuryTokenAddress: treasuryToken.address,
    treasuryVaultAddress: treasuryVault.address,
  };
}

if (require.main === module) {
  main()
    .then((result) => {
      if (result) {
        console.log("Deployment result:", result);
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
