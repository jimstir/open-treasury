require("@nomicfoundation/hardhat-chai-matchers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TreasuryVault", function () {
  let TreasuryToken, treasuryToken, TreasuryVault, treasuryVault, owner, addr1, addr2;
  let treasuryTokenAddress, treasuryVaultAddress;

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy TreasuryToken (ERC20 + ITreasuryToken)
    TreasuryToken = await ethers.getContractFactory("TreasuryToken");
    treasuryToken = await TreasuryToken.deploy("TreasuryToken", "TTK", ethers.parseEther("1000000"));
    await treasuryToken.waitForDeployment();
    treasuryTokenAddress = await treasuryToken.getAddress();

     // Deploy TreasuryVault
    TreasuryVault = await ethers.getContractFactory("TreasuryVault");
    treasuryVault = await TreasuryVault.deploy(
      "TestVault",
      treasuryTokenAddress,
      "VaultToken",
      "VTK"
    );
    await treasuryVault.waitForDeployment();
    treasuryVaultAddress = await treasuryVault.getAddress();

  // Mint tokens only to owner for testing before ownership transfer
  await treasuryToken.mintTreasury(addr1.address, ethers.parseEther("1000"));

    // Transfer ownership of TreasuryToken to TreasuryVault
    await treasuryToken.transferOwnership(treasuryVaultAddress);
  });

  it("should have correct treasury name and owner", async function () {
    expect(await treasuryVault.treasuryName()).to.equal("TestVault");
    expect(await treasuryVault.whosOwner()).to.equal(owner.address);
  });

  it("should allow owner to approve a new token", async function () {
    await treasuryVault.newToken(treasuryTokenAddress);
    expect(await treasuryVault.approvedTokens(treasuryTokenAddress)).to.equal(true);
  });

  it("should open a new proposal", async function () {
    await treasuryVault.newToken(treasuryTokenAddress);
    await treasuryVault.proposalOpen(
      ethers.parseEther("100"),
      addr2.address,
      addr1.address,
      true,
      false,
      treasuryTokenAddress
    );
    expect(await treasuryVault.proposalCheck()).to.equal(1);
  });

  it("should allow deposit to proposal and track shares", async function () {
    await treasuryVault.newToken(treasuryTokenAddress);
    await treasuryVault.proposalOpen(
      ethers.parseEther("100"),
      addr2.address,
      addr1.address,
      true,
      false,
      treasuryTokenAddress
    );
    await treasuryToken.connect(addr1).approve(treasuryVaultAddress, ethers.parseEther("50"));
    await treasuryVault.connect(addr1).proposalDeposit(
      ethers.parseEther("50"),
      addr1.address,
      1
    );
    expect(await treasuryVault.totalShares(1)).to.be.above(0);
    expect(await treasuryVault.userDeposit(addr1.address, 1)).to.be.above(0);
  });

  it("should allow closing a proposal", async function () {
    await treasuryVault.newToken(treasuryTokenAddress);
    await treasuryVault.proposalOpen(
      ethers.parseEther("100"),
      addr2.address,
      addr1.address,
      true,
      false,
      treasuryTokenAddress
    );
    await treasuryVault.proposalClose(1);
  expect(await treasuryVault.closedProposal(1)).to.equal(true);
  });

  it("should allow user to withdraw from a proposal", async function () {
    await treasuryVault.newToken(treasuryTokenAddress);
    await treasuryVault.proposalOpen(
      ethers.parseEther("100"),
      addr2.address,
      addr1.address,
      true,
      false,
      treasuryTokenAddress
    );
    await treasuryToken.connect(addr1).approve(treasuryVaultAddress, ethers.parseEther("50"));
    await treasuryVault.connect(addr1).proposalDeposit(
      ethers.parseEther("50"),
      addr1.address,
      1
    );
    await treasuryVault.proposalClose(1);
    const beforeBalance = await treasuryToken.balanceOf(addr1.address);
    await treasuryVault.connect(addr1).proposalWithdraw(
      ethers.parseEther("25"),
      addr1.address,
      addr1.address,
      1
    );
    const afterBalance = await treasuryToken.balanceOf(addr1.address);
    expect(afterBalance - beforeBalance).to.equal(ethers.parseEther("25"));
  expect(await treasuryVault.userWithdrew(addr1.address, 1)).to.equal(ethers.parseEther("25"));
  });

  it("should allow user to join the treasury", async function () {
    await treasuryVault.newToken(treasuryTokenAddress);
    await treasuryToken.connect(addr1).approve(treasuryVaultAddress, ethers.parseEther("100"));
    await treasuryVault.connect(addr1).joinTreasury(
      treasuryTokenAddress,
      ethers.parseEther("100"),
      false,
      0
    );
    expect(await treasuryToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("1000"));
  });

  it("should return correct proposal details", async function () {
    await treasuryVault.newToken(treasuryTokenAddress);
    await treasuryVault.proposalOpen(
      ethers.parseEther("100"),
      addr2.address,
      addr1.address,
      true,
      false,
      treasuryTokenAddress
    );
  expect(await treasuryVault.proposalToken(1)).to.equal(treasuryTokenAddress);
  expect(await treasuryVault.proposalReceiver(1)).to.equal(addr2.address);
  expect(await treasuryVault.closedProposal(1)).to.equal(false);
  expect(await treasuryVault.executed(1)).to.equal(false);
  });

  it("should revert if non-owner tries to approve new token", async function () {
    await expect(
      treasuryVault.connect(addr1).newToken(treasuryTokenAddress)
    ).to.be.revertedWith("Not owner");
  });

  it("should revert deposit if proposal is closed", async function () {
    await treasuryVault.newToken(treasuryTokenAddress);
    await treasuryVault.proposalOpen(
      ethers.parseEther("100"),
      addr2.address,
      addr1.address,
      true,
      false,
      treasuryTokenAddress
    );
    await treasuryVault.proposalClose(1);
    await treasuryToken.connect(addr1).approve(treasuryVaultAddress, ethers.parseEther("50"));
    await expect(
      treasuryVault.connect(addr1).proposalDeposit(
        ethers.parseEther("50"),
        addr1.address,
        1
      )
    ).to.be.revertedWith("Proposal closed");
  });

  it("should revert withdraw if user has insufficient deposit", async function () {
    await treasuryVault.newToken(treasuryTokenAddress);
    await treasuryVault.proposalOpen(
      ethers.parseEther("100"),
      addr2.address,
      addr1.address,
      true,
      false,
      treasuryTokenAddress
    );
    await treasuryToken.connect(addr1).approve(treasuryVaultAddress, ethers.parseEther("50"));
    await treasuryVault.connect(addr1).proposalDeposit(
      ethers.parseEther("50"),
      addr1.address,
      1
    );
    await treasuryVault.proposalClose(1);
    await expect(
      treasuryVault.connect(addr1).proposalWithdraw(
        ethers.parseEther("100"),
        addr1.address,
        addr1.address,
        1
      )
    ).to.be.revertedWith("Insufficient deposit");
  });

  it("should revert joinTreasury if not approved token", async function () {
    await expect(
      treasuryVault.connect(addr1).joinTreasury(
        addr2.address, // not approved token address
        ethers.parseEther("100"),
        false,
        1
      )
    ).to.be.revertedWith("Token not approved");
  });
});
