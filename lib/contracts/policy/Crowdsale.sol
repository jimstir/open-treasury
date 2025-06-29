// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
/// @title Tokenized Treasury Share Ratio
/// @author @jimstir

import "./TreasuryVault.sol";
import "./TreasuryToken.sol";

contract Crowdsale {
    using SafeERC20 for IERC20;

    struct Escrow {
        address user;
        address token;
        uint256 amount;
        bool completed;
        bool refunded;
    }

    mapping(uint256 => Escrow) public escrows;
    mapping(uint256 => uint256) public newSale;
    mapping(uint256 => uint256) private _currentSale;
    
    uint256 private escrowId;
    address private _treasury;
    address private _token;
    uint256 private _ratio;
    bool private _openRound;
    uint256 private _treasuryId;
    uint256 private _prevRatio;

    event JoinRequested(address indexed user, address indexed token, uint256 amount, uint256 id);
    event ExchangeCompleted(address indexed user, uint256 id, uint256 amount);
    event TokenReturned(address indexed user, uint256 id, uint256 amount);
    event NewCrowd(uint256 proposal, uin256 crowdId);

    // Assign beginning ratio
    // The 
    constructor(IERC20 token, address treasury, uint256 ratio) {
        _treasury = treasury;
        _token = token;
        _ratio = ratio;
    }

    modifier owner(){
        require(TreasuryVault(_treasury).whosOwner == msg.sender);
    }
    // Returns current ratio approvaled by proposal, excluding first ratio
     function currentRatio () public view returns (unit256){
        return _ratio;
     }
    // Check if funding round is open
     function isOpenRound() public view returns (bool){
        return _openRound;
     }
     // Return the assigned treasury
     function isTreasury() public view returns (address){
        return _treasury;
     }
     // Return previous ratio
     
    // User deposits tokens into escrow, start process
    function joinRequest(address token, uint256 amount) external returns (uint256) {
        require(token != address(0), "Invalid token");
        require(amount > 0, "Amount must be > 0");
        require(_openRound == true);

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        _escrowId = _escrowId + 1;
        escrows[_escrowId] = Escrow({
            user: msg.sender,
            token: token,
            amount: amount,
            completed: false,
            refunded: false
        });

        emit JoinRequested(msg.sender, token, amount, escrowId);
        return escrowId;
    }

    // Complete the exchange, moving escrowed tokens to TreasuryVault and minting assets
    function completeExchange(uint256 id) external returns (bool) {
        Escrow storage esc = escrows[id];
        require(!esc.completed, "Escrow already settled");
        require(esc.amount > 0, "No escrow for id");

        // Transfer tokens to TreasuryVault
        IERC20(esc.token).safeApprove(_treasury, esc.amount);
        TreasuryVault(_treasury).depositTreasury(esc.token, address(this), esc.amount);

        // Mint assets to user (implement _mintAssets as needed)
        _mintAssets(esc.user, esc.amount);

        esc.completed = true;
        emit ExchangeCompleted(esc.user, id, esc.amount);
        return true;
    }

    // Allow user to reclaim their escrow if exchange is not completed
    function returnToken(uint256 id) external returns (bool) {
        Escrow storage esc = escrows[id];
        require(!esc.completed && !esc.refunded, "Escrow already settled");
        require(msg.sender == esc.user, "Not escrow owner");

        IERC20(esc.token).safeTransfer(esc.user, esc.amount);
        esc.refunded = true;
        emit TokenReturned(esc.user, id, esc.amount);
        return true;
    }

    // Mint treasuryToken when token is sent
    function _mintAssets(address user, uint256 amount) internal virtual {
        TreasuryToken(_token).mintTreasury(user, amount);
    }
    //Create new crowdsale id and treasuryVault new proposalId
    // Must be approved through proposal
    // Cost of one in USDC?
    function newSale(IERC20 token, uint256 capped, uint256 ratio)public virtual owner returns(bool){
        require(ratio > 0);
        
        // Add treasuryID to crowdsale Id
        uint256 proposal = TreasuryVault(_treasury).proposalOpen(token, amount, address(0));
        _prevRatio = _currentSale[treasuryId];
        _treasuryId = treasuryId + 1;
        _currentSale[treasuryId] = ratio;
        
        //newSale[proposal] = ratio;
        _capped = capped;
        _ratio = ratio;
        emit NewCrowd(proposal, newSale[proposal]);
    }
    // After Crowdsale id create new funding round if approved 
    function newCrowdsale(uint256 proposal)public virtual owner returns(){
        require(newSale[proposal] != 0);
        
        // Voting approval logic
        uint256 votes = TreasuryVault(_treasury).depositReceived(proposal);
        uint256 total = IERC20(_token).totalSupply();
        uint256 requiredApproval = (total * 75) / 100;
        require(votes >= requiredApproval);
        
        true = _openRound;
        emit openFunding(proposal);

    }

}