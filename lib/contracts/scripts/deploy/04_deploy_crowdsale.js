// scripts/deploy/04_deploy_crowdsale.js
// Deploy Crowdsale contract

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying Crowdsale with the account:", deployer.address);

  // TODO: Replace with your actual constructor arguments
  const rate = 100; // Example: rate of tokens per ETH
  const wallet = "0x..."; // Example: wallet address to collect ETH
  const token = "0x..."; // Example: address of the token being sold

  const Crowdsale = await ethers.getContractFactory("Crowdsale");
  const crowdsale = await Crowdsale.deploy(rate, wallet, token);
  await crowdsale.deployed();
  console.log("Crowdsale deployed to:", crowdsale.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
