// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITreasuryToken {
    function initTreasury(address newOwner) external returns (bool);
    function mintTreasury(address to, uint256 amount) external returns (uint256);
}
