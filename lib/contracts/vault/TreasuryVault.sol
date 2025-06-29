// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
/// @title Tokenized Treasury
/// @author @jimstir


import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ITreasuryToken.sol"; // Use interface for cross-contract calls


contract TreasuryVault is ERC4626 {
    /// @dev proposals event
    event proposals(
        address indexed token,
        uint256 indexed proposalNum,
        uint256 indexed amount,
        address recipient
    );
    /// @dev owner deposit event
    event depositCom(
        address indexed token,
        uint256 indexed amount,
        uint256 indexed time,
        uint256 count
    );

    struct ownerAccount{
        //count => timestamp
        uint256 time;
        //count => token
        address token;
        // timestamp? count => amount
        uint256 deposit;
    }

    struct userAccount{
        //user => specifc numOfProposals by user => corensanding ProposalNum ex. 1st vote is proposal number 5, second vote is proposal number 7
        uint256 proposal;
        //user => proposalNum => amount
        uint256 deposit;
        uint256 withdrew;
    }

    struct proposalAccount{
        //proposalNum -> tokenAddress
        address token;
        //proposal => amount
        uint256 withdrew;
        address receiver;
        uint256 received;
    }

    address private _rOwner;
    //number of opened proposals
    uint256 private _proposalNum;
    // count of ownerDeposits
    uint256 private _ownerDeposits;
    string private _name;
    IERC20 private _treasuryToken;

    mapping(address => bool) private _authUsers;
    mapping(uint256 => uint256) private _totalShares;
    mapping(uint256 => bool) private _closedProposals;

    //cause of doulble mapping, numOfProposal might not work***, keep value a uint256 (0)
    mapping(address => mapping(uint256 => userAccount)) internal userBook;
    mapping(uint256 => ownerAccount) internal ownerBook;
    mapping(uint256 => proposalAccount) internal proposalBook;
     
    constructor(string memory resName, IERC20 tToken, string memory name, string memory symbol) ERC20(name, symbol) ERC4626(tToken){
        _rOwner = msg.sender;
        _name = resName;
        _treasuryToken = tToken; 
    }

    /**
    * @dev Primary authorized user modifier
    */
    modifier auth(){
        require(msg.sender == _rOwner);
        _;
    }
    
    /**
    * @dev Get the treasury name
    * 
    */
    function treasuryName() public view returns (string memory){
        return _name;
    }
    /**
    * @dev Get the treasury owner
    * 
    */
    function whosOwner() public view returns (address){
        return _rOwner;
    }
    /// @notice 
    /** @dev Check current total of opened proposals
    * @return uint256
    */ 
    function proposalCheck() public view returns (uint256) {
        return _proposalNum;
    }
    /**
    * @dev Authorized users of the treasury
    */
    function getAuth(address user) public view returns (bool){
        return _authUsers[user];
    }
    /** 
    * @dev Get number of deposits made to treasury by the user
    * - MUST BE deposits made by calling depositTreasury function
    */
    function accountCheck() public view returns (uint256){
        return _ownerDeposits;
    }
    /** 
    * @dev Get time of a deposit made to treasury by a user
    * @param count Number matching deposit
    * @return block.timestamp format
    */
    function depositTime(uint256 count) external view returns (uint256){
        return ownerBook[count].time;
    }
    /** 
    * @dev Get amount deposited to treasury by a user
    * @param count Number of deposit
    * @return uint256 number of any asset that were deposited
    */
    function ownerDeposit(uint256 count) external view returns(uint256){
        return ownerBook[count].deposit;
    }
    /**
    * @dev Token type deposited to contract by the owner
    * @param count Number of deposit
    * - MUST be an address of ERC20 token
    */
    function tokenDeposit(uint256 count) external view returns(address){
        return ownerBook[count].token;
    }
    /**
    * @dev Amount deposited for share of proposal by the user
    * - MUST be an ERC20 address
    * @param user address of user
    * @param proposal number of the proposal the user deposited
    */
    function userDeposit(address user, uint256 proposal) public view returns(uint256){
        return userBook[user][proposal].deposit;
    }
    /**
    * @dev Amount withdrawn from given proposal by the user
    * @param user address of user
    * @param proposal number of the proposal the user withdrew
    */
    function userWithdrew(address user, uint256 proposal) public view returns(uint256){
        return userBook[user][proposal].withdrew;
    }
    /**
    * @dev The total number of proposals joined by the user
    * @param user address of user
    */
    function userNumOfProposal(address user) public view returns(uint256){
        return userBook[user][0].proposal;
    }
    /**
    * @dev The proposal number from the specific proposal joined by the user
    * @param user address of user
    * @param proposal the number the user was apart of
    * MUST NOT be zero
    */
    function userProposal(address user, uint256 proposal) public view returns(uint256){
        return userBook[user][proposal].proposal;
    }
    /**
    * @dev Token used for given proposal
    * - MUST be ERC20 address
    * @param proposal number for requested token
    * @return token address
    */
    function proposalToken(uint256 proposal) external view returns(address){
        return proposalBook[proposal].token;
    }
    /**
    * @dev Amount withdrawn for given proposal
    */
    function proposalWithdrew(uint256 proposal) external view returns(uint256){
        return proposalBook[proposal].withdrew;
    }
    /**
    * @dev The receiver for given proposal
    */
    function proposalReceiver(uint256 proposal) external view returns(address){
        return proposalBook[proposal].receiver;
    }
    /**
    * @dev The receiver for given proposal
    */
    function proposalReceived(uint256 proposal) external view returns(uint256){
        return proposalBook[proposal].received;
    }
    /**
    * @dev Total shares issued for a given proposal
    * NOTE: Number does not change after proposal closed and shares are redeemed
    */
    function totalShares(uint256 proposal) public view returns(uint256){
        return _totalShares[proposal];
    }
    /**
    * @dev Check if proposal is closed
    * @return true if closed
    */
    function closedProposal(uint256 proposal) public view returns(bool){
        return _closedProposals[proposal];
    }
    /**
    * @dev SafeAdd function
    */
    function add(uint256 a, uint256 b) internal pure returns(uint256){
        return a + b;
    }
    /**
    * @dev Make a deposit to proposal creating new shares
    * - MUST be open proposal
    * - MUST NOT be a proposal that was previously closed
    * NOTE: using the deposit() will cause shares to not be accounted for in a proposal
    * @param assets amount being deposited
    * @param receiver address of depositor
    * @param proposal number associated proposal
    */
    function proposalDeposit(uint256 assets, address receiver, uint256 proposal) public virtual returns (uint256) {
        require(!closedProposal(proposal));
        require(proposalCheck() >= proposal);

        uint256 shares;
        
        shares = deposit(assets, receiver);
        _totalShares[proposal] = add(totalShares(proposal), shares);
        
        uint256 cc = userNumOfProposal(msg.sender) + 1;
        userBook[receiver][proposal].deposit = add(userDeposit(receiver, proposal), shares);
        userBook[msg.sender][0].proposal = cc;
        userBook[msg.sender][cc].proposal = proposal;
        return shares;
    }
    /**
    * @dev Make a deposit to proposal creating new shares
    * - MUST account for proposalNumber
    * - MUST have proposalNumber
    * NOTE: using the mint() will cause shares to not be accounted for in a proposal
    * @param shares amount being deposited
    * @param receiver address of depositor
    * @param proposal number asscoiated proposal
    */
     function proposalMint(uint256 shares, address receiver, uint256 proposal) public virtual returns(uint256){
         require(!closedProposal(proposal));
         require(proposalCheck() <= proposal);

         uint256 assets = mint(shares, receiver);
         _totalShares[proposal] = add(totalShares(proposal), assets);

         uint256 cc = userNumOfProposal(msg.sender) + 1;
         userBook[receiver][proposal].deposit = add(userDeposit(receiver, proposal), assets);
         userBook[msg.sender][0].proposal = cc;
         userBook[msg.sender][cc].proposal = proposal;

         return assets;
    }
    /**
    * @dev Burn shares, receive 1 to 1 value of assets
    * - MUST have closed proposalNumber
    * - MUST NOT be userWithdrew amount greater than userDeposit amount
    */
    function proposalWithdraw(uint256 assets, address receiver, address owner, uint256 proposal)public virtual returns(uint256){
        require(closedProposal(proposal));
        require(userWithdrew(receiver, proposal) >= userDeposit(receiver, proposal));
    
        uint256 shares = withdraw(assets, receiver, owner);
        userBook[receiver][proposal].withdrew = add(userWithdrew(receiver, proposal), shares);
        
       return shares;
    }
    /**
    * @dev Burn shares, receive 1 to 1 value of assets
    * - MUST have open proposal number
    * - MUST have user deposit greater than or equal to user withdrawal
    * NOTE: using ERC 4626 redeem() will not account for proposalWithdrawal
    */
    function proposalRedeem(uint256 shares, address receiver, address owner, uint256 proposal) public virtual returns(uint256){
        require(closedProposal(proposal));
        require(userWithdrew(receiver, proposal) <= userDeposit(receiver, proposal));

        uint256 assets = redeem(shares, receiver, owner);
        userBook[receiver][proposal].withdrew = add(userWithdrew(receiver, proposal), assets);

        return assets;
    }
    /**
    * @dev Issue new proposal
    * - MUST create new proposal number
    * - MUST account for amount to be withdrawn 
    * @param token address of ERC20 token
    * @param amount token amount being withdrawn
    * @param receiver address of token recipent
    */
    function proposalOpen(address token, uint256 amount, address receiver) external virtual returns (uint256){
        
        uint256 num = proposalCheck() + 1;
        proposalBook[num].token = token;
        proposalBook[num].withdrew = amount;
        proposalBook[num].receiver = receiver;
        _proposalNum = num;
        
        emit proposals(token, _proposalNum, amount, receiver);
        return(_proposalNum);
    }
    /**
    * @dev Close an opened proposal
    * - MUST account for amount received
    * - MUST proposal must be greater than current proposal
    * @param token address of ERC20 token
    * @param proposal number of desired proposal to close
    * @param amount number assets being received
    */
    function proposalClose(address token, uint256 proposal, uint256 amount) external virtual returns (bool){
        //require(getAuth(msg.sender));
        require(proposalCheck() >= proposal);
        require(!closedProposal(proposal));
        
        SafeERC20.safeTransferFrom(IERC20(token), msg.sender, address(this), amount);
        _closedProposals[proposal] = true;
        proposalBook[proposal].received = amount;

        emit proposals(token, proposal, amount, msg.sender);
        return true; 
    }
    /**
    * @dev Accounting for tokens deposited by any user
    * - MUST be contract owner
    * NOTE: No shares are issued, funds can not be redeemed. Only withdrawn from proposalOpen
    * @param token address of ERC20 token
    * @param sender address of where tokens from
    * @param amount number of assets being deposited
    */
    function depositTreasury(address token, address sender, uint256 amount) external virtual {
        require(token != address(0), "Invalid token address");
        require(sender != address(0), "Invalid sender address");
        require(amount > 0, "Amount must be greater than zero");
        
        SafeERC20.safeTransferFrom(IERC20(token), sender, address(this), amount);

        uint256 time = block.timestamp;
        uint256 cc = accountCheck() + 1;
        ownerBook[cc].deposit = amount;
        ownerBook[cc].time = time;
        ownerBook[cc].token = token;
        _ownerDeposits = cc;
            
        emit depositCom(token, amount, time, cc);  
    }
    // Approve a policy contract to transfer tokens for approved proposals
    // Policy must be deployed, than approved in a vote
    //***** Check 
    function policyApproved(address policy, IERC20 token, uint256 amount)public virtual returns(bool){
        IERC20(token).approve(policy, amount);
        return true;
    }
    // Initiate the treasury, by removing the treasury owner as an owner of token contract.
    // Make treasury only owner of token contract.
    function initTreasury(address newOwner) external virtual auth returns (bool) {
        ITreasuryToken(address(_treasuryToken)).initTreasury(newOwner);
        return true;
    }
    

}
