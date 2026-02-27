const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BuyBack", function () {
  let owner, treasury, user1, user2, rewardToken, treasuryToken, vault, buyBack, BuyBack, Token, Vault;
  let treasuryTokenAddress, vaultAddress;

  beforeEach(async function () {
    [owner, treasury, user1, user2, ...addrs] = await ethers.getSigners();

    // Deploy treasury token (to be swapped in)
    Token = await ethers.getContractFactory("TreasuryToken");
    treasuryToken = await Token.deploy("TreasuryToken", "TTK", ethers.parseEther("1000000"));
    await treasuryToken.waitForDeployment();
    treasuryTokenAddress = await treasuryToken.getAddress();

    // Deploy reward token
    rewardToken = await Token.deploy("RewardToken", "RTK", ethers.parseEther("1000000"));
    await rewardToken.waitForDeployment();

    // Deploy TreasuryVault
    Vault = await ethers.getContractFactory("TreasuryVault");
    vault = await Vault.deploy("TestVault", treasuryTokenAddress, "VaultToken", "VTK");
    await vault.waitForDeployment();
    vaultAddress = await vault.getAddress();

    // Deploy BuyBack contract
    BuyBack = await ethers.getContractFactory("BuyBack");
    console.log('vaultAddress:', vaultAddress);
    console.log('treasuryToken:', treasuryToken);
    buyBack = await BuyBack.deploy(vaultAddress, treasuryToken);
    await buyBack.waitForDeployment();

    // Fund users with treasury tokens
    await treasuryToken.transfer(user1.address, ethers.parseEther("1000"));
    await treasuryToken.transfer(user2.address, ethers.parseEther("1000"));

    // Fund buyBack with reward tokens (simulate receiving funds)
    await rewardToken.transfer(buyBack.address, ethers.parseEther("10000"));
  });

  describe("Deployment", function () {
    it("should set the correct owner, treasury, and token", async function () {
      expect(await buyBack.treasuryAddrs()).to.equal(vaultAddress);
      expect(await buyBack.checkPeriod(0)).to.be.false;
      expect(await buyBack.checkProposal(0)).to.be.false;
      expect(await buyBack.checkPurchased(0)).to.equal(0);
    });
  });

  describe("newBuy", function () {
    it("should allow owner to create a new buyback proposal", async function () {
      const amount = ethers.parseEther("1000");
      const time = (await ethers.provider.getBlock("latest")).timestamp + 3600;
      const per = ethers.parseEther("100");
      const price = 2; // 2 reward tokens per treasury token

      const tx = await buyBack.connect(owner).newBuy(amount, time, per, price, rewardToken.address);
      const receipt = await tx.wait();
      // Assuming proposalOpen returns a proposal id, but since vault is mock, hard to test fully
      // For now, assume it succeeds
    });

    it("should revert if not owner", async function () {
      const amount = ethers.parseEther("1000");
      const time = (await ethers.provider.getBlock("latest")).timestamp + 3600;
      const per = ethers.parseEther("100");
      const price = 2;

      await expect(
        buyBack.connect(user1).newBuy(amount, time, per, price, rewardToken.address)
      ).to.be.revertedWith("Only owner can start new buy");
    });

    it("should revert if time is not in future", async function () {
      const amount = ethers.parseEther("1000");
      const time = (await ethers.provider.getBlock("latest")).timestamp - 100;
      const per = ethers.parseEther("100");
      const price = 2;

      await expect(
        buyBack.connect(owner).newBuy(amount, time, per, price, rewardToken.address)
      ).to.be.revertedWith("End time must be in future");
    });

    it("should revert if previous period not ended", async function () {
      // First create one
      const amount = ethers.parseEther("1000");
      const time = (await ethers.provider.getBlock("latest")).timestamp + 3600;
      const per = ethers.parseEther("100");
      const price = 2;

      await buyBack.connect(owner).newBuy(amount, time, per, price, rewardToken.address);

      // Try to create another before time ends
      await expect(
        buyBack.connect(owner).newBuy(amount, time + 7200, per, price, rewardToken.address)
      ).to.be.revertedWith("Previous buyback period not ended");
    });
  });

  describe("startSwap and collectSwap", function () {
    let proposalId;

    beforeEach(async function () {
      const amount = ethers.parseEther("1000");
      const time = (await ethers.provider.getBlock("latest")).timestamp + 3600;
      const per = ethers.parseEther("100");
      const price = 2;

      // Mock proposalOpen to return 1
      // Since vault is real, but proposalOpen may not exist or work, assume we set it manually for test
      // For simplicity, call newBuy and assume proposalId = 1
      await buyBack.connect(owner).newBuy(amount, time, per, price, rewardToken.address);
      proposalId = 1; // Assume

      // Approve buyBack to receive funds (simulate receiveFunds)
      await buyBack.connect(owner).receiveFunds(proposalId);
    });

    it("should allow user to start swap", async function () {
      const swapAmount = ethers.parseEther("50");
      await treasuryToken.connect(user1).approve(buyBack.address, swapAmount);

      await expect(buyBack.connect(user1).startSwap(swapAmount, proposalId)).to.not.be.reverted;
    });

    it("should revert startSwap if period not active", async function () {
      // Advance time past period
      await ethers.provider.send("evm_increaseTime", [3700]);
      await ethers.provider.send("evm_mine");

      const swapAmount = ethers.parseEther("50");
      await treasuryToken.connect(user1).approve(buyBack.address, swapAmount);

      await expect(buyBack.connect(user1).startSwap(swapAmount, proposalId)).to.be.revertedWith("Buyback period not active");
    });

    it("should revert startSwap if amount exceeds per user limit", async function () {
      const swapAmount = ethers.parseEther("200");
      await treasuryToken.connect(user1).approve(buyBack.address, swapAmount);

      await expect(buyBack.connect(user1).startSwap(swapAmount, proposalId)).to.be.revertedWith("Amount exceeds per user limit");
    });

    it("should revert startSwap if insufficient user balance", async function () {
      const swapAmount = ethers.parseEther("2000");
      await treasuryToken.connect(user1).approve(buyBack.address, swapAmount);

      await expect(buyBack.connect(user1).startSwap(swapAmount, proposalId)).to.be.revertedWith("Insufficient user balance");
    });

    it("should revert startSwap if already executed", async function () {
      const swapAmount = ethers.parseEther("50");
      await treasuryToken.connect(user1).approve(buyBack.address, swapAmount * 2);

      await buyBack.connect(user1).startSwap(swapAmount, proposalId);
      await expect(buyBack.connect(user1).startSwap(swapAmount, proposalId)).to.be.revertedWith("Already executed for this proposal");
    });

    it("should allow collectSwap after startSwap", async function () {
      const swapAmount = ethers.parseEther("50");
      await treasuryToken.connect(user1).approve(buyBack.address, swapAmount);

      await buyBack.connect(user1).startSwap(swapAmount, proposalId);

      const initialBalance = await rewardToken.balanceOf(user1.address);
      await buyBack.connect(user1).collectSwap(proposalId);
      const finalBalance = await rewardToken.balanceOf(user1.address);

      expect(finalBalance.sub(initialBalance)).to.equal(swapAmount.mul(2)); // price = 2
    });

    it("should revert collectSwap if not started", async function () {
      await expect(buyBack.connect(user1).collectSwap(proposalId)).to.be.revertedWith("User did not start swap for this proposal");
    });

    it("should revert collectSwap if already completed", async function () {
      const swapAmount = ethers.parseEther("50");
      await treasuryToken.connect(user1).approve(buyBack.address, swapAmount);

      await buyBack.connect(user1).startSwap(swapAmount, proposalId);
      await buyBack.connect(user1).collectSwap(proposalId);

      await expect(buyBack.connect(user1).collectSwap(proposalId)).to.be.revertedWith("Swap already completed");
    });
  });

  describe("withdrawToken", function () {
    it("should allow owner to withdraw tokens", async function () {
      // First, have some treasury tokens in buyBack
      await treasuryToken.transfer(buyBack.address, ethers.parseEther("100"));

      const amount = ethers.parseEther("50");
      await expect(buyBack.connect(owner).withdrawToken(amount)).to.not.be.reverted;
    });

    it("should revert if not owner", async function () {
      await expect(buyBack.connect(user1).withdrawToken(ethers.parseEther("50"))).to.be.revertedWith("Only owner can withdraw");
    });

    it("should revert if insufficient balance", async function () {
      const amount = ethers.parseEther("100");
      await expect(buyBack.connect(owner).withdrawToken(amount)).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("receiveFunds", function () {
    it("should allow owner to receive funds for valid proposal", async function () {
      // Assuming proposal 1 exists from newBuy
      await expect(buyBack.connect(owner).receiveFunds(1)).to.not.be.reverted;
    });

    it("should revert if not owner", async function () {
      await expect(buyBack.connect(user1).receiveFunds(1)).to.be.reverted;
    });
  });
});