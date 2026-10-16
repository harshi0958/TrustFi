
 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ITrustFiBorrowerRegistry {
    function isBorrowerRegistered(address wallet)
        external
        view
        returns (bool);
}

interface ITrustFiLoanPoolFactory {
    function approveLoan(
        address borrower,
        uint256 principal,
        uint256 duration
    ) external returns (uint256 loanId);

    function disburseLoan(uint256 loanId) external;
}

/// @title LoanFactory
/// @notice Records borrower loan requests and coordinates approved disbursements.
contract LoanFactory {
    enum RequestStatus {
        None,
        Pending,
        Approved,
        Rejected,
        Disbursed
    }

    struct LoanRequest {
        uint256 requestId;
        address borrower;
        uint256 amount;
        uint256 duration;
        uint256 poolLoanId;
        RequestStatus status;
    }

    address public owner;

    ITrustFiBorrowerRegistry public immutable borrowerRegistry;
    ITrustFiLoanPoolFactory public immutable loanPool;

    uint256 public nextRequestId = 1;

    mapping(uint256 => LoanRequest) private requests;

    event LoanRequested(
        uint256 indexed requestId,
        address indexed borrower,
        uint256 amount,
        uint256 duration
    );

    event LoanRequestApproved(
        uint256 indexed requestId,
        uint256 indexed poolLoanId
    );

    event LoanRequestRejected(
        uint256 indexed requestId,
        address indexed borrower
    );

    event LoanDisbursed(
        uint256 indexed requestId,
        uint256 indexed poolLoanId,
        address indexed borrower
    );

    error Unauthorized();
    error InvalidAddress();
    error InvalidAmount();
    error InvalidDuration();
    error BorrowerNotRegistered();
    error RequestNotFound();
    error InvalidRequestStatus();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor(
        address registryAddress,
        address loanPoolAddress
    ) {
        if (
            registryAddress == address(0) ||
            loanPoolAddress == address(0)
        ) {
            revert InvalidAddress();
        }

        owner = msg.sender;
        borrowerRegistry =
            ITrustFiBorrowerRegistry(registryAddress);
        loanPool = ITrustFiLoanPoolFactory(loanPoolAddress);
    }

    /// @notice Submit a loan request from a registered wallet.
    function createLoan(
        uint256 amount,
        uint256 duration
    ) external returns (uint256 requestId) {
        if (amount == 0) revert InvalidAmount();
        if (duration == 0 || duration > 365 days) {
            revert InvalidDuration();
        }

        if (!borrowerRegistry.isBorrowerRegistered(msg.sender)) {
            revert BorrowerNotRegistered();
        }

        requestId = nextRequestId++;

        requests[requestId] = LoanRequest({
            requestId: requestId,
            borrower: msg.sender,
            amount: amount,
            duration: duration,
            poolLoanId: 0,
            status: RequestStatus.Pending
        });

        emit LoanRequested(
            requestId,
            msg.sender,
            amount,
            duration
        );
    }

    /// @notice Approve a request through LoanPool's risk checks.
    function approveRequest(
        uint256 requestId
    ) external onlyOwner {
        LoanRequest storage request = requests[requestId];

        if (request.status == RequestStatus.None) {
            revert RequestNotFound();
        }
        if (request.status != RequestStatus.Pending) {
            revert InvalidRequestStatus();
        }

        // LoanPool checks the borrower's current RiskOracle result
        // and available pool liquidity.
        uint256 poolLoanId = loanPool.approveLoan(
            request.borrower,
            request.amount,
            request.duration
        );

        request.poolLoanId = poolLoanId;
        request.status = RequestStatus.Approved;

        emit LoanRequestApproved(requestId, poolLoanId);
    }

    /// @notice Disburse a previously approved request.
    function disburseApprovedRequest(
        uint256 requestId
    ) external onlyOwner {
        LoanRequest storage request = requests[requestId];

        if (request.status == RequestStatus.None) {
            revert RequestNotFound();
        }
        if (request.status != RequestStatus.Approved) {
            revert InvalidRequestStatus();
        }

        loanPool.disburseLoan(request.poolLoanId);

        request.status = RequestStatus.Disbursed;

        emit LoanDisbursed(
            requestId,
            request.poolLoanId,
            request.borrower
        );
    }

    /// @notice Reject a pending loan request.
    function rejectRequest(
        uint256 requestId
    ) external onlyOwner {
        LoanRequest storage request = requests[requestId];

        if (request.status == RequestStatus.None) {
            revert RequestNotFound();
        }
        if (request.status != RequestStatus.Pending) {
            revert InvalidRequestStatus();
        }

        request.status = RequestStatus.Rejected;

        emit LoanRequestRejected(
            requestId,
            request.borrower
        );
    }

    /// @notice Read the details and current status of a request.
    function getLoan(uint256 requestId)
        external
        view
        returns (LoanRequest memory)
    {
        if (requests[requestId].status == RequestStatus.None) {
            revert RequestNotFound();
        }

        return requests[requestId];
    }
}
