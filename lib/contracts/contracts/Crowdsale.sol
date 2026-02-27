// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
/// @title Crowdsale
/// @author @jimstir

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/ITreasuryToken.sol";
import "../interfaces/ITreasuryVault.sol";

contract Crowdsale {
    
    uint256 constant PRECISION = 1e18;
    
    struct Sale{
        uint256 period; // time period for this crowdsale
        uint256 total; //total allowed to be minted for this period
        uint256 minted; // total minted for this period
        uint256 price; // price of the crowdsale (treasuryTokens received per deposited token * 1e18)
    }

    struct Swap{
        uint256 proposal; // the number the deposit was made for
        uint256 amount; // the amount deposited
        bool complete; // treasuryToken minted and sent
        IERC20 token; // token being used
        
    }

    address private _treasury;
    IERC20 private _treasuryToken;
    uint256 private _period; // current crowdsale period
    uint256 private _proposal; // Last opened proposal
    address private _owner;
    uint256 private _num; //the current token list number

    mapping(uint256 => Sale) internal selling;
    mapping(uint256 => bool) internal proposals;
    //mapping(uint256 => mapping(address => bool)) internal executed;
    mapping(address => Swap) internal crowdSale;
    mapping(IERC20 => bool) internal checkToken;
    mapping(uint256 => IERC20) internal tokenList;

    constructor(address treasury, IERC20 treasuryToken) {
        
        _treasury = treasury;
        _treasuryToken = treasuryToken;
       
    }

    modifier onlyOwner(){
        require(ITreasuryVault(_treasury).whosOwner() == msg.sender, "Only the treasury owner.");
        _;
    }

    //Check if crowdsale period is open
    function checkPeriod() public view returns(bool){
        return(block.timestamp <= _period);
    }
    // Check if proposal was open by crowdsale service
    function checkProposal(uint256 proposal) public view returns(bool){
        return(proposals[proposal]);
    }
    //Check treasury address
    function treasuryAddrs()public view returns(address){
        return(_treasury);
    }
    //Check find token in list
    function checkTokenList(uint256 num)public view returns(IERC20){
        return (tokenList[num]);
    }
    //Check token is in list
    function checkIfToken(IERC20 token)public view returns(bool){
        return (checkToken[token]);
    }
    //Check amount of tokens minted by crowdsale service for a proposal
    function checkMinted(uint256 proposal)public view returns(uint256){
        return selling[proposal].minted;
    }
    //Deposit any IERC20 token and get newly minted treasuryToken in exchange
    function startSwap(uint256 amount, IERC20 token) external returns(uint256){
        require(!ITreasuryVault(_treasury).closedProposal(_proposal));

        Sale storage sale = selling[_proposal];
        require(sale.period > block.timestamp, "The time period to swap has passed");
        require(sale.minted < sale.total, "User has reached total mint amount");
        require(token.balanceOf(msg.sender) >= amount, "Insufficient token balance");

        Swap storage swaps = crowdSale[msg.sender];
        swaps.amount = amount;
        swaps.complete = false;
        swaps.proposal = _proposal;
        swaps.token = token;

        if(!checkToken[token]){
            checkToken[token] = true;
            _num = _num + 1;
            tokenList[_num] = token;
        }

        SafeERC20.safeTransferFrom(token, msg.sender, _treasury, amount);
        
        return _proposal;
        
    }
    //Collect minted treasuryToken after startSwap
    function collectSwap(uint256 proposal) external returns(uint256){
        require(proposals[proposal], "Proposal not opened by crowdsale proposal");
        require(crowdSale[msg.sender].proposal == proposal, "Did not start swap for this proposal");
        require(!crowdSale[msg.sender].complete, "Swap already completed");
        
        uint256 amount = crowdSale[msg.sender].amount;
        
        uint256 mintAmount = (amount * selling[proposal].price) / PRECISION;
        require(selling[proposal].minted + mintAmount < selling[proposal].total, "Exceeds total mint limit");
        
        crowdSale[msg.sender].complete = true;
        selling[proposal].minted += mintAmount;
        
        ITreasuryToken(address(_treasuryToken)).mintTreasury(msg.sender, mintAmount);
        return mintAmount;
    }
    // Open new proposal to start crowdsale round
    // The amount is placed to zero, as no funds are being with drawn
    // token address is set to treasyToken
    function newSale(uint256 time, uint256 price, bool vote, uint256 max) external onlyOwner returns(uint256){
        require(time > block.timestamp, "End time must be in future");
        
        uint256 proposal = ITreasuryVault(_treasury).proposalOpen(0, address(this), msg.sender, vote, false, _treasuryToken);
        Sale storage sale = selling[proposal];
        proposals[proposal] = true;
        _proposal = proposal;
        
        sale.period = time;
        sale.price = price + 1;
        sale.total = max;
        
        return proposal;
    }
    
    // Send approved amount to the crowdsale service
    function receiveFunds(uint256 proposal) external onlyOwner returns(uint256){
        require(proposals[proposal]);

        _period = selling[proposal].period;
        ITreasuryVault(_treasury).proposalApproved(proposal);
        return _period;
    }
  
}