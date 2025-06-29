// scripts/deploy/03_deploy_join_pool.js
// Deploy JoinPool contract

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying JoinPool with the account:", deployer.address);

  // TODO: Replace with your actual constructor arguments
  const arg1 = "0x..."; // Example: address of TreasuryVault or TreasuryToken
  const arg2 = 1000;     // Example: pool size or other parameter

  const JoinPool = await ethers.getContractFactory("JoinPool");
  const joinPool = await JoinPool.deploy(arg1, arg2);
  await joinPool.deployed();
  console.log("JoinPool deployed to:", joinPool.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
