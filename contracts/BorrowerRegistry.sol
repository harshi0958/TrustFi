
 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title BorrowerRegistry
/// @notice Registers borrower wallets without storing personal documents on-chain.
/// @dev Keep names, mobile numbers, Aadhaar, PAN and document URLs off-chain.
contract BorrowerRegistry {
    struct Borrower {
        bytes32 profileCommitment;
        uint64 registeredAt;
        bool isRegistered;
    }

    mapping(address => Borrower) private borrowers;

    event BorrowerRegistered(
        address indexed borrower,
        bytes32 profileCommitment,
        uint256 registeredAt
    );

    event ProfileCommitmentUpdated(
        address indexed borrower,
        bytes32 newProfileCommitment
    );

    error InvalidProfileCommitment();
    error AlreadyRegistered();
    error NotRegistered();

    /// @notice Register the caller's wallet.
    /// @param profileCommitment Hash commitment to the borrower's off-chain profile.
    function registerBorrower(bytes32 profileCommitment) external {
        if (profileCommitment == bytes32(0)) {
            revert InvalidProfileCommitment();
        }

        if (borrowers[msg.sender].isRegistered) {
            revert AlreadyRegistered();
        }

        borrowers[msg.sender] = Borrower({
            profileCommitment: profileCommitment,
            registeredAt: uint64(block.timestamp),
            isRegistered: true
        });

        emit BorrowerRegistered(
            msg.sender,
            profileCommitment,
            block.timestamp
        );
    }

    /// @notice Update the caller's profile commitment.
    function updateProfileCommitment(
        bytes32 newProfileCommitment
    ) external {
        if (newProfileCommitment == bytes32(0)) {
            revert InvalidProfileCommitment();
        }

        if (!borrowers[msg.sender].isRegistered) {
            revert NotRegistered();
        }

        borrowers[msg.sender].profileCommitment = newProfileCommitment;

        emit ProfileCommitmentUpdated(
            msg.sender,
            newProfileCommitment
        );
    }

    /// @notice Check whether a wallet is registered.
    function isBorrowerRegistered(address wallet)
        external
        view
        returns (bool)
    {
        return borrowers[wallet].isRegistered;
    }

    /// @notice Read a borrower's registration details.
    function getBorrower(address wallet)
        external
        view
        returns (
            bytes32 profileCommitment,
            uint64 registeredAt,
            bool isRegistered
        )
    {
        Borrower memory borrower = borrowers[wallet];

        return (
            borrower.profileCommitment,
            borrower.registeredAt,
            borrower.isRegistered
        );
    }
}
