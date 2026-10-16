
 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IBorrowerRegistry {
    function isBorrowerRegistered(address wallet)
        external
        view
        returns (bool);
}

/// @title RiskOracle
/// @notice Stores authorized risk assessments for registered TrustFi borrowers.
/// @dev Actual AI/ML scoring happens off-chain. Never store private documents here.
contract RiskOracle {
    struct Assessment {
        uint8 score;
        bool eligible;
        uint64 assessedAt;
        bytes32 assessmentCommitment;
        bool exists;
    }

    address public owner;
    IBorrowerRegistry public immutable borrowerRegistry;

    uint8 public minimumEligibleScore = 70;

    mapping(address => bool) public authorizedAssessors;
    mapping(address => Assessment) private assessments;

    event AssessorAuthorizationChanged(
        address indexed assessor,
        bool authorized
    );

    event MinimumEligibleScoreUpdated(uint8 newMinimumScore);

    event RiskAssessmentSubmitted(
        address indexed borrower,
        address indexed assessor,
        uint8 score,
        bool eligible,
        uint256 assessedAt
    );

    error Unauthorized();
    error InvalidAddress();
    error InvalidScore();
    error InvalidCommitment();
    error BorrowerNotRegistered();
    error AssessmentNotFound();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyAuthorizedAssessor() {
        if (!authorizedAssessors[msg.sender]) revert Unauthorized();
        _;
    }

    constructor(address registryAddress) {
        if (registryAddress == address(0)) revert InvalidAddress();

        owner = msg.sender;
        borrowerRegistry = IBorrowerRegistry(registryAddress);
    }

    /// @notice Authorize or revoke an off-chain risk service wallet.
    function setAuthorizedAssessor(
        address assessor,
        bool authorized
    ) external onlyOwner {
        if (assessor == address(0)) revert InvalidAddress();

        authorizedAssessors[assessor] = authorized;

        emit AssessorAuthorizationChanged(assessor, authorized);
    }

    /// @notice Change the score required to be considered eligible.
    function setMinimumEligibleScore(
        uint8 newMinimumScore
    ) external onlyOwner {
        if (newMinimumScore > 100) revert InvalidScore();

        minimumEligibleScore = newMinimumScore;

        emit MinimumEligibleScoreUpdated(newMinimumScore);
    }

    /// @notice Record a risk assessment for a registered borrower.
    /// @param borrower Registered borrower's wallet.
    /// @param score Risk model output from 0 to 100; higher means lower risk.
    /// @param assessmentCommitment Commitment to the off-chain assessment.
    function submitRiskAssessment(
        address borrower,
        uint8 score,
        bytes32 assessmentCommitment
    ) external onlyAuthorizedAssessor {
        if (borrower == address(0)) revert InvalidAddress();
        if (score > 100) revert InvalidScore();
        if (assessmentCommitment == bytes32(0)) {
            revert InvalidCommitment();
        }

        if (!borrowerRegistry.isBorrowerRegistered(borrower)) {
            revert BorrowerNotRegistered();
        }

        bool eligible = score >= minimumEligibleScore;

        assessments[borrower] = Assessment({
            score: score,
            eligible: eligible,
            assessedAt: uint64(block.timestamp),
            assessmentCommitment: assessmentCommitment,
            exists: true
        });

        emit RiskAssessmentSubmitted(
            borrower,
            msg.sender,
            score,
            eligible,
            block.timestamp
        );
    }

    /// @notice Read the latest assessment for a borrower.
    function getRiskAssessment(address borrower)
        external
        view
        returns (
            uint8 score,
            bool eligible,
            uint64 assessedAt,
            bytes32 assessmentCommitment
        )
    {
        Assessment memory assessment = assessments[borrower];

        if (!assessment.exists) revert AssessmentNotFound();

        return (
            assessment.score,
            assessment.eligible,
            assessment.assessedAt,
            assessment.assessmentCommitment
        );
    }

    function hasRiskAssessment(address borrower)
        external
        view
        returns (bool)
    {
        return assessments[borrower].exists;
    }
}
