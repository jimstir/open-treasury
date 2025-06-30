require("@nomicfoundation/hardhat-toolbox");
require('@nomiclabs/hardhat-ethers');
require('dotenv').config();

// Generate test accounts with private keys
const { utils } = require('ethers');
const PRIVATE_KEYS = [
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', // Hardhat account 0
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d', // Hardhat account 1
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a', // Hardhat account 2
];

const accounts = PRIVATE_KEYS.map(key => ({
  privateKey: key,
  balance: utils.parseEther('1000').toString()
}));

module.exports = {
  solidity: "0.8.20",
  paths: {
    sources: "./vault",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      accounts: accounts,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: PRIVATE_KEYS
    }
  },
  mocha: {
    timeout: 100000
  }
};
