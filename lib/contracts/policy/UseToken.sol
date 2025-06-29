// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
/// @title Collateral based Treasury Proposal
/// @author @jimstir

contract UseToken {
     constructor(address _owner, string memory _name) {
        owner = _owner;
        name = _name;
        emit Success(owner, name);
    }

    // Deposit token to proposal for Locking
    // inform the user that tokens will be locked for (n) duration
    function deposit(uint256 assets, address receiver) public view returns(uint256){

    }
    // Afterlock period complete. A closed proposal that failed or was canceled 
    // Withdraw goverance token
    function withdraw(uint256 assets, address receiver) public view returns(uint256){

    }
    // Create a new proposal
    function proposal()public view returns(uint256){

    }
    // End a proposal early, before predefined time
    function endProposal() public view returns(uint256){

    }
    // Voting Logic
    // Vote on a an open proposal
    function vote() public view returns(uint256){

    }
    // 
}
