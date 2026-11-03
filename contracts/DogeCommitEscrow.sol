// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DogeCommitEscrow
 * @notice DOGE-native milestone escrow contract for DogeOS Chikyū Testnet.
 *         Enforces transparent milestone-based escrow payments between clients
 *         and independent contributors using DOGE ERC-20 interface.
 *         Conforms strictly to 01-PRODUCT-REQUIREMENTS.md and USER-FLOWS.md.
 */
contract DogeCommitEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // --- Enums ---

    enum ProjectStatus {
        Created,            // Agreement created, awaiting funding and/or acceptance
        Active,             // Funded by client and accepted by contributor
        Completed,          // All milestone funds have been settled (released or refunded)
        Cancelled           // Cancelled before activation, funds refunded if deposited
    }

    enum MilestoneStatus {
        Pending,            // Work in progress, awaiting evidence submission
        Submitted,          // Deliverable evidence submitted by contributor
        Approved,           // Client approved submission; payment released
        Disputed,           // Client disputed submission; funds locked
        ResolvedReleased,   // Dispute resolved; payment released to contributor
        ResolvedRefunded    // Dispute resolved; payment refunded to client
    }

    enum ResolutionOutcome {
        None,
        ReleaseToContributor, // Release milestone payment to contributor
        RefundToClient        // Refund milestone payment back to client
    }

    // --- Structs ---

    struct MilestoneInput {
        string name;
        string description;
        uint256 amount;
        uint256 deadline;
        string deliverableRequirements;
    }

    struct Milestone {
        string name;
        string description;
        uint256 amount;
        uint256 deadline;
        string deliverableRequirements;
        string evidenceUrl;
        string evidenceHash;
        uint256 submittedAt;
        MilestoneStatus status;
        ResolutionOutcome proposedOutcome; // Proposed outcome during dispute
        address proposedBy;                // Address that proposed the resolution
    }

    struct Project {
        uint256 id;
        address client;
        address contributor;
        string title;
        string description;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 refundedAmount;
        bool isFunded;
        bool isAccepted;
        ProjectStatus status;
        uint256 milestoneCount;
    }

    // --- Constants ---

    /// @notice Maximum number of milestones per project.
    uint256 public constant MAX_MILESTONES = 25;

    // --- State Variables ---

    /// @notice The DOGE token ERC-20 contract (0x530000000000000000000000000000000000d09e on DogeOS)
    IERC20 public immutable dogeToken;

    /// @notice Total number of projects created
    uint256 public projectCount;

    /// @notice Mapping from project ID to Project
    mapping(uint256 => Project) public projects;

    /// @notice Mapping from project ID to milestone index to Milestone
    mapping(uint256 => mapping(uint256 => Milestone)) public projectMilestones;

    /// @notice Mapping from user address to array of project IDs they participate in
    mapping(address => uint256[]) private userProjectIds;

    // --- Events ---

    event ProjectCreated(
        uint256 indexed projectId,
        address indexed client,
        address indexed contributor,
        string title,
        uint256 totalAmount,
        uint256 milestoneCount
    );

    event ProjectFunded(
        uint256 indexed projectId,
        address indexed client,
        uint256 amount
    );

    event ProjectAccepted(
        uint256 indexed projectId,
        address indexed contributor
    );

    event ProjectActivated(
        uint256 indexed projectId
    );

    event ProjectCancelled(
        uint256 indexed projectId,
        address indexed client,
        uint256 refundedAmount
    );

    event MilestoneSubmitted(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex,
        string evidenceUrl,
        string evidenceHash,
        uint256 submittedAt
    );

    event MilestoneApproved(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex,
        uint256 amount,
        address indexed contributor
    );

    event MilestoneDisputed(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex,
        string reason
    );

    event DisputeResolutionProposed(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex,
        ResolutionOutcome outcome,
        address indexed proposedBy
    );

    event DisputeResolved(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex,
        ResolutionOutcome outcome,
        uint256 amount,
        address recipient
    );

    event ProjectCompleted(
        uint256 indexed projectId
    );

    // --- Custom Errors ---

    error InvalidTokenAddress();
    error InvalidClientAddress();
    error InvalidContributorAddress();
    error ClientEqualsContributor();
    error EmptyMilestones();
    error TooManyMilestones();
    error InvalidMilestoneAmount();
    error InvalidMilestoneDeadline();
    error ProjectDoesNotExist();
    error Unauthorized();
    error InvalidProjectState();
    error InvalidMilestoneIndex();
    error InvalidMilestoneState();
    error AlreadyFunded();
    error AlreadyAccepted();
    error NotFunded();
    error NotAccepted();
    error EmptyEvidence();
    error InvalidResolutionOutcome();
    error ResolutionNotAgreed();

    // --- Modifiers ---

    modifier onlyClient(uint256 projectId) {
        if (msg.sender != projects[projectId].client) revert Unauthorized();
        _;
    }

    modifier onlyContributor(uint256 projectId) {
        if (msg.sender != projects[projectId].contributor) revert Unauthorized();
        _;
    }

    modifier onlyParticipant(uint256 projectId) {
        address client = projects[projectId].client;
        address contributor = projects[projectId].contributor;
        if (msg.sender != client && msg.sender != contributor) revert Unauthorized();
        _;
    }

    // --- Constructor ---

    /**
     * @notice Initializes the escrow contract with the DOGE ERC-20 token interface.
     * @param _dogeToken Address of the DOGE token (0x530000000000000000000000000000000000d09e on DogeOS).
     */
    constructor(address _dogeToken) {
        if (_dogeToken == address(0)) revert InvalidTokenAddress();
        dogeToken = IERC20(_dogeToken);
    }

    // --- Core Functions ---

    /**
     * @notice Creates a new project agreement with milestone definitions. (Flow B)
     * @param contributor Address of the designated contributor.
     * @param title Project title.
     * @param description Project description.
     * @param milestones Array of milestone definitions.
     * @return projectId The unique identifier of the created project.
     */
    function createProject(
        address contributor,
        string calldata title,
        string calldata description,
        MilestoneInput[] calldata milestones
    ) external returns (uint256 projectId) {
        if (contributor == address(0)) revert InvalidContributorAddress();
        if (msg.sender == contributor) revert ClientEqualsContributor();
        if (milestones.length == 0) revert EmptyMilestones();
        if (milestones.length > MAX_MILESTONES) revert TooManyMilestones();

        projectId = ++projectCount;
        uint256 totalAmount = 0;

        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestones[i].amount == 0) revert InvalidMilestoneAmount();
            if (milestones[i].deadline <= block.timestamp) revert InvalidMilestoneDeadline();

            totalAmount += milestones[i].amount;

            projectMilestones[projectId][i] = Milestone({
                name: milestones[i].name,
                description: milestones[i].description,
                amount: milestones[i].amount,
                deadline: milestones[i].deadline,
                deliverableRequirements: milestones[i].deliverableRequirements,
                evidenceUrl: "",
                evidenceHash: "",
                submittedAt: 0,
                status: MilestoneStatus.Pending,
                proposedOutcome: ResolutionOutcome.None,
                proposedBy: address(0)
            });
        }

        projects[projectId] = Project({
            id: projectId,
            client: msg.sender,
            contributor: contributor,
            title: title,
            description: description,
            totalAmount: totalAmount,
            releasedAmount: 0,
            refundedAmount: 0,
            isFunded: false,
            isAccepted: false,
            status: ProjectStatus.Created,
            milestoneCount: milestones.length
        });

        userProjectIds[msg.sender].push(projectId);
        userProjectIds[contributor].push(projectId);

        emit ProjectCreated(
            projectId,
            msg.sender,
            contributor,
            title,
            totalAmount,
            milestones.length
        );
    }

    /**
     * @notice Deposits the exact required amount of DOGE into the escrow contract. (Flow D)
     *         The client must have approved the contract to spend the exact totalAmount.
     * @param projectId ID of the project to fund.
     */
    function fundProject(uint256 projectId) external nonReentrant onlyClient(projectId) {
        Project storage project = projects[projectId];

        if (project.status != ProjectStatus.Created) revert InvalidProjectState();
        if (project.isFunded) revert AlreadyFunded();

        project.isFunded = true;

        // Checks-Effects-Interactions: Transfer exact totalAmount from client
        dogeToken.safeTransferFrom(msg.sender, address(this), project.totalAmount);

        emit ProjectFunded(projectId, msg.sender, project.totalAmount);

        // If contributor has already accepted, activate the project (Flow E)
        if (project.isAccepted) {
            project.status = ProjectStatus.Active;
            emit ProjectActivated(projectId);
        }
    }

    /**
     * @notice Allows designated contributor to explicitly accept the agreement. (Flow C)
     * @param projectId ID of the project to accept.
     */
    function acceptProject(uint256 projectId) external onlyContributor(projectId) {
        Project storage project = projects[projectId];

        if (project.status != ProjectStatus.Created) revert InvalidProjectState();
        if (project.isAccepted) revert AlreadyAccepted();

        project.isAccepted = true;

        emit ProjectAccepted(projectId, msg.sender);

        // If client has already funded, activate the project (Flow E)
        if (project.isFunded) {
            project.status = ProjectStatus.Active;
            emit ProjectActivated(projectId);
        }
    }

    /**
     * @notice Allows client to cancel project and withdraw deposited funds before activation. (Flow F)
     * @param projectId ID of the project to cancel.
     */
    function cancelProject(uint256 projectId) external nonReentrant onlyClient(projectId) {
        Project storage project = projects[projectId];

        if (project.status != ProjectStatus.Created) revert InvalidProjectState();
        // Cannot cancel if both accepted and funded (it would be Active)
        if (project.isAccepted && project.isFunded) revert InvalidProjectState();

        project.status = ProjectStatus.Cancelled;
        uint256 refundAmount = 0;

        if (project.isFunded) {
            refundAmount = project.totalAmount;
            project.refundedAmount = refundAmount;
            dogeToken.safeTransfer(project.client, refundAmount);
        }

        emit ProjectCancelled(projectId, msg.sender, refundAmount);
    }

    /**
     * @notice Contributor submits deliverable evidence for an active milestone. (Flow G)
     * @param projectId ID of the project.
     * @param milestoneIndex Index of the milestone.
     * @param evidenceUrl URL pointing to the milestone deliverable/evidence.
     * @param evidenceHash Content hash (e.g. SHA-256 or IPFS CID) of the deliverable.
     */
    function submitMilestone(
        uint256 projectId,
        uint256 milestoneIndex,
        string calldata evidenceUrl,
        string calldata evidenceHash
    ) external onlyContributor(projectId) {
        Project storage project = projects[projectId];
        if (project.status != ProjectStatus.Active) revert InvalidProjectState();
        if (milestoneIndex >= project.milestoneCount) revert InvalidMilestoneIndex();

        Milestone storage milestone = projectMilestones[projectId][milestoneIndex];
        if (milestone.status != MilestoneStatus.Pending) revert InvalidMilestoneState();
        if (bytes(evidenceUrl).length == 0 && bytes(evidenceHash).length == 0) revert EmptyEvidence();

        milestone.evidenceUrl = evidenceUrl;
        milestone.evidenceHash = evidenceHash;
        milestone.submittedAt = block.timestamp;
        milestone.status = MilestoneStatus.Submitted;

        emit MilestoneSubmitted(
            projectId,
            milestoneIndex,
            evidenceUrl,
            evidenceHash,
            block.timestamp
        );
    }

    /**
     * @notice Client approves a submitted milestone, releasing payment to contributor. (Flow H)
     * @param projectId ID of the project.
     * @param milestoneIndex Index of the milestone to approve.
     */
    function approveMilestone(
        uint256 projectId,
        uint256 milestoneIndex
    ) external nonReentrant onlyClient(projectId) {
        Project storage project = projects[projectId];
        if (project.status != ProjectStatus.Active) revert InvalidProjectState();
        if (milestoneIndex >= project.milestoneCount) revert InvalidMilestoneIndex();

        Milestone storage milestone = projectMilestones[projectId][milestoneIndex];
        if (milestone.status != MilestoneStatus.Submitted) revert InvalidMilestoneState();

        // Update state before external transfer (Checks-Effects-Interactions)
        milestone.status = MilestoneStatus.Approved;
        project.releasedAmount += milestone.amount;

        dogeToken.safeTransfer(project.contributor, milestone.amount);

        emit MilestoneApproved(
            projectId,
            milestoneIndex,
            milestone.amount,
            project.contributor
        );

        _checkProjectCompletion(projectId);
    }

    /**
     * @notice Client disputes a submitted milestone. Freezes milestone funds. (Flow I)
     * @param projectId ID of the project.
     * @param milestoneIndex Index of the milestone to dispute.
     * @param reason Description/reason for the dispute.
     */
    function disputeMilestone(
        uint256 projectId,
        uint256 milestoneIndex,
        string calldata reason
    ) external onlyClient(projectId) {
        Project storage project = projects[projectId];
        if (project.status != ProjectStatus.Active) revert InvalidProjectState();
        if (milestoneIndex >= project.milestoneCount) revert InvalidMilestoneIndex();

        Milestone storage milestone = projectMilestones[projectId][milestoneIndex];
        if (milestone.status != MilestoneStatus.Submitted) revert InvalidMilestoneState();

        milestone.status = MilestoneStatus.Disputed;
        milestone.proposedOutcome = ResolutionOutcome.None;
        milestone.proposedBy = address(0);

        emit MilestoneDisputed(projectId, milestoneIndex, reason);
    }

    /**
     * @notice Propose a resolution outcome for a disputed milestone. (Flow J Option 1)
     * @param projectId ID of the project.
     * @param milestoneIndex Index of the disputed milestone.
     * @param outcome Desired outcome (ReleaseToContributor or RefundToClient).
     */
    function proposeDisputeResolution(
        uint256 projectId,
        uint256 milestoneIndex,
        ResolutionOutcome outcome
    ) external onlyParticipant(projectId) {
        Project storage project = projects[projectId];
        if (project.status != ProjectStatus.Active) revert InvalidProjectState();
        if (milestoneIndex >= project.milestoneCount) revert InvalidMilestoneIndex();

        Milestone storage milestone = projectMilestones[projectId][milestoneIndex];
        if (milestone.status != MilestoneStatus.Disputed) revert InvalidMilestoneState();
        if (outcome == ResolutionOutcome.None) revert InvalidResolutionOutcome();

        milestone.proposedOutcome = outcome;
        milestone.proposedBy = msg.sender;

        emit DisputeResolutionProposed(projectId, milestoneIndex, outcome, msg.sender);
    }

    /**
     * @notice Jointly resolve a disputed milestone. (Flow J)
     *         Requires either:
     *         1) Direct concession (Client authorizing ReleaseToContributor, OR Contributor authorizing RefundToClient)
     *         2) Confirmation of the counterpart's active proposal
     * @param projectId ID of the project.
     * @param milestoneIndex Index of the disputed milestone.
     * @param outcome Resolution outcome to execute.
     */
    function resolveDispute(
        uint256 projectId,
        uint256 milestoneIndex,
        ResolutionOutcome outcome
    ) external nonReentrant onlyParticipant(projectId) {
        Project storage project = projects[projectId];
        if (project.status != ProjectStatus.Active) revert InvalidProjectState();
        if (milestoneIndex >= project.milestoneCount) revert InvalidMilestoneIndex();

        Milestone storage milestone = projectMilestones[projectId][milestoneIndex];
        if (milestone.status != MilestoneStatus.Disputed) revert InvalidMilestoneState();
        if (outcome == ResolutionOutcome.None) revert InvalidResolutionOutcome();

        bool isClient = (msg.sender == project.client);
        bool isDirectConcession = (isClient && outcome == ResolutionOutcome.ReleaseToContributor) ||
                                  (!isClient && outcome == ResolutionOutcome.RefundToClient);

        bool isAcceptingCounterpartProposal = (milestone.proposedOutcome == outcome) &&
                                              (milestone.proposedBy != address(0)) &&
                                              (milestone.proposedBy != msg.sender);

        if (!isDirectConcession && !isAcceptingCounterpartProposal) {
            revert ResolutionNotAgreed();
        }

        // Checks-Effects-Interactions: distinguish ResolvedReleased vs ResolvedRefunded
        address recipient;
        if (outcome == ResolutionOutcome.ReleaseToContributor) {
            milestone.status = MilestoneStatus.ResolvedReleased;
            recipient = project.contributor;
            project.releasedAmount += milestone.amount;
        } else {
            milestone.status = MilestoneStatus.ResolvedRefunded;
            recipient = project.client;
            project.refundedAmount += milestone.amount;
        }

        milestone.proposedOutcome = outcome;

        dogeToken.safeTransfer(recipient, milestone.amount);

        emit DisputeResolved(
            projectId,
            milestoneIndex,
            outcome,
            milestone.amount,
            recipient
        );

        _checkProjectCompletion(projectId);
    }

    // --- Internal Helpers ---

    function _checkProjectCompletion(uint256 projectId) internal {
        Project storage project = projects[projectId];
        uint256 count = project.milestoneCount;

        for (uint256 i = 0; i < count; i++) {
            MilestoneStatus s = projectMilestones[projectId][i].status;
            if (s != MilestoneStatus.Approved &&
                s != MilestoneStatus.ResolvedReleased &&
                s != MilestoneStatus.ResolvedRefunded) {
                return; // Some milestones are still pending, submitted, or disputed
            }
        }

        project.status = ProjectStatus.Completed;
        emit ProjectCompleted(projectId);
    }

    // --- View Functions ---

    /**
     * @notice Returns project header details.
     * @param projectId ID of the project.
     */
    function getProject(uint256 projectId) external view returns (Project memory) {
        if (projectId == 0 || projectId > projectCount) revert ProjectDoesNotExist();
        return projects[projectId];
    }

    /**
     * @notice Returns a specific milestone of a project.
     * @param projectId ID of the project.
     * @param milestoneIndex Index of the milestone.
     */
    function getMilestone(
        uint256 projectId,
        uint256 milestoneIndex
    ) external view returns (Milestone memory) {
        if (projectId == 0 || projectId > projectCount) revert ProjectDoesNotExist();
        if (milestoneIndex >= projects[projectId].milestoneCount) revert InvalidMilestoneIndex();
        return projectMilestones[projectId][milestoneIndex];
    }

    /**
     * @notice Returns all milestones for a project in a single call.
     * @param projectId ID of the project.
     */
    function getMilestones(uint256 projectId) external view returns (Milestone[] memory) {
        if (projectId == 0 || projectId > projectCount) revert ProjectDoesNotExist();
        uint256 count = projects[projectId].milestoneCount;
        Milestone[] memory milestones = new Milestone[](count);

        for (uint256 i = 0; i < count; i++) {
            milestones[i] = projectMilestones[projectId][i];
        }

        return milestones;
    }

    /**
     * @notice Returns list of project IDs associated with an address (as client or contributor).
     * @param user User address.
     */
    function getUserProjects(address user) external view returns (uint256[] memory) {
        return userProjectIds[user];
    }
}
