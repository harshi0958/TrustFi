// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract LoanFactory {

    struct Loan {
        uint256 id;
        address borrower;
        uint256 amount;
        uint256 duration;
        string status;
    }

    uint256 public loanCount;

    mapping(uint256 => Loan) public loans;

    event LoanCreated(
        uint256 id,
        address borrower,
        uint256 amount
    );

    function createLoan(
        uint256 amount,
        uint256 duration
    ) public {

        loanCount++;

        loans[loanCount] = Loan({
            id: loanCount,
            borrower: msg.sender,
            amount: amount,
            duration: duration,
            status: "PENDING"
        });

        emit LoanCreated(
            loanCount,
            msg.sender,
            amount
        );
    }

    function getLoan(uint256 id)
        public
        view
        returns (
            address,
            uint256,
            uint256,
            string memory
        )
    {
        Loan memory loan = loans[id];

        return (
            loan.borrower,
            loan.amount,
            loan.duration,
            loan.status
        );
    }
}