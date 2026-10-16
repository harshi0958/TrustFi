
 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ITrustFiRiskOracle {
    function getRiskAssessment(address borrower)
        external
        view
        returns (
            uint8 score,
            bool eligible,
            uint64 assessedAt,
            bytes32 assessmentCommitment
        );

    function hasRiskAssessment(address borrower)
        external
        view
        returns (bool);
}

/// @title LoanPool
/// @notice ETH lending pool for approved TrustFi loans.
/// @dev Development foundation; audit and test before handling real funds.
contract LoanPool {
    enum LoanStatus {
        None,
        Approved,
        Active,
        Repaid,
        Defaulted
    }

    struct Loan {
        address borrower;
        uint256 principal;
        uint256 duration;
        uint256 approvedAt;
        uint256 dueAt;
        LoanStatus status;
    }

    address public owner;
    address public repaymentContract;
    ITrustFiRiskOracle public immutable riskOracle;

    uint256 public nextLoanId = 1;
    uint256 public totalDeposits;
    uint256 public totalBorrowed;

    mapping(address => uint256) public lenderBalance;
    mapping(address => bool) public authorizedApprovers;
    mapping(uint256 => Loan) public loans;

    // Prevent borrowers from having multiple simultaneously active loans.
    mapping(address => uint256) public activeLoanId;

    uint256 private locked = 1;

    event Deposited(address indexed lender, uint256 amount);
    event Withdrawn(address indexed lender, uint256 amount);

    event ApproverAuthorizationChanged(
        address indexed approver,
        bool authorized
    );

    event LoanApproved(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 principal,
        uint256 duration
    );

    event LoanDisbursed(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 principal,
        uint256 dueAt
    );

    event LoanMarkedRepaid(uint256 indexed loanId);
    event LoanMarkedDefaulted(uint256 indexed loanId);

    error Unauthorized();
    error InvalidAddress();
    error InvalidAmount();
    error InvalidDuration();
    error InsufficientLiquidity();
    error TransferFailed();
    error ReentrantCall();
    error LoanNotFound();
    error InvalidLoanStatus();
    error BorrowerNotEligible();
    error ExistingActiveLoan();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyApprover() {
        if (!authorizedApprovers[msg.sender]) revert Unauthorized();
        _;
    }

    modifier nonReentrant() {
        if (locked != 1) revert ReentrantCall();
        locked = 2;
        _;
        locked = 1;
    }

    constructor(address riskOracleAddress) {
        if (riskOracleAddress == address(0)) revert InvalidAddress();

        owner = msg.sender;
        riskOracle = ITrustFiRiskOracle(riskOracleAddress);

        authorizedApprovers[msg.sender] = true;
        emit ApproverAuthorizationChanged(msg.sender, true);
    }

    /// @notice Deposit ETH to supply lending liquidity.
    function deposit() external payable {
        if (msg.value == 0) revert InvalidAmount();

        lenderBalance[msg.sender] += msg.value;
        totalDeposits += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    /// @notice Withdraw available lender funds.
    function withdraw(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();
        if (lenderBalance[msg.sender] < amount) {
            revert InsufficientLiquidity();
        }

        uint256 availableLiquidity = address(this).balance;
        if (amount > availableLiquidity) revert InsufficientLiquidity();

        lenderBalance[msg.sender] -= amount;
        totalDeposits -= amount;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Withdrawn(msg.sender, amount);
    }

    function setAuthorizedApprover(
        address approver,
        bool authorized
    ) external onlyOwner {
        if (approver == address(0)) revert InvalidAddress();

        authorizedApprovers[approver] = authorized;

        emit ApproverAuthorizationChanged(approver, authorized);
    }

    function setRepaymentContract(
    address repaymentContractAddress
) external onlyOwner {
    if (repaymentContractAddress == address(0)) {
        revert InvalidAddress();
    }

    repaymentContract = repaymentContractAddress;
}

    /// @notice Approve a loan after checking the borrower's latest risk result.
    function approveLoan(
        address borrower,
        uint256 principal,
        uint256 duration
    ) external onlyApprover returns (uint256 loanId) {
        if (borrower == address(0)) revert InvalidAddress();
        if (principal == 0) revert InvalidAmount();
        if (duration == 0 || duration > 365 days) {
            revert InvalidDuration();
        }

        if (activeLoanId[borrower] != 0) {
            revert ExistingActiveLoan();
        }

        if (!riskOracle.hasRiskAssessment(borrower)) {
            revert BorrowerNotEligible();
        }

        (, bool eligible, , ) = riskOracle.getRiskAssessment(borrower);
        if (!eligible) revert BorrowerNotEligible();

        uint256 availableLiquidity = address(this).balance;
        if (principal > availableLiquidity) {
            revert InsufficientLiquidity();
        }

        loanId = nextLoanId++;

        loans[loanId] = Loan({
            borrower: borrower,
            principal: principal,
            duration: duration,
            approvedAt: block.timestamp,
            dueAt: 0,
            status: LoanStatus.Approved
        });

        activeLoanId[borrower] = loanId;

        emit LoanApproved(loanId, borrower, principal, duration);
    }

    /// @notice Disburse an approved loan to its borrower.
    function disburseLoan(
        uint256 loanId
    ) external onlyApprover nonReentrant {
        Loan storage loan = loans[loanId];

        if (loan.status == LoanStatus.None) revert LoanNotFound();
        if (loan.status != LoanStatus.Approved) {
            revert InvalidLoanStatus();
        }

        uint256 availableLiquidity = address(this).balance;
        if (loan.principal > availableLiquidity) {
            revert InsufficientLiquidity();
        }

        loan.status = LoanStatus.Active;
        loan.dueAt = block.timestamp + loan.duration;
        totalBorrowed += loan.principal;

        (bool success, ) = payable(loan.borrower).call{
            value: loan.principal
        }("");

        if (!success) revert TransferFailed();

        emit LoanDisbursed(
            loanId,
            loan.borrower,
            loan.principal,
            loan.dueAt
        );
    }

    /// @notice Called by a trusted repayment contract after verified payment.
    function recordRepayment(
    uint256 loanId
) external payable {
    if (msg.sender != repaymentContract) {
        revert Unauthorized();
    }

    Loan storage loan = loans[loanId];

    if (loan.status == LoanStatus.None) revert LoanNotFound();
    if (loan.status != LoanStatus.Active) {
        revert InvalidLoanStatus();
    }
    if (msg.value < loan.principal) {
        revert InvalidAmount();
    }

    loan.status = LoanStatus.Repaid;
    totalBorrowed -= loan.principal;
    activeLoanId[loan.borrower] = 0;

    emit LoanMarkedRepaid(loanId);
}

    /// @notice Mark an overdue loan as defaulted.
    function markLoanDefaulted(uint256 loanId) external onlyApprover {
        Loan storage loan = loans[loanId];

        if (loan.status == LoanStatus.None) revert LoanNotFound();
        if (loan.status != LoanStatus.Active) {
            revert InvalidLoanStatus();
        }
        if (block.timestamp <= loan.dueAt) {
            revert InvalidLoanStatus();
        }

        loan.status = LoanStatus.Defaulted;
        totalBorrowed -= loan.principal;
        activeLoanId[loan.borrower] = 0;

        emit LoanMarkedDefaulted(loanId);
    }

    function getAvailableLiquidity() external view returns (uint256) {
        return address(this).balance;
    }

    function getLoan(uint256 loanId)
        external
        view
        returns (Loan memory)
    {
        if (loans[loanId].status == LoanStatus.None) {
            revert LoanNotFound();
        }

        return loans[loanId];
    }

    function getLoanRepaymentDetails(
    uint256 loanId
)
    external
    view
    returns (
        address borrower,
        uint256 principal,
        uint256 dueAt,
        uint8 status
    )
{
    Loan memory loan = loans[loanId];

    if (loan.status == LoanStatus.None) revert LoanNotFound();

    return (
        loan.borrower,
        loan.principal,
        loan.dueAt,
        uint8(loan.status)
    );
}
}
