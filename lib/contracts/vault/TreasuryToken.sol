// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TreasuryToken is ERC20, Ownable {
    
    constructor(
        string memory name, 
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        // _mint(msg.sender, initialSupply);   
    }
    
    // Transfer ownership to the treasury contract
    function initTreasury(address newOwner) external onlyOwner returns(bool) {
        require(totalSupply() > 0, "No tokens minted");
        transferOwnership(newOwner);
        return true;
    }

    /// @notice Mint new tokens to an account (onlyOwner)
    /// @param to The address to receive the minted tokens
    /// @param amount The amount of tokens to mint
    function mintTreasury(address to, uint256 amount) public onlyOwner returns(uint256) {
        _mint(to, amount);
        return amount;
    }
}
