// Script to register Chainlink Automation upkeeps programmatically
// Usage: npx hardhat run scripts/chainlink/registerUpkeep.js --network <network-name>

const { ethers } = require("hardhat");
const { getNetwork } = require("hardhat/config");

// Chainlink Automation Registry addresses (mainnet, goerli, etc.)
const REGISTRY_ADDRESSES = {
  mainnet: "0x02777053d6764996e594c3E88AF1D58D5363a2e6",
  goerli: "0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2",
  // Add other networks as needed
};

// ABI for the Automation Registry
const REGISTRY_ABI = [
  "function registerUpkeep(
    address target,
    uint32 gasLimit,
    address admin,
    bytes calldata checkData,
    bytes calldata offchainConfig,
    uint96 amount
  ) external returns (uint256)",
  "function getUpkeep(uint256 id) external view returns (
    address target,
    uint32 executeGas,
    bytes memory checkData,
    uint96 balance,
    address lastKeeper,
    address admin,
    uint64 maxValidBlocknumber,
    uint96 amountSpent,
    bool paused
  )"
];

// ABI for the Upkeep-compatible contract (your JoinPool contract)
const UPKEEP_ABI = [
  "function checkUpkeep(bytes calldata) external view returns (bool upkeepNeeded, bytes memory performData)",
  "function performUpkeep(bytes calldata performData) external"
];

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log(`Registering upkeep on network: ${network.name} (${network.chainId})`);
  console.log(`Using account: ${deployer.address}`);

  // Configuration - Update these values
  const config = {
    // Address of your deployed JoinPool contract
    targetContract: "0x1234...",
    // Gas limit for upkeep execution (adjust based on your needs)
    gasLimit: 500000,
    // Admin address (can be a multisig or EOA)
    adminAddress: deployer.address,
    // Initial funding amount in LINK (in wei, 1 LINK = 1e18)
    linkAmount: ethers.utils.parseEther("1"),
    // Optional: Add any check data if needed
    checkData: "0x",
    // Optional: Offchain config (can be empty for most cases)
    offchainConfig: "0x"
  };

  // Get the registry contract
  const registryAddress = REGISTRY_ADDRESSES[network.name] || REGISTRY_ADDRESSES.goerli;
  const registry = new ethers.Contract(registryAddress, REGISTRY_ABI, deployer);
  
  console.log(`Using registry at: ${registryAddress}`);
  console.log(`Target contract: ${config.targetContract}`);

  // Approve LINK transfer if needed (uncomment if not already approved)
  /*
  const linkTokenAddress = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"; // Goerli LINK
  const linkToken = new ethers.Contract(linkTokenAddress, [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ], deployer);
  
  const allowance = await linkToken.allowance(deployer.address, registryAddress);
  if (allowance.lt(config.linkAmount)) {
    console.log("Approving LINK transfer...");
    const tx = await linkToken.approve(registryAddress, config.linkAmount);
    await tx.wait();
    console.log("LINK approved");
  }
  */

  // Register the upkeep
  console.log("Registering upkeep...");
  const tx = await registry.registerUpkeep(
    config.targetContract,
    config.gasLimit,
    config.adminAddress,
    config.checkData,
    config.offchainConfig,
    config.linkAmount
  );
  
  const receipt = await tx.wait();
  
  // Parse the Upkeep ID from the logs
  const event = receipt.events?.find(e => e.event === "UpkeepRegistered");
  if (!event) {
    throw new Error("UpkeepRegistered event not found");
  }
  
  const upkeepId = event.args.id.toString();
  console.log(`✅ Upkeep registered successfully!`);
  console.log(`Upkeep ID: ${upkeepId}`);
  console.log(`Transaction hash: ${receipt.transactionHash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
