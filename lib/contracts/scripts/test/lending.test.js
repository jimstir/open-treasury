const { expect } = require("chai");
const { ethers } = require("hardhat");

require("@nomicfoundation/hardhat-chai-matchers");

describe("Lending", function () {
  let owner, user1, user2, treasuryToken, rewardToken, vault, lending, Lending, Token, Vault;
  let treasuryTokenAddress, vaultAddress, lendingAddress, rewardTokenAddress;

  beforeEach(async function () {
    [owner, user1, user2, ...addrs] = await ethers.getSigners();

    // Deploy treasury token
    Token = await ethers.getContractFactory("TreasuryToken");
    treasuryToken = await Token.deploy("TreasuryToken", "TTK", ethers.parseEther("1000000"));
    await treasuryToken.waitForDeployment();
    treasuryTokenAddress = await treasuryToken.getAddress();

    // Deploy reward token for loans
    rewardToken = await Token.deploy("RewardToken", "RTK", ethers.parseEther("1000000"));
    await rewardToken.waitForDeployment();
    rewardTokenAddress = await rewardToken.getAddress();

    // Deploy TreasuryVault
    Vault = await ethers.getContractFactory("TreasuryVault");
    vault = await Vault.deploy("TestVault", treasuryTokenAddress, "VaultToken", "VTK");
    await vault.waitForDeployment();
    vaultAddress = await vault.getAddress();

    // Deploy Lending contract
    Lending = await ethers.getContractFactory("Lending");
    lending = await Lending.deploy(vaultAddress, treasuryTokenAddress);
    await lending.waitForDeployment();
    lendingAddress = await lending.getAddress();

    // Fund users
    await treasuryToken.transfer(user1.address, ethers.parseEther("1000"));
    await treasuryToken.transfer(user2.address, ethers.parseEther("1000"));
    await rewardToken.transfer(lendingAddress, ethers.parseEther("10000"));

    // Add accepted token
    await lending.connect(owner).addToken(treasuryTokenAddress);
  });

  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      expect(lendingAddress).to.not.be.undefined;
    });
  });

  describe("depositCollateral", function () {
    it("should allow user to deposit collateral", async function () {
      await treasuryToken.connect(user1).approve(lendingAddress, ethers.parseEther("100"));
      const loanNum = await lending.connect(user1).depositCollateral(treasuryToken.address, ethers.parseEther("100"));
      expect(loanNum).to.equal(1);
    });

    it("should revert if token not accepted", async function () {
      await expect(lending.connect(user1).depositCollateral(rewardToken.address, ethers.parseEther("100"))).to.be.revertedWith("Token not accepted");
    });
  });

  describe("takeLoan", function () {
    beforeEach(async function () {
      await treasuryToken.connect(user1).approve(lendingAddress, ethers.parseEther("100"));
      await lending.connect(user1).depositCollateral(treasuryToken.address, ethers.parseEther("100"));
      // Fund lending with reward tokens
      await rewardToken.transfer(lendingAddress, ethers.parseEther("100"));
    });

    it("should allow taking loan", async function () {
      await expect(lending.connect(user1).takeLoan(1, rewardToken.address, user1.address)).to.not.be.reverted;
    });

    it("should revert if loan already taken", async function () {
      await lending.connect(user1).takeLoan(1, rewardToken.address, user1.address);
      await expect(lending.connect(user1).takeLoan(1, rewardToken.address, user1.address)).to.be.revertedWith("Loan already taken");
    });
  });

  describe("makePayment", function () {
    beforeEach(async function () {
      await treasuryToken.connect(user1).approve(lendingAddress, ethers.parseEther("100"));
      await lending.connect(user1).depositCollateral(treasuryToken.address, ethers.parseEther("100"));
      await rewardToken.transfer(lendingAddress, ethers.parseEther("100"));
      await lending.connect(user1).takeLoan(1, rewardToken.address, user1.address);
    });

    it("should allow making payment", async function () {
      await rewardToken.connect(user1).approve(lendingAddress, ethers.parseEther("10"));
      await expect(lending.connect(user1).makePayment(1, user1.address)).to.not.be.reverted;
    });

    it("should revert if loan closed", async function () {
      // Close loan first
      await lending.connect(user1).closeLoan(1, user1.address);
      await expect(lending.connect(user1).makePayment(1, user1.address)).to.be.revertedWith("Loan closed");
    });
  });

  describe("closeLoan", function () {
    beforeEach(async function () {
      await treasuryToken.connect(user1).approve(lendingAddress, ethers.parseEther("100"));
      await lending.connect(user1).depositCollateral(treasuryToken.address, ethers.parseEther("100"));
      await rewardToken.transfer(lendingAddress, ethers.parseEther("100"));
      await lending.connect(user1).takeLoan(1, rewardToken.address, user1.address);
    });

    it("should close loan after payment", async function () {
      // Make full payment
      const loan = await lending._loans(user1.address, 1);
      const totalDue = loan.loanAmount + await lending.amountDue(1, user1.address);
      await rewardToken.connect(user1).approve(lendingAddress, totalDue);
      await lending.connect(user1).closeLoan(1, user1.address);
      // Check closed
    });
  });

  describe("withdrawCollateral", function () {
    beforeEach(async function () {
      await treasuryToken.connect(user1).approve(lendingAddress, ethers.parseEther("100"));
      await lending.connect(user1).depositCollateral(treasuryToken.address, ethers.parseEther("100"));
      await rewardToken.transfer(lendingAddress, ethers.parseEther("100"));
      await lending.connect(user1).takeLoan(1, rewardToken.address, user1.address);
      // Close loan
      await lending.connect(user1).closeLoan(1, user1.address);
    });

    it("should allow withdrawing collateral", async function () {
      const initialBalance = await treasuryToken.balanceOf(user1.address);
      await lending.connect(user1).withdrawCollateral(1, user1.address);
      const finalBalance = await treasuryToken.balanceOf(user1.address);
      expect(finalBalance).to.be.above(initialBalance);
    });
  });

  describe("proposal and collectFunds", function () {
    it("should allow owner to create proposal", async function () {
      const amount = ethers.parseEther("1000");
      const time = (await ethers.provider.getBlock("latest")).timestamp + 3600;
      await expect(lending.connect(owner).createProposal(amount, treasuryToken, false, time)).to.not.be.reverted;
    });

    // collectFunds would require approved proposal
  });
});
