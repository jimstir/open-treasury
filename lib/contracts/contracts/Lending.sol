// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
/// @title Lending from treasury for shareholders 
/// @author @jimstir

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/ITreasuryToken.sol";
import "../interfaces/ITreasuryVault.sol";


contract Lending {
    using SafeERC20 for IERC20;

    event CollateralDeposited(address indexed user, uint256 amount, uint256 numberLoan);
    event LoanTaken(address indexed user, uint256 amount);
    event PaymentMade(address indexed user, uint256 amount);
    event CollateralWithdrawn(address indexed user, uint256 amount);
    event NewProposal(uint256 num, uint256 amount);
    event CollectFunds(uint256 proposal, uint256 amount);

    struct Loan {
        uint256 loanNum; //the depositNum or LoanNum for user
        uint256 collateralAmount; // the amount in collateral deposited
        uint256 loanAmount;
        uint256 startTime;
        bool closed; // is loan closed/repaid
        bool open; // Loan taken
        uint256 payments; // The amount to be paid monthly 
        uint256[] paymentMade;
        uint256 amountPaid; // total monthly payments made by the user
        bool collateralWithdrawn;
        IERC20 token; // token used in collateral
        IERC20 loanToken; // the token being sent to a user in takeLoan
    }

    struct LoanProposal{
        uint256 numProposal; // increment the number of openPrposal request
        uint256 treasuryProposal; // the proposal number on the tresury contract
        uint256 amount; // token amount requesting to be transfered 
        uint256 time; // the minuim time allowed for an loan amount from a proposal to be open
        //bool executed; // the funds have been transfered to lending
    }

    struct Funds{
        uint256 available;
        uint256 owed;
        uint256 returned;
        uint256 deposit;
        uint256 dispersed;
    }

    uint256 private _requests;
    address private _owner;
    // 3% = 300
    uint256 private _interestRate;
    uint256 private _currentQueue;
    address private _treasury;
    uint256 public proposalDuration; // the duration until approved to return funds
    uint256 private _lendingNum; // number of request to open new treausry proposal
    Funds private _funds;
    address private _token; // treasury token

    mapping(address => mapping(uint256 => Loan)) private _loans; // Loan accounting
    mapping(uint256 => LoanProposal) private _proposals; //Proposal accounting
    mapping(address => uint256) private _userNum; // the number of collateral deposits made by a user, use
    mapping(address => mapping(uint256 => bool)) public monthlyPayments;
    mapping(uint256 => bool) private _lendingProposal; // is proposal from lending service
    mapping(IERC20 => bool) private _accepted;
    
    mapping(uint256 => address) public queue; //?
    //Track missed payments ?
    mapping(address => uint256[]) public missedPayments;

    constructor(address treasury, address token) {
        _owner = msg.sender;
        _treasury = treasury;
        _token = token;
    }

     modifier onlyOwner() {
        require(msg.sender == _owner, "Only owner");
        _;
    }
    // Check if loan by loanNum has been taken
    function loanTaken(uint256 loanNum, address user) public view returns(bool){
        return _loans[user][loanNum].open;
    }
    // Check amount of funds returned to treasury
    function fundsReturned() public view returns(uint256){
        return _funds.returned;
    }
    // Check amount of funds currently avaiable in the policy
    function fundsAvailable() public view returns(uint256){
        return _funds.available;
    }
    // Check if user queueNum is up for takeLoan
    function takeQueue() public view returns(uint256){
        // Implement logic to check user's queue position
        return _userNum[msg.sender];
    }
    // Check amount/if deposit made for loanNum
    function depositCheck(uint256 loanNum, address user) public view returns(uint256){
        return _loans[user][loanNum].collateralAmount;
    }
    // Check if loan withdrawn(takeLoan)
    function loanTaken(uint256 loanNum) public view returns(bool){
        return _loans[msg.sender][loanNum].loanAmount > 0;
    }
    //check if loan is repaid
    function checkRepaid(uint256 loanNum, address user) public view returns(bool){
        return _loans[user][loanNum].amountPaid >= _loans[user][loanNum].loanAmount;
    }
    /**  Returns the treasury proposalNumber requested by the lending service
      - To find all treasury proposal numbers from this contract
    */
    function proposalCheck(uint256 num)public view returns(uint256){
        LoanProposal storage proposal = _proposals[num];
        return(proposal.treasuryProposal);
    }
    //  Check if treasury proposalNum is a lending request
    function treasuryCheck(uint256 num)public view returns(bool){
        return(_lendingProposal[num]);
    }
    /**  Check if ERC20 token is accepted by the lending service
    */
    function acceptedToken(IERC20 token)public view returns(bool){
        return(_accepted[token]);
    }
    /**  Check amount due before withdraw for a user's open loan.
     *  Checks the monthlyPayments(interset payments) only 
    */
    function amountDue(uint256 loanNum, address user) public view returns(uint256){
        Loan storage loan = _loans[user][loanNum];
        uint256 monthsPassed = (block.timestamp - loan.startTime) / 30 days;
        //Total monthly payments that should have been payed
        uint256 totalMonthlyDue = monthsPassed * loan.payments;
        uint256 total;

        if(loan.amountPaid < totalMonthlyDue){
            // check total interest due
            total = totalMonthlyDue - loan.amountPaid;
            return(total);
        }else{ 
            return(0);
        }
    }
    // Update interset rate
    function updateInterest(uint256 interest) public onlyOwner returns(bool){
        _interestRate = interest;
        return true;
    }
    /**
     * 
     */
    function addToken(IERC20 token) external onlyOwner returns(bool){
        _accepted[token] = true;
        return true;
    }
    // Deposit token to proposal for Locking
    // inform the user that tokens will be locked for (n) duration
    function depositCollateral(IERC20 token, uint256 amount) public returns(uint256){
        require(amount > 100, "Not enough collateral");
        require(acceptedToken(token), "Token not accepted");
        require(_accepted[token], "Token is not accepted");
        
        uint256 depositNum = _userNum[msg.sender] + 1;
        Loan storage loan = _loans[msg.sender][depositNum];
        loan.token = token;
        loan.collateralAmount = amount;
        loan.collateralWithdrawn = false;
        _userNum[msg.sender] = depositNum;
        
        SafeERC20.safeTransferFrom(token, msg.sender, address(this), amount);
        emit CollateralDeposited(msg.sender, amount, depositNum);
        return depositNum;
    }
    //Take loan
    function takeLoan(uint256 loanNum, IERC20 token, address user) public returns(bool){
        Loan storage loan = _loans[user][loanNum];
        require(loan.collateralAmount <= _funds.available, "Insufficient funds");
        require(!loan.collateralWithdrawn, "Collateral for loanNum already withdrawn");
        require(loan.loanAmount == 0, "Loan for loanNum already taken");

        loan.loanAmount = loan.collateralAmount / 2;
        loan.startTime = block.timestamp;
        loan.payments = (loan.loanAmount + ((loan.loanAmount * _interestRate) / 10000)) / 12;
        loan.loanToken = token;
        loan.closed = false;
        loan.open = true;
        SafeERC20.safeTransfer(token, user, loan.loanAmount);

        // record loan taken
        emit LoanTaken(user, loan.loanAmount);
        return true;
    }
    /** Close Laon by paying amount due
     * MUST check for over payment
     * SHOULD check amountDue function to get pending balance
     */
    function closeLoan(uint256 loanNum, address user) public returns(bool){
        Loan storage loan = _loans[user][loanNum];
        require(!loan.closed, "Loan has closed");
        require(loan.startTime > 0, "Loan not started");
        
        uint256 amount;
        uint256 total = loan.loanAmount + amountDue(loanNum, user);
        
        if(loan.amountPaid >= total){
            // overpayment, add to collateral
            amount = loan.amountPaid - total;
            loan.collateralAmount += amount;
            loan.closed = true;
            loan.open = false;
            return true;
        }else{
            // underpayment
            amount = total - loan.amountPaid;
            loan.amountPaid += amount;
            loan.closed = true;
            loan.open = false;
            SafeERC20.safeTransferFrom(loan.loanToken, user, address(this), amount);
            return true;
        }
        
    }
    // Withdraw funds after repayment 
    // 
    function withdrawCollateral(uint256 loanNum, address receiver) external returns(uint256){
        Loan storage loan = _loans[receiver][loanNum];
        require(loan.closed, "Loan not closed");
        require(!loan.collateralWithdrawn, "Already withdrawn");
        uint256 amount = loan.collateralAmount;

        SafeERC20.safeTransfer(loan.token, receiver, amount);
        loan.collateralWithdrawn = true;
        emit CollateralWithdrawn(receiver, amount);
        return amount;
    }
    /** Make payment
     * - MUST be monthly payment or pay in full/par
     */
    function makePayment(uint256 loanNum, address user) external returns(bool){
        Loan storage loan = _loans[user][loanNum];
        require(!loan.closed, "Loan has closed");

        uint256 amount = loan.payments;
        loan.amountPaid += amount;
        SafeERC20.safeTransferFrom(loan.loanToken, user, address(this), amount);

        emit PaymentMade(user, amount);
        return true; 
    }
    /** Create a new treasury proposalOpen
     *  
     */ 
    function createProposal(uint256 amount, IERC20 token, bool vote, uint256 time) external onlyOwner returns(uint256){
        require(IERC20(_token).totalSupply() > amount, "Insufficient supply");
        
        uint256 proposal = ITreasuryVault(_treasury).proposalOpen(amount, address(this), msg.sender, vote, false, token);
        
        uint256 num = _lendingNum + 1;
        LoanProposal storage prop = _proposals[num];
        prop.numProposal = num;
        prop.treasuryProposal = proposal;
        prop.amount = amount;
        
        prop.time = time;

        _lendingProposal[proposal] = true;
        _lendingNum = num;
        emit NewProposal(proposal, amount);
        
        return num;
    }
    // Close a proposal
    function endProposal(uint256 num) external returns(uint256){
        ITreasuryVault treasury = ITreasuryVault(_treasury);
        require(treasuryCheck(num), "Not a lending proposal");
        //require(treasury.executed(num), "Not executed");
        require(!treasury.closedProposal(num), "Already closed");

        LoanProposal storage prop = _proposals[num];
        require(prop.time < block.timestamp, "Time not passed");
        _funds.owed += prop.amount;
        treasury.proposalClose(num);
        return prop.amount;
    }
    /**
     * Transfer funds from treasury to lending after approved treasuryProposal
     * 
     */
    function collectFunds(uint256 proposal) external returns(bool){
        ITreasuryVault treasury = ITreasuryVault(_treasury);
        require(treasuryCheck(proposal), "Not a lending proposal");
        require(!treasury.executed(proposal), "Already executed");
        require(!treasury.closedProposal(proposal), "Closed");
        
        uint256 amount = _proposals[proposal].amount;
        bool res = treasury.proposalApproved(proposal);
        
        if (res) {
            _funds.deposit += amount;
            _funds.available += amount;
            emit CollectFunds(proposal, amount);
        }
        
        return res;
    }
    /**
     * Request funds get returned to treasury()
     * 
     */
    function requestReturn( bool rate) external returns(uint256){
        // check available funds
        // Record amount for request
        //check current requests( try to not have request spam)

        require(_requests < 6, "Too many requests");

        _requests += 1;
        uint256 newProposal = ITreasuryVault(_treasury).proposalOpen(0, address(this), msg.sender, rate, true, IERC20(_token));

        return newProposal;
    }
    // Return funds to the treasury
    function sendFunds(uint256 amount, uint256 returnProposal) internal onlyOwner returns(bool){
        require(amount <= _funds.available, "Insufficient funds");
        
        ITreasuryVault treasury = ITreasuryVault(_treasury);
        require(treasury.vote(returnProposal), "Return request been approved");
        require(!treasury.closedProposal(returnProposal), "Return request has been closed");

        _funds.available -= amount;
        _funds.returned += amount;
        ITreasuryVault(_treasury).depositTreasury(IERC20(_token), address(this), amount);

        treasury.proposalClose(returnProposal);

        return true;
    }
    
     
}
