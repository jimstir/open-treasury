const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

describe("TreasuryVault", function () {
  let TreasuryVault, treasuryVault, token, owner, authUser, user1, user2;
  const INITIAL_SUPPLY = ethers.utils.parseEther("1000000");
  const DEPOSIT_AMOUNT = ethers.utils.parseEther("1000");
  const MINT_AMOUNT = ethers.utils.parseEther("100");

  beforeEach(async function () {
    // Get signers
    [owner, authUser, user1, user2] = await ethers.getSigners();

    // Deploy a test ERC20 token
    const Token = await ethers.getContractFactory("ERC20Mock");
    token = await Token.deploy("Test Token", "TST", owner.address, INITIAL_SUPPLY);
    await token.deployed();

    // Deploy TreasuryVault
    TreasuryVault = await ethers.getContractFactory("TreasuryVault");
    treasuryVault = await TreasuryVault.deploy(false, owner.address, token.address);
    await treasuryVault.deployed();

    // Transfer tokens to test users
    await token.transfer(user1.address, DEPOSIT_AMOUNT.mul(2));
    await token.transfer(user2.address, DEPOSIT_AMOUNT.mul(2));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await treasuryVault.whosOwner()).to.equal(owner.address);
    });

    it("Should have the correct token address", async function () {
      expect(await treasuryVault.asset()).to.equal(token.address);
    });
  });

  describe("Authorization", function () {
    it("Should allow owner to add authorized user", async function () {
      await expect(treasuryVault.addAuth(user1.address))
        .to.emit(treasuryVault, "AuthUser")
        .withArgs(user1.address, true);
      
      expect(await treasuryVault.getAuth(user1.address)).to.be.true;
    });

    it("Should not allow non-owner to add authorized user", async function () {
      await expect(
        treasuryVault.connect(user1).addAuth(user2.address)
      ).to.be.revertedWith("caller is not the owner");
    });
  });

  describe("Deposits", function () {
    beforeEach(async function () {
      // Approve the vault to spend tokens
      await token.connect(user1).approve(treasuryVault.address, DEPOSIT_AMOUNT);
    });

    it("Should allow deposits and mint shares", async function () {
      // Initial balance checks
      const initialBalance = await token.balanceOf(user1.address);
      
      // Deposit
      await expect(treasuryVault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address))
        .to.emit(treasuryVault, "Deposit")
        .withArgs(user1.address, user1.address, DEPOSIT_AMOUNT, DEPOSIT_AMOUNT);
      
      // Check balances after deposit
      const finalBalance = await token.balanceOf(user1.address);
      const shares = await treasuryVault.balanceOf(user1.address);
      
      expect(finalBalance).to.equal(initialBalance.sub(DEPOSIT_AMOUNT));
      expect(shares).to.equal(DEPOSIT_AMOUNT);
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      // Approve and deposit tokens first
      await token.connect(user1).approve(treasuryVault.address, DEPOSIT_AMOUNT.mul(2));
      await treasuryVault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);
    });

    it("Should allow withdrawals and burn shares", async function () {
      const shares = await treasuryVault.balanceOf(user1.address);
      const initialBalance = await token.balanceOf(user1.address);
      
      // Withdraw
      await expect(treasuryVault.connect(user1).withdraw(DEPOSIT_AMOUNT, user1.address, user1.address))
        .to.emit(treasuryVault, "Withdraw")
        .withArgs(user1.address, user1.address, user1.address, DEPOSIT_AMOUNT, shares);
      
      // Check balances after withdrawal
      const finalBalance = await token.balanceOf(user1.address);
      const finalShares = await treasuryVault.balanceOf(user1.address);
      
      expect(finalBalance).to.equal(initialBalance.add(DEPOSIT_AMOUNT));
      expect(finalShares).to.equal(0);
    });
  });

  describe("Proposals", function () {
    beforeEach(async function () {
      // Set up initial state for proposal tests
      await token.connect(user1).approve(treasuryVault.address, DEPOSIT_AMOUNT.mul(2));
      await token.connect(user2).approve(treasuryVault.address, DEPOSIT_AMOUNT.mul(2));
      
      // Create a proposal
      await treasuryVault.connect(owner).newProposal(token.address, user1.address, DEPOSIT_AMOUNT);
    });

    it("Should create a new proposal", async function () {
      const proposalCount = await treasuryVault.proposalCheck();
      expect(proposalCount).to.equal(1);
      
      const proposal = await treasuryVault.proposalBook(1);
      expect(proposal.token).to.equal(token.address);
    });

    it("Should allow users to join a proposal", async function () {
      // User1 joins the proposal
      await treasuryVault.connect(user1).joinProposal(1, DEPOSIT_AMOUNT);
      
      const userDeposit = await treasuryVault.userDeposit(user1.address, 1);
      expect(userDeposit).to.equal(DEPOSIT_AMOUNT);
    });
  });

  // Add more test cases as needed for other functions
});
