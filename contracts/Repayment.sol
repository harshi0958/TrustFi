
 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ITrustFiLoanPool {
    function getLoanRepaymentDetails(uint256 loanId)
        external
        view
        returns (
            address borrower,
            uint256 principal,
            uint256 dueAt,
            uint8 status
        );

    function recordRepayment(uint256 loanId) external payable;
}

/// @title Repayment
/// @notice Processes full ETH repayments for TrustFi loans.
/// @dev Illustrative 5% flat interest. Audit before production use.
contract Repayment {
    ITrustFiLoanPool public immutable loanPool;

    uint256 public constant INTEREST_BPS = 500;
    uint256 public constant BPS_DENOMINATOR = 10_000;

    mapping(uint256 => bool) public repaid;

    uint256 private locked = 1;

    event RepaymentProcessed(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 principal,
        uint256 interest,
        uint256 totalPaid
    );

    error InvalidAddress();
    error Unauthorized();
    error LoanNotActive();
    error AlreadyRepaid();
    error IncorrectPayment();
    error ReentrantCall();

    modifier nonReentrant() {
        if (locked != 1) revert ReentrantCall();
        locked = 2;
        _;
        locked = 1;
    }

    constructor(address loanPoolAddress) {
        if (loanPoolAddress == address(0)) revert InvalidAddress();

        loanPool = ITrustFiLoanPool(loanPoolAddress);
    }

    /// @notice Calculate principal plus 5% flat interest.
    function calculateAmountDue(
        uint256 principal
    ) public pure returns (uint256 totalDue, uint256 interest) {
        // Round interest up to the nearest wei.
        interest =
            (principal * INTEREST_BPS + BPS_DENOMINATOR - 1)
            / BPS_DENOMINATOR;

        totalDue = principal + interest;
    }

    /// @notice Repay the full outstanding loan in ETH.
    function repayLoan(
        uint256 loanId
    ) external payable nonReentrant {
        (
            address borrower,
            uint256 principal,
            ,
            uint8 status
        ) = loanPool.getLoanRepaymentDetails(loanId);

        if (borrower != msg.sender) revert Unauthorized();

        // LoanPool enum: Active = 2.
        if (status != 2) revert LoanNotActive();
        if (repaid[loanId]) revert AlreadyRepaid();

        (uint256 amountDue, uint256 interest) =
            calculateAmountDue(principal);

        if (msg.value != amountDue) revert IncorrectPayment();

        // Effects before external interaction; revert rolls this back too.
        repaid[loanId] = true;

        loanPool.recordRepayment{value: msg.value}(loanId);

        emit RepaymentProcessed(
            loanId,
            borrower,
            principal,
            interest,
            msg.value
        );
    }
}
