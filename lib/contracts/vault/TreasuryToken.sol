// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
//import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract TreasuryToken is ERC20 {
    
    mapping(address => bool) private _owner;
    address private _rOwner;
    
    constructor(string memory name, string memory symbol ) ERC20(name, symbol) {
        _owner[msg.sender] = true;
        _rOwner = msg.sender;
    }

    modifier auth(){
       require(_owner[msg.sender]);
        _;
    }

    // Remove the treasury owner as an owner of token contract
    // Make treasury only owner
    function initTreasury(address newOwner)external auth virtual returns(bool) {
        require(totalSupply() == 0);
        _owner[_rOwner] = false;
        _owner[newOwner] = true;
        if(_owner[_rOwner]){
            return false;
        }
        return true;
    }
    /// @notice Mint new tokens to an account (onlyOwner)
    /// @param to The address to receive the minted tokens
    /// @param amount The amount of tokens to mint
    function mintTreasury(address to, uint256 amount) public auth virtual returns(uint256) {
        _mint(to, amount);
        return amount;
    }

    //Add an authorized user
    function addAuth(address authUser) external auth virtual {
        _owner[authUser] = true;
    }
    
}

