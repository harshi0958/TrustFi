// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../contracts/BorrowerRegistry.sol";
import "../contracts/RiskOracle.sol";
import "../contracts/LoanPool.sol";
import "../contracts/LoanFactory.sol";

interface Vm {
    function deal(address account, uint256 newBalance) external;
}

contract TrustFiTestActor {
    function register(BorrowerRegistry registry, bytes32 commitment) external {
        registry.registerBorrower(commitment);
    }

    function requestLoan(
        LoanFactory factory,
        uint256 amount,
        uint256 duration
    ) external returns (uint256) {
        return factory.createLoan(amount, duration);
    }

    function tryRequestLoan(
        LoanFactory factory
    ) external returns (bool) {
        try factory.createLoan(1 ether, 30 days) returns (uint256) {
            return true;
        } catch {
            return false;
        }
    }

    function tryApprove(
        LoanFactory factory,
        uint256 requestId
    ) external returns (bool) {
        try factory.approveRequest(requestId) {
            return true;
        } catch {
            return false;
        }
    }

    function tryReject(
        LoanFactory factory,
        uint256 requestId
    ) external returns (bool) {
        try factory.rejectRequest(requestId) {
            return true;
        } catch {
            return false;
        }
    }
}

contract TrustFiIntegrationTest {
    Vm private constant vm =
        Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    BorrowerRegistry private registry;
    RiskOracle private riskOracle;
    LoanPool private loanPool;
    LoanFactory private loanFactory;

    TrustFiTestActor private otherActor;

    receive() external payable {}

    function setUp() public {
        registry = new BorrowerRegistry();
        riskOracle = new RiskOracle(address(registry));
        loanPool = new LoanPool(address(riskOracle));
        loanFactory = new LoanFactory(
            address(registry),
            address(loanPool)
        );

        otherActor = new TrustFiTestActor();

        // The factory must be authorized to call LoanPool approval
        // and disbursement functions.
        loanPool.setAuthorizedApprover(address(loanFactory), true);

        // Register this test contract as the main borrower.
        registry.registerBorrower(keccak256("test-borrower-profile"));

        // Authorize this contract as an assessment submitter.
        riskOracle.setAuthorizedAssessor(address(this), true);
        riskOracle.submitRiskAssessment(
            address(this),
            80,
            keccak256("test-risk-assessment")
        );
    }

    function testBorrowerCanCreatePendingRequest() public {
        uint256 requestId = loanFactory.createLoan(1 ether, 30 days);

        LoanFactory.LoanRequest memory request =
            loanFactory.getLoan(requestId);

        require(requestId == 1, "Unexpected request ID");
        require(request.borrower == address(this), "Wrong borrower");
        require(request.amount == 1 ether, "Wrong amount");
        require(uint8(request.status) == 1, "Request not pending");
    }

    function testUnregisteredBorrowerCannotRequestLoan() public {
        bool succeeded = otherActor.tryRequestLoan(loanFactory);

        require(!succeeded, "Unregistered borrower was accepted");
    }

    function testRegisteredBorrowerCanRequestLoan() public {
        otherActor.register(
            registry,
            keccak256("other-borrower-profile")
        );

        uint256 requestId = otherActor.requestLoan(
            loanFactory,
            1 ether,
            30 days
        );

        LoanFactory.LoanRequest memory request =
            loanFactory.getLoan(requestId);

        require(request.borrower == address(otherActor), "Wrong borrower");
        require(uint8(request.status) == 1, "Request not pending");
    }

    function testOwnerCanRejectPendingRequest() public {
        uint256 requestId = loanFactory.createLoan(1 ether, 30 days);

        loanFactory.rejectRequest(requestId);

        LoanFactory.LoanRequest memory request =
            loanFactory.getLoan(requestId);

        require(uint8(request.status) == 3, "Request not rejected");
    }

    function testNonOwnerCannotRejectRequest() public {
        uint256 requestId = loanFactory.createLoan(1 ether, 30 days);

        bool succeeded = otherActor.tryReject(loanFactory, requestId);

        require(!succeeded, "Non-owner rejected request");
    }

    function testNonOwnerCannotApproveRequest() public {
        uint256 requestId = loanFactory.createLoan(1 ether, 30 days);

        bool succeeded = otherActor.tryApprove(loanFactory, requestId);

        require(!succeeded, "Non-owner approved request");
    }

    function testEligibleBorrowerRequestCanBeApproved() public {
        vm.deal(address(this), 2 ether);
        loanPool.deposit{value: 2 ether}();

        uint256 requestId = loanFactory.createLoan(1 ether, 30 days);
        loanFactory.approveRequest(requestId);

        LoanFactory.LoanRequest memory request =
            loanFactory.getLoan(requestId);

        require(uint8(request.status) == 2, "Request not approved");
        require(request.poolLoanId != 0, "Missing pool loan ID");
    }

    function testApprovedLoanCanBeDisbursed() public {
        vm.deal(address(this), 2 ether);
        loanPool.deposit{value: 2 ether}();

        uint256 requestId = loanFactory.createLoan(1 ether, 30 days);
        loanFactory.approveRequest(requestId);

        uint256 balanceBefore = address(this).balance;

        loanFactory.disburseApprovedRequest(requestId);

        LoanFactory.LoanRequest memory request =
            loanFactory.getLoan(requestId);

        require(uint8(request.status) == 4, "Request not disbursed");
        require(
            address(this).balance == balanceBefore + 1 ether,
            "Borrower did not receive principal"
        );
    }

    function testRequestCannotBeDisbursedBeforeApproval() public {
        uint256 requestId = loanFactory.createLoan(1 ether, 30 days);

        bool succeeded;

        try loanFactory.disburseApprovedRequest(requestId) {
            succeeded = true;
        } catch {
            succeeded = false;
        }

        require(!succeeded, "Pending request was disbursed");
    }

    function testUnassessedBorrowerCannotGetLoanApproved() public {
        otherActor.register(
            registry,
            keccak256("unassessed-borrower-profile")
        );

        uint256 requestId = otherActor.requestLoan(
            loanFactory,
            1 ether,
            30 days
        );

        vm.deal(address(this), 2 ether);
        loanPool.deposit{value: 2 ether}();

        bool succeeded;

        try loanFactory.approveRequest(requestId) {
            succeeded = true;
        } catch {
            succeeded = false;
        }

        require(!succeeded, "Borrower without assessment was approved");
    }
}

