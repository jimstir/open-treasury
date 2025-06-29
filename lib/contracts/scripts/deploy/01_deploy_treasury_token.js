const { ethers } = require("hardhat");

async function deployTreasuryToken(name, symbol, initialSupply) {
  const TreasuryToken = await ethers.getContractFactory("TreasuryToken");
  const token = await TreasuryToken.deploy(name, symbol, initialSupply);
  await token.deployed();
  
  console.log(`TreasuryToken deployed to: ${token.address}`);
  return token.address;
}

module.exports = { deployTreasuryToken };

// For direct execution (for testing)
if (require.main === module) {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying TreasuryToken with the account:", deployer.address);
  
  const name = process.env.TOKEN_NAME || "Test Token";
  const symbol = process.env.TOKEN_SYMBOL || "TST";
  const initialSupply = process.env.INITIAL_SUPPLY || ethers.utils.parseEther("1000000");
  
  deployTreasuryToken(name, symbol, initialSupply)
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
