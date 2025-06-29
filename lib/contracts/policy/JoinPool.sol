// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../vault/TreasuryVault.sol";
import "../vault/TreasuryToken.sol";
import "../interfaces/ILendingPool.sol";
import "../interfaces/IAToken.sol";

contract JoinPool {

    event newFunds();
    event newPool();
    event Success(IERC20 token, address treasury);
    event JoinedPool(address indexed user, address indexed pool, address indexed aToken, uint256 amount);
    event LeftPool(address indexed user, address indexed pool, address indexed aToken, uint256 amount);

    
    struct Requests {
        uint256 time;
        //uint256 requestId;
        uint256 amount;
        address pool;
        IERC20 token;
        bool open;
    }

    // Search by proposalId from TreasuryVault
    // Search by treasury uint256 proposal;
    mapping(uint256 => Requests) public request;
    mapping(uint256 => uint256) public requestId;
    mapping(address => uint256) private _pools;

    uint256 private _numPool;
    uint256 private _reqId;
    address private _treasury;
    IERC20 private _token;
    uint256 private _policyNum;

    constructor(IERC20 token, address treasury) {
        _treasury = treasury;
        _token = address(token);
        emit Success(_token, _treasury);
    }

    // Check if vote is open 
    function isOpen(uint256 proposal) public view returns(bool){
        Requests storage req = request[proposal];
        if(req.open){
            return true;
        }
        return false;
    }
   
    //Verify a pool address is approved 
    function verifyPool(address pool) public view returns(bool){
        if(_pools[pool] != 0){
            return true;
        }
        return false;
    }
    // Voting logic for adding new pool address and add new funds to approved pool
    function voting(uint256 proposal) internal virtual returns(bool){
        
        uint256 votes = TreasuryVault(_treasury).depositReceived(proposal);
        uint256 total = IERC20(_token).totalSupply();
        uint256 reqApproval = (total * 75) / 100;
        
        if(votes >= reqApproval){
            return true;
        }
        return false;

    }
    // Should be first proposal of policy 
    // If not done, deployed contract will not be able to send tokens from treasury
    // This contract/policy must be deployed before initial vote
    function approvePolicy() public virtual returns(bool){
        require(_policyNum == 0);

        uint256 proposal = TreasuryVault(_treasury).proposalOpen(token, amount, address(0) );
        _policyNum = proposal;
    }
    //After policy is approved, give policy/contract approval to transfer
    // 
    function policyApproved() public virtual returns(bool){
        require(_policyNum == 0);
        require(voting(_policyNum));
        

        bool res = TreasuryVault(_treasury).policyApproved();
        return res;
    }
    // Create requestId to add new pool address, must be approved by treasury
    function poolReq(address pool) public virtual returns (address){
        require(verifyPool(pool));
        
        uint256 proposal = TreasuryVault(_treasury).proposalOpen(address(0), 0, pool );
        Requests storage req = request[proposal];
        //*when is this used?
        _reqId = _reqId + 1;
        
        req.pool = pool;
        req.token = address(0);
        req.time = 0;
        req.amount = 0;
        req.open = true;

        
        emit newPool();
    }
    // Create requestID to add new funds to an approved pool
    function fundsReq(address pool, uint256 time, uint256 amount, uint256 token)public virtual returns(address){
        require(verifyPool(pool));
        
        uint256 proposal = TreasuryVault(_treasury).proposalOpen(token, amount, pool);
        Requests storage req = request[proposal];
        // is this needed, when used?
        _reqId = _reqId + 1;

        req.amount = amount;
        req.pool = pool;
        req.time = time;
        req.token = token;
        req.open = true;
        
        emit newFunds();
    }
    // Once vote approved, add pool to approved pool list
    // Check if request and proposal match
    function addPool(uint256 proposal)public virtual returns(address){
        require(voting(proposal), "Pool has not been approved!");
        Requests storage req = request[proposal];
        require(req.pool != 0, "This proposal is not a Add pool request");
        require(proposal != _pools[req.pool], "Pool is already added!");
        
        req.open = false;
        _pools[req.pool] = proposal;
        return req.pool;
    }
    // Join Aave pool: deposit tokens, receive aTokens
    function joinPool(uint256 proposal, address lendingPool, address aToken) public virtual returns(bool) {
        require(voting(proposal), "Adding of new Funds have not been approved");
        Requests storage req = request[proposal];
        require(req.pool != address(0), "This proposal is not a valid request");
        require(IERC20(address(req.token)).transferFrom(_treasury, address(this), req.amount), "Treasury transfer failed");

        IERC20(address(req.token)).approve(lendingPool, req.amount); 

        ILendingPool(lendingPool).deposit(address(req.token), req.amount, address(this), 0);

        req.open = false;
        emit JoinedPool(msg.sender, req.pool, aToken, req.amount);
        return true;
    }
    
    // Leave Aave pool: withdraw aTokens, send underlying to recipient
    function leavePool(uint256 proposal, address lendingPool, address aToken, uint256 amount) public virtual returns(bool) {
        Requests storage req = request[proposal];
        require(!req.open, "Request not yet joined");
        require(amount > 0 && amount <= IAToken(aToken).balanceOf(address(this)), "Invalid aToken amount");

        ILendingPool(lendingPool).withdraw(address(req.token), amount, _treasury);

        emit LeftPool(msg.sender, req.pool, aToken, amount);
        return true;
    }
    //track aToken balance?
    function aTokenBalance(address aToken) public view returns (uint256) {
        return IAToken(aToken).balanceOf(address(this));
    }
   
}