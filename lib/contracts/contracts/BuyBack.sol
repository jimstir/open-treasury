// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
/// @title Buyback treasuryToken from treasury funds.

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/ITreasuryToken.sol";
import "../interfaces/ITreasuryVault.sol";

contract BuyBack {
    
    uint256 constant PRECISION = 1e18;
    
    struct Buys{
        uint256 period; // 
        uint256 total; //totall allowed to be swapped for this period
        uint256 purchased; // total swapped for this period
        uint256 amountAddrs; //the total allowed to be swapped per user
        uint256 price; // price of the buyback (treasuryTokens received per deposited token * 1e18)
        IERC20 token;
    }

    struct Swap{
        uint256 proposal; // the number the deposit was made for
        uint256 amount; // the amount deposited
        bool complete; // token with drawn
        
    }

    address private _treasury;
    address private _owner;
    uint256 private _period;
    uint256 private _proposal; // Last opend proposal
    IERC20 private _token; // treasuryToken

    mapping(uint256 => Buys) internal buying;
    mapping(uint256 => bool) internal proposals;
    mapping(uint256 => mapping(address => bool)) internal executed;
    mapping(address => Swap) internal buyBack;

    constructor(address treasury, IERC20 treasuryToken) {
        
        _treasury = treasury;
        _token = treasuryToken;
    }

    modifier onlyOwner(){
        require(ITreasuryVault(_treasury).whosOwner() == msg.sender, "Only the treasury owner.");
        _;
    }

    //Check if buyback period is open
    function checkPeriod() public view returns(bool){
        return(block.timestamp <= _period);
    }
    // Check if proposal was open by buyBack servce
    function checkProposal(uint256 proposal) public view returns(bool){
        return(proposals[proposal]);
    }
    //Check treasury address
    function treasuryAddrs()public view returns(address){
        return(_treasury);
    }
    //Check the amount purchased so far for proposal
    function checkFunds(uint256 proposal)public view returns(uint256){
        IERC20 token = buying[proposal].token;
        return token.balanceOf(address(this));
    }
    //Check if buyback service has funds
    function checkPurchased(uint256 proposal)public view returns(uint256){
        return buying[proposal].purchased;
    }
    //Swap treasuryToken with proposed token in buy period
    function startSwap(uint256 amount, uint256 proposal) external returns(uint256){
        
        Buys storage buy = buying[proposal];
        require(buy.period > block.timestamp, "The time period to swap has passed");
        require(buy.amountAddrs >= amount, "Amount exceeds per user limit");
        require(buy.purchased + amount <= buy.total, "User has reached total swap amount");
        require(_token.balanceOf(msg.sender) >= amount, "Insufficient treasyTokens");

        // Check if proposal was closed early
        require(!ITreasuryVault(_treasury).closedProposal(proposal), "The proposal has been closed");
        
        //require(!executed[proposal][msg.sender], "Already executed for this proposal");
        Swap storage swaps = buyBack[msg.sender];
        // executed[proposal][msg.sender] = true;
        swaps.amount = amount;
        swaps.complete = false;
        swaps.proposal = proposal;

        SafeERC20.safeTransferFrom(_token, msg.sender, address(this), amount);
        
        return proposal;
        
    }
    //Collect awarded tokens after startSwap
    function collectSwap(uint256 proposal) external returns(uint256){
        require(proposals[proposal], "Invalid proposal");
        require(buyBack[msg.sender].proposal == proposal, "Did not start swap for this proposal");
        require(!buyBack[msg.sender].complete, "Swap already completed");
        
        uint256 amount = buyBack[msg.sender].amount;
        require(amount <= buying[proposal].amountAddrs, "Amount exceeds per user limit");
        
        uint256 rewardAmount = (amount * buying[proposal].price) / PRECISION; //
        IERC20 token = buying[proposal].token;
        require(token.balanceOf(address(this)) >= rewardAmount, "Insufficient contract balance for reward");
        
        buyBack[msg.sender].complete = true;
        buying[proposal].purchased += amount;
        
        SafeERC20.safeTransfer(token, msg.sender, rewardAmount);
        return rewardAmount;
    }
    // Open new proposal to start buy back round(openProposal)
    // no open proposal using all of the treasury funds for specific assets
    // if open buy period end and request new
    function newBuy(uint256 amount, uint256 time, uint256 per, uint256 price, IERC20 token) external onlyOwner returns(uint256){
        //require(msg.sender == _owner, "Only owner can start new buy");
        require(time > block.timestamp, "End time must be in future");
        require(_period < time, "The new time must be after the current period");
        
        uint256 proposal = ITreasuryVault(_treasury).proposalOpen(amount, address(this), msg.sender, true, false, token);
        Buys storage buy = buying[proposal];
        proposals[proposal] = true;
        _proposal = proposal;
        
        buy.period = time;
        buy.amountAddrs = per;
        buy.price = price;
        buy.total = amount;
        buy.token = token;

        return proposal;
    }
    
    // Send approved amount to the buyBack service
    function receiveFunds(uint256 proposal) external onlyOwner returns(uint256){
        require(proposals[proposal]);
        //require(msg.sender == _owner);

        _period = buying[proposal].period;
        ITreasuryVault(_treasury).proposalApproved(proposal);
        return _period;
    }
    // Send treasuryToken to treasury + end current buy period
    // (returnFunds)
    function withdrawToken(uint256 amount) external onlyOwner returns(bool){
        //require(msg.sender == _owner, "Only owner can withdraw");
        require(amount <= IERC20(_token).balanceOf(address(this)), "Insufficient balance");

        ITreasuryVault(_treasury).proposalClose(_proposal);
        ITreasuryVault(_treasury).depositTreasury(_token, address(this), amount);
        return true;
    }
  
}