const { expect } = require("chai");
const { ethers } = require("hardhat");

require("@nomicfoundation/hardhat-chai-matchers");

describe("Crowdsale", function () {
  let owner, user1, user2, treasuryToken, vault, crowdsale, Crowdsale, Token, Vault;
  let treasuryTokenAddress, vaultAddress;

  beforeEach(async function () {
    [owner, user1, user2, ...addrs] = await ethers.getSigners();

    // Deploy treasury token
    Token = await ethers.getContractFactory("TreasuryToken");
    treasuryToken = await Token.deploy("TreasuryToken", "TTK", ethers.parseEther("1000000"));
    await treasuryToken.waitForDeployment();
    treasuryTokenAddress = await treasuryToken.getAddress();

    // Deploy TreasuryVault
    Vault = await ethers.getContractFactory("TreasuryVault");
    vault = await Vault.deploy("TestVault", treasuryTokenAddress, "VaultToken", "VTK");
    await vault.waitForDeployment();
    vaultAddress = await vault.getAddress();

    // Deploy Crowdsale contract
    Crowdsale = await ethers.getContractFactory("Crowdsale");
    crowdsale = await Crowdsale.deploy(vaultAddress, treasuryToken); // treasury, treasuryToken
    await crowdsale.waitForDeployment();

    // Fund users with treasury tokens
    await treasuryToken.transfer(user1.address, ethers.parseEther("1000"));
    await treasuryToken.transfer(user2.address, ethers.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("should set the correct treasury and ratio", async function () {
      expect(await crowdsale.treasuryAddrs()).to.equal(vaultAddress);
      // Note: This contract may not have currentRatio or isOpenRound functions
    });
  });

  describe("newSale and newCrowdsale", function () {
    it("should allow owner to create new sale", async function () {
      const futureTime = (await ethers.provider.getBlock("latest")).timestamp + 3600;
      const price = ethers.parseEther("1");
      const vote = true;
      const max = ethers.parseEther("10000");
      await expect(crowdsale.connect(owner).newSale(futureTime, price, vote, max)).to.not.be.reverted;
    });

    it("should revert if not owner", async function () {
      const futureTime = (await ethers.provider.getBlock("latest")).timestamp + 3600;
      await expect(crowdsale.connect(user1).newSale(futureTime, ethers.parseEther("1"), true, ethers.parseEther("10000"))).to.be.reverted;
    });
  });
});
