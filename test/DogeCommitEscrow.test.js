const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DogeCommitEscrow", function () {
  let DogeCommitEscrow;
  let escrow;
  let TestDOGE;
  let dogeToken;

  let owner;
  let client;
  let contributor;
  let stranger;

  const DOGE_DECIMALS = 18n;
  const ONE_DOGE = 10n ** DOGE_DECIMALS;
  const HUNDRED_DOGE = 100n * ONE_DOGE;
  const FIFTY_DOGE = 50n * ONE_DOGE;

  beforeEach(async function () {
    [owner, client, contributor, stranger] = await ethers.getSigners();

    // Deploy Test DOGE token (matching DogeOS ERC-20 token interface)
    TestDOGE = await ethers.getContractFactory("TestDOGE");
    dogeToken = await TestDOGE.deploy();
    await dogeToken.waitForDeployment();

    // Deploy DogeCommitEscrow contract
    DogeCommitEscrow = await ethers.getContractFactory("DogeCommitEscrow");
    escrow = await DogeCommitEscrow.deploy(await dogeToken.getAddress());
    await escrow.waitForDeployment();

    // Mint test DOGE to client
    await dogeToken.mint(client.address, 1000n * ONE_DOGE);
  });

  describe("Initialization & Deployment", function () {
    it("should set the correct DOGE token address", async function () {
      expect(await escrow.dogeToken()).to.equal(await dogeToken.getAddress());
    });

    it("should revert if initialized with address(0)", async function () {
      await expect(
        DogeCommitEscrow.deploy(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(escrow, "InvalidTokenAddress");
    });

    it("should start with 0 project count", async function () {
      expect(await escrow.projectCount()).to.equal(0);
    });
  });

  describe("Project Creation", function () {
    let deadline1, deadline2;
    let milestoneInputs;

    beforeEach(async function () {
      const currentTime = await time.latest();
      deadline1 = currentTime + 86400; // +1 day
      deadline2 = currentTime + 172800; // +2 days

      milestoneInputs = [
        {
          name: "Milestone 1: Smart Contracts",
          description: "Write and test escrow smart contracts",
          amount: FIFTY_DOGE,
          deadline: deadline1,
          deliverableRequirements: "Contracts repository with passing tests",
        },
        {
          name: "Milestone 2: Frontend Integration",
          description: "Integrate contract with React UI",
          amount: FIFTY_DOGE,
          deadline: deadline2,
          deliverableRequirements: "Live web app connected to DogeOS testnet",
        },
      ];
    });

    it("should allow a client to create a project with multiple milestones", async function () {
      const tx = await escrow.connect(client).createProject(
        contributor.address,
        "DogeCommit MVP",
        "Milestone-based escrow on DogeOS",
        milestoneInputs
      );

      await expect(tx)
        .to.emit(escrow, "ProjectCreated")
        .withArgs(
          1,
          client.address,
          contributor.address,
          "DogeCommit MVP",
          HUNDRED_DOGE,
          2
        );

      expect(await escrow.projectCount()).to.equal(1);

      const project = await escrow.getProject(1);
      expect(project.id).to.equal(1);
      expect(project.client).to.equal(client.address);
      expect(project.contributor).to.equal(contributor.address);
      expect(project.title).to.equal("DogeCommit MVP");
      expect(project.totalAmount).to.equal(HUNDRED_DOGE);
      expect(project.releasedAmount).to.equal(0);
      expect(project.refundedAmount).to.equal(0);
      expect(project.isFunded).to.be.false;
      expect(project.isAccepted).to.be.false;
      expect(project.status).to.equal(0); // ProjectStatus.Created
      expect(project.milestoneCount).to.equal(2);

      const milestones = await escrow.getMilestones(1);
      expect(milestones.length).to.equal(2);
      expect(milestones[0].name).to.equal("Milestone 1: Smart Contracts");
      expect(milestones[0].amount).to.equal(FIFTY_DOGE);
      expect(milestones[0].status).to.equal(0); // MilestoneStatus.Pending

      // Check user projects
      const clientProjects = await escrow.getUserProjects(client.address);
      expect(clientProjects.length).to.equal(1);
      expect(clientProjects[0]).to.equal(1);

      const contributorProjects = await escrow.getUserProjects(contributor.address);
      expect(contributorProjects.length).to.equal(1);
      expect(contributorProjects[0]).to.equal(1);
    });

    it("should revert if contributor address is zero", async function () {
      await expect(
        escrow.connect(client).createProject(
          ethers.ZeroAddress,
          "Title",
          "Desc",
          milestoneInputs
        )
      ).to.be.revertedWithCustomError(escrow, "InvalidContributorAddress");
    });

    it("should revert if client address equals contributor address", async function () {
      await expect(
        escrow.connect(client).createProject(
          client.address,
          "Title",
          "Desc",
          milestoneInputs
        )
      ).to.be.revertedWithCustomError(escrow, "ClientEqualsContributor");
    });

    it("should revert if milestones array is empty", async function () {
      await expect(
        escrow.connect(client).createProject(
          contributor.address,
          "Title",
          "Desc",
          []
        )
      ).to.be.revertedWithCustomError(escrow, "EmptyMilestones");
    });

    it("should revert if milestone amount is zero", async function () {
      milestoneInputs[0].amount = 0;
      await expect(
        escrow.connect(client).createProject(
          contributor.address,
          "Title",
          "Desc",
          milestoneInputs
        )
      ).to.be.revertedWithCustomError(escrow, "InvalidMilestoneAmount");
    });

    it("should revert if milestone deadline is in the past", async function () {
      milestoneInputs[0].deadline = (await time.latest()) - 10;
      await expect(
        escrow.connect(client).createProject(
          contributor.address,
          "Title",
          "Desc",
          milestoneInputs
        )
      ).to.be.revertedWithCustomError(escrow, "InvalidMilestoneDeadline");
    });
  });

  describe("Funding & Contributor Acceptance Workflow", function () {
    let projectId;

    beforeEach(async function () {
      const currentTime = await time.latest();
      const milestoneInputs = [
        {
          name: "Milestone 1",
          description: "Deliverable 1",
          amount: HUNDRED_DOGE,
          deadline: currentTime + 86400,
          deliverableRequirements: "Deliverable 1 specs",
        },
      ];

      await escrow.connect(client).createProject(
        contributor.address,
        "Project A",
        "Description A",
        milestoneInputs
      );
      projectId = 1;
    });

    it("should allow client to fund with exact token approval", async function () {
      await dogeToken.connect(client).approve(await escrow.getAddress(), HUNDRED_DOGE);

      const clientInitialBalance = await dogeToken.balanceOf(client.address);
      const escrowInitialBalance = await dogeToken.balanceOf(await escrow.getAddress());

      const tx = await escrow.connect(client).fundProject(projectId);

      await expect(tx)
        .to.emit(escrow, "ProjectFunded")
        .withArgs(projectId, client.address, HUNDRED_DOGE);

      expect(await dogeToken.balanceOf(client.address)).to.equal(clientInitialBalance - HUNDRED_DOGE);
      expect(await dogeToken.balanceOf(await escrow.getAddress())).to.equal(escrowInitialBalance + HUNDRED_DOGE);

      const project = await escrow.getProject(projectId);
      expect(project.isFunded).to.be.true;
      expect(project.status).to.equal(0); // ProjectStatus.Created
    });

    it("should revert if non-client attempts to fund", async function () {
      await expect(
        escrow.connect(stranger).fundProject(projectId)
      ).to.be.revertedWithCustomError(escrow, "Unauthorized");
    });

    it("should revert if client tries to fund twice", async function () {
      await dogeToken.connect(client).approve(await escrow.getAddress(), HUNDRED_DOGE * 2n);
      await escrow.connect(client).fundProject(projectId);

      await expect(
        escrow.connect(client).fundProject(projectId)
      ).to.be.revertedWithCustomError(escrow, "AlreadyFunded");
    });

    it("should allow contributor to accept project", async function () {
      const tx = await escrow.connect(contributor).acceptProject(projectId);

      await expect(tx)
        .to.emit(escrow, "ProjectAccepted")
        .withArgs(projectId, contributor.address);

      const project = await escrow.getProject(projectId);
      expect(project.isAccepted).to.be.true;
      expect(project.status).to.equal(0);
    });

    it("should revert if non-contributor attempts to accept", async function () {
      await expect(
        escrow.connect(stranger).acceptProject(projectId)
      ).to.be.revertedWithCustomError(escrow, "Unauthorized");
    });

    it("should revert if contributor tries to accept twice", async function () {
      await escrow.connect(contributor).acceptProject(projectId);
      await expect(
        escrow.connect(contributor).acceptProject(projectId)
      ).to.be.revertedWithCustomError(escrow, "AlreadyAccepted");
    });

    it("should activate project when funded first, then accepted", async function () {
      await dogeToken.connect(client).approve(await escrow.getAddress(), HUNDRED_DOGE);
      await escrow.connect(client).fundProject(projectId);

      const tx = await escrow.connect(contributor).acceptProject(projectId);
      await expect(tx).to.emit(escrow, "ProjectActivated").withArgs(projectId);

      const project = await escrow.getProject(projectId);
      expect(project.status).to.equal(1); // ProjectStatus.Active
    });

    it("should activate project when accepted first, then funded", async function () {
      await escrow.connect(contributor).acceptProject(projectId);

      await dogeToken.connect(client).approve(await escrow.getAddress(), HUNDRED_DOGE);
      const tx = await escrow.connect(client).fundProject(projectId);
      await expect(tx).to.emit(escrow, "ProjectActivated").withArgs(projectId);

      const project = await escrow.getProject(projectId);
      expect(project.status).to.equal(1); // ProjectStatus.Active
    });

    it("should allow client to cancel and refund if project is not yet active", async function () {
      await dogeToken.connect(client).approve(await escrow.getAddress(), HUNDRED_DOGE);
      await escrow.connect(client).fundProject(projectId);

      const clientBeforeCancel = await dogeToken.balanceOf(client.address);
      const tx = await escrow.connect(client).cancelProject(projectId);

      await expect(tx)
        .to.emit(escrow, "ProjectCancelled")
        .withArgs(projectId, client.address, HUNDRED_DOGE);

      expect(await dogeToken.balanceOf(client.address)).to.equal(clientBeforeCancel + HUNDRED_DOGE);

      const project = await escrow.getProject(projectId);
      expect(project.status).to.equal(3); // ProjectStatus.Cancelled
    });

    it("should revert if client tries to cancel an already active project", async function () {
      await dogeToken.connect(client).approve(await escrow.getAddress(), HUNDRED_DOGE);
      await escrow.connect(client).fundProject(projectId);
      await escrow.connect(contributor).acceptProject(projectId);

      await expect(
        escrow.connect(client).cancelProject(projectId)
      ).to.be.revertedWithCustomError(escrow, "InvalidProjectState");
    });
  });

  describe("Milestone Submission & Approval", function () {
    let projectId;

    beforeEach(async function () {
      const currentTime = await time.latest();
      const milestoneInputs = [
        {
          name: "Milestone 1",
          description: "Deliverable 1",
          amount: FIFTY_DOGE,
          deadline: currentTime + 86400,
          deliverableRequirements: "Deliverable 1 specs",
        },
        {
          name: "Milestone 2",
          description: "Deliverable 2",
          amount: FIFTY_DOGE,
          deadline: currentTime + 172800,
          deliverableRequirements: "Deliverable 2 specs",
        },
      ];

      await escrow.connect(client).createProject(
        contributor.address,
        "Project A",
        "Description A",
        milestoneInputs
      );
      projectId = 1;

      // Fund and Accept
      await dogeToken.connect(client).approve(await escrow.getAddress(), HUNDRED_DOGE);
      await escrow.connect(client).fundProject(projectId);
      await escrow.connect(contributor).acceptProject(projectId);
    });

    it("should allow contributor to submit evidence for an active milestone", async function () {
      const evidenceUrl = "https://github.com/dogecommit/repo/commit/1234567";
      const evidenceHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";

      const tx = await escrow.connect(contributor).submitMilestone(
        projectId,
        0,
        evidenceUrl,
        evidenceHash
      );

      const blockTimestamp = (await ethers.provider.getBlock(tx.blockNumber)).timestamp;

      await expect(tx)
        .to.emit(escrow, "MilestoneSubmitted")
        .withArgs(projectId, 0, evidenceUrl, evidenceHash, blockTimestamp);

      const milestone = await escrow.getMilestone(projectId, 0);
      expect(milestone.evidenceUrl).to.equal(evidenceUrl);
      expect(milestone.evidenceHash).to.equal(evidenceHash);
      expect(milestone.status).to.equal(1); // MilestoneStatus.Submitted
      expect(milestone.submittedAt).to.equal(blockTimestamp);
    });

    it("should revert if unauthorized party attempts to submit", async function () {
      await expect(
        escrow.connect(stranger).submitMilestone(projectId, 0, "url", "hash")
      ).to.be.revertedWithCustomError(escrow, "Unauthorized");
    });

    it("should revert if evidence is empty", async function () {
      await expect(
        escrow.connect(contributor).submitMilestone(projectId, 0, "", "")
      ).to.be.revertedWithCustomError(escrow, "EmptyEvidence");
    });

    it("should revert if submitting for out-of-bounds milestone index", async function () {
      await expect(
        escrow.connect(contributor).submitMilestone(projectId, 99, "url", "hash")
      ).to.be.revertedWithCustomError(escrow, "InvalidMilestoneIndex");
    });

    it("should revert if submitting milestone that is already submitted", async function () {
      await escrow.connect(contributor).submitMilestone(projectId, 0, "url", "hash");
      await expect(
        escrow.connect(contributor).submitMilestone(projectId, 0, "url2", "hash2")
      ).to.be.revertedWithCustomError(escrow, "InvalidMilestoneState");
    });

    it("should allow client to approve submitted milestone and release exact DOGE", async function () {
      await escrow.connect(contributor).submitMilestone(
        projectId,
        0,
        "https://github.com/repo",
        "0x1234"
      );

      const contributorInitialBalance = await dogeToken.balanceOf(contributor.address);

      const tx = await escrow.connect(client).approveMilestone(projectId, 0);

      await expect(tx)
        .to.emit(escrow, "MilestoneApproved")
        .withArgs(projectId, 0, FIFTY_DOGE, contributor.address);

      expect(await dogeToken.balanceOf(contributor.address)).to.equal(
        contributorInitialBalance + FIFTY_DOGE
      );

      const milestone = await escrow.getMilestone(projectId, 0);
      expect(milestone.status).to.equal(2); // MilestoneStatus.Approved

      const project = await escrow.getProject(projectId);
      expect(project.releasedAmount).to.equal(FIFTY_DOGE);
      expect(project.status).to.equal(1); // Still Active because milestone 1 is not approved yet
    });

    it("should revert if client attempts to approve milestone that is not submitted", async function () {
      await expect(
        escrow.connect(client).approveMilestone(projectId, 0)
      ).to.be.revertedWithCustomError(escrow, "InvalidMilestoneState");
    });

    it("should revert if non-client attempts to approve", async function () {
      await escrow.connect(contributor).submitMilestone(projectId, 0, "url", "hash");
      await expect(
        escrow.connect(contributor).approveMilestone(projectId, 0)
      ).to.be.revertedWithCustomError(escrow, "Unauthorized");
    });

    it("should mark project as Completed when all milestones are approved", async function () {
      // Milestone 0
      await escrow.connect(contributor).submitMilestone(projectId, 0, "url0", "hash0");
      await escrow.connect(client).approveMilestone(projectId, 0);

      // Milestone 1
      await escrow.connect(contributor).submitMilestone(projectId, 1, "url1", "hash1");
      const tx = await escrow.connect(client).approveMilestone(projectId, 1);

      await expect(tx).to.emit(escrow, "ProjectCompleted").withArgs(projectId);

      const project = await escrow.getProject(projectId);
      expect(project.status).to.equal(2); // ProjectStatus.Completed
      expect(project.releasedAmount).to.equal(HUNDRED_DOGE);
    });
  });

  describe("Dispute & Mutual Dispute Resolution", function () {
    let projectId;

    beforeEach(async function () {
      const currentTime = await time.latest();
      const milestoneInputs = [
        {
          name: "Milestone 1",
          description: "Deliverable 1",
          amount: FIFTY_DOGE,
          deadline: currentTime + 86400,
          deliverableRequirements: "Deliverable 1 specs",
        },
        {
          name: "Milestone 2",
          description: "Deliverable 2",
          amount: FIFTY_DOGE,
          deadline: currentTime + 172800,
          deliverableRequirements: "Deliverable 2 specs",
        },
      ];

      await escrow.connect(client).createProject(
        contributor.address,
        "Project A",
        "Description A",
        milestoneInputs
      );
      projectId = 1;

      await dogeToken.connect(client).approve(await escrow.getAddress(), HUNDRED_DOGE);
      await escrow.connect(client).fundProject(projectId);
      await escrow.connect(contributor).acceptProject(projectId);

      // Contributor submits milestone 0
      await escrow.connect(contributor).submitMilestone(
        projectId,
        0,
        "https://github.com/repo/pr/1",
        "0x1111"
      );
    });

    it("should allow client to dispute a submitted milestone, locking funds", async function () {
      const tx = await escrow.connect(client).disputeMilestone(
        projectId,
        0,
        "Deliverable does not meet test coverage requirements"
      );

      await expect(tx)
        .to.emit(escrow, "MilestoneDisputed")
        .withArgs(projectId, 0, "Deliverable does not meet test coverage requirements");

      const milestone = await escrow.getMilestone(projectId, 0);
      expect(milestone.status).to.equal(3); // MilestoneStatus.Disputed
    });

    it("should revert if client tries to dispute an unsubmitted milestone", async function () {
      await expect(
        escrow.connect(client).disputeMilestone(projectId, 1, "Not submitted yet")
      ).to.be.revertedWithCustomError(escrow, "InvalidMilestoneState");
    });

    it("should prevent contributor from withdrawing disputed funds through normal approval", async function () {
      await escrow.connect(client).disputeMilestone(projectId, 0, "Incomplete");

      await expect(
        escrow.connect(client).approveMilestone(projectId, 0)
      ).to.be.revertedWithCustomError(escrow, "InvalidMilestoneState");
    });

    it("should allow mutual resolution via Proposal & Confirmation (RefundToClient)", async function () {
      await escrow.connect(client).disputeMilestone(projectId, 0, "Incomplete");

      // Client proposes refund (Outcome 2 = RefundToClient)
      const txProp = await escrow.connect(client).proposeDisputeResolution(
        projectId,
        0,
        2 // RefundToClient
      );

      await expect(txProp)
        .to.emit(escrow, "DisputeResolutionProposed")
        .withArgs(projectId, 0, 2, client.address);

      // Contributor confirms the proposed refund
      const clientBalanceBefore = await dogeToken.balanceOf(client.address);

      const txResolve = await escrow.connect(contributor).resolveDispute(
        projectId,
        0,
        2 // RefundToClient
      );

      await expect(txResolve)
        .to.emit(escrow, "DisputeResolved")
        .withArgs(projectId, 0, 2, FIFTY_DOGE, client.address);

      expect(await dogeToken.balanceOf(client.address)).to.equal(clientBalanceBefore + FIFTY_DOGE);

      const milestone = await escrow.getMilestone(projectId, 0);
      expect(milestone.status).to.equal(5); // MilestoneStatus.ResolvedRefunded

      const project = await escrow.getProject(projectId);
      expect(project.refundedAmount).to.equal(FIFTY_DOGE);
    });

    it("should allow mutual resolution via Proposal & Confirmation (ReleaseToContributor)", async function () {
      await escrow.connect(client).disputeMilestone(projectId, 0, "Incomplete");

      // Contributor proposes release (Outcome 1 = ReleaseToContributor)
      await escrow.connect(contributor).proposeDisputeResolution(
        projectId,
        0,
        1 // ReleaseToContributor
      );

      // Client confirms and authorizes release
      const contributorBalanceBefore = await dogeToken.balanceOf(contributor.address);

      const txResolve = await escrow.connect(client).resolveDispute(
        projectId,
        0,
        1 // ReleaseToContributor
      );

      await expect(txResolve)
        .to.emit(escrow, "DisputeResolved")
        .withArgs(projectId, 0, 1, FIFTY_DOGE, contributor.address);

      expect(await dogeToken.balanceOf(contributor.address)).to.equal(
        contributorBalanceBefore + FIFTY_DOGE
      );

      const milestone = await escrow.getMilestone(projectId, 0);
      expect(milestone.status).to.equal(4); // MilestoneStatus.ResolvedReleased

      const project = await escrow.getProject(projectId);
      expect(project.releasedAmount).to.equal(FIFTY_DOGE);
    });

    it("should allow direct concession by client releasing funds to contributor", async function () {
      await escrow.connect(client).disputeMilestone(projectId, 0, "Incomplete");

      const contributorBalanceBefore = await dogeToken.balanceOf(contributor.address);

      // Client directly decides to concede and release to contributor without needing proposal
      const tx = await escrow.connect(client).resolveDispute(projectId, 0, 1);

      await expect(tx)
        .to.emit(escrow, "DisputeResolved")
        .withArgs(projectId, 0, 1, FIFTY_DOGE, contributor.address);

      expect(await dogeToken.balanceOf(contributor.address)).to.equal(
        contributorBalanceBefore + FIFTY_DOGE
      );
    });

    it("should allow direct concession by contributor refunding funds to client", async function () {
      await escrow.connect(client).disputeMilestone(projectId, 0, "Incomplete");

      const clientBalanceBefore = await dogeToken.balanceOf(client.address);

      // Contributor directly decides to forfeit and refund to client without needing proposal
      const tx = await escrow.connect(contributor).resolveDispute(projectId, 0, 2);

      await expect(tx)
        .to.emit(escrow, "DisputeResolved")
        .withArgs(projectId, 0, 2, FIFTY_DOGE, client.address);

      expect(await dogeToken.balanceOf(client.address)).to.equal(clientBalanceBefore + FIFTY_DOGE);
    });

    it("should REVERT if client tries to unilaterally refund funds to themselves without agreement", async function () {
      await escrow.connect(client).disputeMilestone(projectId, 0, "Incomplete");

      await expect(
        escrow.connect(client).resolveDispute(projectId, 0, 2)
      ).to.be.revertedWithCustomError(escrow, "ResolutionNotAgreed");
    });

    it("should REVERT if contributor tries to unilaterally release funds to themselves without agreement", async function () {
      await escrow.connect(client).disputeMilestone(projectId, 0, "Incomplete");

      await expect(
        escrow.connect(contributor).resolveDispute(projectId, 0, 1)
      ).to.be.revertedWithCustomError(escrow, "ResolutionNotAgreed");
    });

    it("should REVERT if stranger attempts to propose or resolve dispute", async function () {
      await escrow.connect(client).disputeMilestone(projectId, 0, "Incomplete");

      await expect(
        escrow.connect(stranger).proposeDisputeResolution(projectId, 0, 1)
      ).to.be.revertedWithCustomError(escrow, "Unauthorized");

      await expect(
        escrow.connect(stranger).resolveDispute(projectId, 0, 1)
      ).to.be.revertedWithCustomError(escrow, "Unauthorized");
    });

    it("should REVERT if proposing or resolving with Outcome.None", async function () {
      await escrow.connect(client).disputeMilestone(projectId, 0, "Incomplete");

      await expect(
        escrow.connect(client).proposeDisputeResolution(projectId, 0, 0)
      ).to.be.revertedWithCustomError(escrow, "InvalidResolutionOutcome");

      await expect(
        escrow.connect(client).resolveDispute(projectId, 0, 0)
      ).to.be.revertedWithCustomError(escrow, "InvalidResolutionOutcome");
    });

    it("should settle full project with one approved milestone and one disputed/refunded milestone", async function () {
      // Milestone 0 was submitted. Let's dispute it and mutually refund to client
      await escrow.connect(client).disputeMilestone(projectId, 0, "Flawed work");
      // Contributor concedes refund
      await escrow.connect(contributor).resolveDispute(projectId, 0, 2);

      // Milestone 1 submitted and approved
      await escrow.connect(contributor).submitMilestone(projectId, 1, "url2", "hash2");
      const tx = await escrow.connect(client).approveMilestone(projectId, 1);

      await expect(tx).to.emit(escrow, "ProjectCompleted").withArgs(projectId);

      const project = await escrow.getProject(projectId);
      expect(project.status).to.equal(2); // Completed
      expect(project.releasedAmount).to.equal(FIFTY_DOGE);
      expect(project.refundedAmount).to.equal(FIFTY_DOGE);

      // Escrow contract DOGE balance should now be exactly 0
      expect(await dogeToken.balanceOf(await escrow.getAddress())).to.equal(0);
    });
  });

  describe("View Functions and Validation Guards", function () {
    it("should revert getProject for non-existent project", async function () {
      await expect(escrow.getProject(999)).to.be.revertedWithCustomError(
        escrow,
        "ProjectDoesNotExist"
      );
    });

    it("should revert getMilestone for non-existent project", async function () {
      await expect(escrow.getMilestone(999, 0)).to.be.revertedWithCustomError(
        escrow,
        "ProjectDoesNotExist"
      );
    });

    it("should revert getMilestones for non-existent project", async function () {
      await expect(escrow.getMilestones(999)).to.be.revertedWithCustomError(
        escrow,
        "ProjectDoesNotExist"
      );
    });
  });
});
