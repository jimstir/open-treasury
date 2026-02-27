// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ITreasuryVault {

    function whosOwner() external view returns (address);
    function treasuryName() external view returns (string memory);
    function proposalCheck() external view returns (uint256);
    function getAuth(address user) external view returns (bool);
    function userDeposit(address user, uint256 proposal) external view returns(uint256);
    function userWithdrew(address user, uint256 proposal) external view returns(uint256);
    function userNumOfProposal(address user) external view returns(uint256);
    function userProposal(address user, uint256 proposal) external view returns(uint256);
    function proposalToken(uint256 proposal) external view returns(address);
    function proposalWithdrew(uint256 proposal) external view returns(uint256);
    function proposalReceiver(uint256 proposal) external view returns(address);
    function proposalReceived(uint256 proposal) external view returns(uint256);
    function totalShares(uint256 proposal) external view returns(uint256);
    function closedProposal(uint256 proposal) external view returns(bool);
    function executed(uint256 proposal) external view returns(bool);
    function proposalDeposit(uint256 assets, address receiver, uint256 proposal) external returns (uint256);
    function proposalMint(uint256 shares, address receiver, uint256 proposal) external returns(uint256);
    function proposalWithdraw(uint256 assets, address receiver, address owner, uint256 proposal)external returns(uint256);
    function proposalRedeem(uint256 shares, address receiver, address owner, uint256 proposal) external returns(uint256);
    function proposalOpen(uint256 amount, address receiver, address owner, bool rate, bool request, IERC20 token) external returns (uint256);
    function proposalClose(uint256 proposal) external returns (bool);
    function vote(uint256 proposal) external returns(bool);
    function proposalApproved(uint256 proposal)external returns(bool);
    function depositTreasury(IERC20 token, address sender, uint256 amount) external returns(bool);






}