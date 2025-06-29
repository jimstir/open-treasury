// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../vault/TreasuryVault.sol";
import "../vault/TreasuryToken.sol";
import "../policy/JoinPool.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

contract Automate is AutomationCompatible {

    
    // Add these state variables
uint256 public startTime;
mapping(uint256 => uint256) public proposalStartTimes; // Track when each proposal was created

constructor(address policy, address treasury ){
        _policy = policy;
        _treasury = treasury;
}
// Required Chainlink Automation functions
function checkUpkeep(
    bytes calldata /* checkData */
) external view override returns (bool upkeepNeeded, bytes memory performData) {
    // Check if any proposal has passed the voting period
    // This is a simplified example - you'll need to implement your specific logic
    upkeepNeeded = (block.timestamp > startTime + 1 hours);
    performData = abi.encode(0); // Encode the proposal ID that needs processing
}

function performUpkeep(
    bytes calldata performData
) external override {
    // Decode the performData to get the proposal ID
    uint256 proposalId = abi.decode(performData, (uint256));
    
    // Process the proposal
    if (checkVote(proposalId)) {
        // Determine which function to call based on the proposal type
        // You might need to add a mapping to track proposal types
        JoinPool(_policy).voting(proposalId);
    }
}

// Update the checkVote function
function checkVote(uint256 proposal) public virtual returns(bool){
    bool timePassed = block.timestamp > proposalStartTimes[proposal] + 1 hours;
    bool isApproved = proposalStatus[proposal];
    
    if(timePassed && isApproved){
        return true;
    }
    return false;
}

// Fix the poolRequest function
function poolRequest(uint256 proposal) public virtual returns(bool){
    require(checkVote(proposal), "Proposal not approved or voting period not ended");
    JoinPool(_policy).addPool(proposal);
    return true;
}
    
    
    
    
    
    
    
    
    address private _policy;
    address private _treasury;

    
    mapping(uint256 => bool) public proposalStatus;

    

    // Current proposals needed to automate

    // Register a new task + set time for proposal number vote status
    // 
    function checkVote(uint256 proposal) public virtual returns(bool){
        bool timePassed = block.timestamp > startTime + 1 hours;
        
        true = proposalStatus[proposal];
        if(timePassed){
            JoinPool(_policy).voting(proposal);
            return true;
        }
        return false;
    }
    // On approval for adding a new pool, fulfill request, exCall to change state,( make txns)
    function poolRequest(uint256 proposal) public virtual returns(bool){
        require(checkVote(proposal));

        JoinPool(policy).addPool(proposal);
    }
    // On approval for adding new funds, fullfill request
    function fundsRequest(uint256 proposal) public virtual returns(bool){
        require(checkVote(proposal));
        JoinPool(_policy).joinPool(proposal);
    }
    //
}