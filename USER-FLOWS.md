# DogeCommit — User Flows

**Document:** USER-FLOWS.md  
**Version:** 1.0  
**Status:** Draft for Blueprint Review

---

## 1. Purpose

This document defines the complete user journey through DogeCommit, from project creation to final DOGE settlement.

It describes the actions available to clients and contributors, the expected system responses, project lifecycle transitions, milestone workflows, and dispute-resolution procedures.

The goal is to ensure that every important user action has a clear and predictable outcome.

## 2. User Roles

### 2.1 Client

The client is the person or organization hiring a contributor.

The client can:

- Connect a DogeOS-compatible wallet.
- Create an escrow project.
- Specify the contributor's wallet address.
- Define milestones and their DOGE amounts.
- Fund the project.
- Review submitted milestone evidence.
- Approve or dispute submitted milestones.
- Participate in dispute resolution.

### 2.2 Contributor

The contributor is the person performing the agreed work.

The contributor can:

- Connect a DogeOS-compatible wallet.
- View assigned project details.
- Explicitly accept an assigned project onchain (or choose not to accept).
- Submit milestone evidence.
- Participate in dispute resolution.
- Receive DOGE after milestone approval or an agreed dispute outcome.

## 3. Main User Journey

The overall workflow is:

1. Client connects wallet.
2. Client creates a project.
3. Contributor reviews the project.
4. Contributor accepts the project.
5. Client funds the escrow.
6. Project becomes active once both acceptance and funding are complete.
7. Contributor completes and submits milestones.
8. Client approves or disputes each submission.
9. DOGE is released or refunded according to the outcome.
10. Project becomes completed after every milestone is settled.

Funding and contributor acceptance may happen in either order.

## 4. Flow A — Wallet Connection

**Actor:** Client or Contributor

1. User opens DogeCommit.
2. User selects Connect Wallet.
3. Application requests wallet connection.
4. User approves the connection in their wallet.
5. Application reads the connected wallet address and network.
6. Application verifies that the wallet is connected to DogeOS Chikyū Testnet.
7. If the network is incorrect, the application displays a network warning and provides a network-switch option where supported.
8. Once connected, the user can access the relevant project functionality.

**Expected result:** The application recognizes the user's wallet address and network.

**Failure conditions:**

- User rejects the connection.
- Wallet provider is unavailable.
- Network is unsupported.
- Wallet connection fails.

The application must never request or store the user's private key or seed phrase.

## 5. Flow B — Project Creation

**Actor:** Client

1. Client connects their wallet.
2. Client opens Create Project.
3. Client enters the project title.
4. Client enters a project description.
5. Client enters the contributor's wallet address.
6. Client defines one or more milestones (up to a maximum of 25).
7. For every milestone, the client provides:
   - Milestone title.
   - Description of expected work.
   - DOGE payment amount.
   - Target deadline.
8. Application calculates the total project value.
9. Client reviews the project details.
10. Client confirms project creation through their wallet.
11. Smart contract creates the project.
12. Application displays the project ID and project details.

**Expected result:** A project is created with a unique on-chain project ID.

**Validation rules:**

- Contributor address must be valid and non-zero.
- Client and contributor cannot be the same address.
- At least one milestone is required, and no more than 25 milestones are permitted (`1 <= milestoneCount <= 25`).
- Any project creation attempt with 26 or more milestones must be rejected.
- Every milestone amount must be greater than zero.
- Deadline must be valid and in the future at creation.
- Total milestone amount must be calculated correctly.

The milestone amounts and agreed project terms must not be silently changed after creation.

## 6. Flow C — Contributor Acceptance

**Actor:** Contributor

1. Contributor connects the wallet associated with the assigned contributor address.
2. Contributor opens the assigned project.
3. Contributor reviews the project description.
4. Contributor reviews every milestone, amount and deadline.
5. If agreeable, Contributor chooses Accept Project (no explicit onchain decline function exists; if rejected or ignored, the contributor simply does not accept).
6. Contributor confirms the transaction through their wallet.
7. Smart contract records acceptance.
8. Application checks whether the project is already funded.

**If the project is already funded:**

- The project automatically becomes Active.

**If the project is not funded:**

- The project remains Created until the client funds it.

**Expected result:** Contributor acceptance is permanently recorded on-chain.

The contributor must not be able to accept the same project twice or accept a project assigned to another wallet. If the contributor decides not to accept, no onchain action is required from the contributor; the project remains unaccepted until the client cancels it.

## 7. Flow D — Client Funding

**Actor:** Client

1. Client opens the created project.
2. Application displays the total DOGE amount required.
3. Client checks their wallet balance.
4. Client approves the exact required DOGE amount for the escrow contract through the DOGE token interface.
5. Client confirms the funding transaction.
6. Smart contract transfers the exact amount into escrow.
7. Smart contract records the project as funded.
8. Application displays the funding confirmation.

**If the contributor has already accepted:**

- The project automatically becomes Active.

**If the contributor has not accepted:**

- The project remains Created and funded until acceptance or client cancellation.

**Expected result:** The full project amount is held by the escrow contract.

**Important:** The contract must not accept partial funding as a completed project deposit.

## 8. Flow E — Project Activation

A project becomes Active only when both conditions are true:

- Client funding is complete.
- Contributor acceptance is recorded.

The conditions may be satisfied in either order.

| Funding | Acceptance | Project state |
|---|---|---|
| No | No | Created |
| Yes | No | Created |
| No | Yes | Created |
| Yes | Yes | Active |

Activation must happen automatically when the second condition is satisfied.

Once Active, the project cannot be cancelled through the pre-activation cancellation function.

## 9. Flow F — Pre-Activation Cancellation

**Actor:** Client

Cancellation protects the client if the contributor never accepts, declines offchain, or the project never becomes active.

1. Client opens the project.
2. Client selects Cancel Project.
3. Application explains that cancellation is available only before activation.
4. Client confirms the transaction.
5. Smart contract checks that the project is not Active or Completed.
6. Smart contract marks the project Cancelled.
7. If the client previously funded the project, the full deposited amount is refunded.
8. If the project was not funded, no refund transfer is required.
9. Application displays the cancellation result.

**Rules:**

- Only the client can cancel before activation.
- Cancellation is unavailable after activation.
- A cancelled project cannot be reactivated.
- No cancellation fee is charged in the MVP.

## 10. Flow G — Milestone Submission

**Actor:** Contributor

1. Contributor opens an Active project.
2. Contributor selects a milestone in Pending state.
3. Contributor completes the agreed work.
4. Contributor prepares evidence of completion.
5. Contributor submits an evidence URL or content hash.
6. Contributor confirms the transaction.
7. Smart contract records the submission.
8. Milestone state changes from Pending to Submitted.
9. Client can now review the submission.

**Evidence examples:**

- GitHub pull request URL.
- GitHub repository or commit URL.
- Document link.
- Deliverable URL.
- Content hash referencing externally stored evidence.

The MVP records evidence references. It does not independently verify whether submitted work is correct or complete.

## 11. Flow H — Milestone Approval and DOGE Release

**Actor:** Client

1. Client opens an Active project.
2. Client selects a Submitted milestone.
3. Client reviews the submitted evidence.
4. Client selects Approve Milestone.
5. Client confirms the transaction.
6. Smart contract verifies the caller and milestone state.
7. Smart contract marks the milestone Approved.
8. The exact milestone payment is transferred from escrow to the contributor.
9. Application displays the transaction confirmation.

**Expected result:** Contributor receives the agreed DOGE amount for the approved milestone.

**Rules:**

- Only the client can approve a submitted milestone.
- A milestone cannot be approved twice.
- A milestone that is Disputed cannot use the normal approval function.
- Payment must equal the agreed milestone amount.

## 12. Flow I — Milestone Dispute

**Actor:** Client

1. Client opens a Submitted milestone.
2. Client identifies an issue with the submitted work.
3. Client selects Raise Dispute.
4. Client provides a dispute reason.
5. Client confirms the transaction.
6. Smart contract changes the milestone state to Disputed and emits the dispute reason in the `MilestoneDisputed` event.
7. The disputed milestone's payment remains locked in escrow.
8. Application displays the dispute status to both parties.

**Rules:**

- Only the client can dispute a Submitted milestone in the MVP.
- A Pending or already Approved milestone cannot be disputed.
- The disputed amount cannot be released through normal approval.
- Other independent milestones may continue through their normal workflow.
- Neither party can unilaterally take the disputed amount.
- **Dispute Reason Persistence:** Dispute reasons are emitted as event data (`MilestoneDisputed`) rather than stored in contract storage. The frontend or indexer reads dispute reasons from transaction/event logs. If historical RPC logs are unavailable, historical dispute reasons cannot be recovered directly from contract state.
- **Evidence Resubmission Excluded:** Resubmitting evidence or reopening a disputed milestone is excluded from the MVP. Once disputed, the milestone stays locked until a permitted bilateral resolution or direct concession settles it.

Dispute reasons and supporting evidence should be available to both parties through the application interface.

## 13. Flow J — Mutual Dispute Resolution

**Actors:** Client and Contributor

The MVP supports two settlement outcomes:

- ReleaseToContributor
- RefundToClient

### Option 1: Proposal and Confirmation

1. Either participant proposes a resolution outcome.
2. Smart contract records the proposed outcome.
3. The other participant reviews it.
4. The other participant confirms the exact same outcome.
5. Smart contract verifies that the confirmation matches the proposal.
6. Smart contract settles the disputed milestone.
7. Milestone state changes to the corresponding resolved state.

**If ReleaseToContributor is agreed:**

- The milestone amount is transferred to the contributor.

**If RefundToClient is agreed:**

- The milestone amount is returned to the client.

A mismatched confirmation must revert.

### Option 2: Direct Concession

A participant may voluntarily concede in favour of the other party.

- Client may directly concede to ReleaseToContributor.
- Contributor may directly concede to RefundToClient.

A participant must never be able to use direct concession to transfer disputed funds to themselves without the other party's agreement.

**Important:** The MVP does not use an external arbitrator, automated judge, or decentralized arbitration network. If the parties cannot agree, the disputed funds remain locked.

## 14. Flow K — Project Completion

A project becomes Completed when every milestone has reached a final settlement state.

Final milestone states are:

- Approved — contributor received the milestone payment.
- ResolvedRefunded — client received the milestone refund.
- ResolvedReleased — contributor received the milestone payment through dispute resolution.

A milestone still in Pending, Submitted, or Disputed state is not finally settled.

When every milestone is settled:

1. Smart contract checks all milestone states.
2. Project status changes to Completed.
3. Application displays the completed project.
4. Both participants can view the final settlement history.

The total DOGE paid to the contributor plus DOGE refunded to the client must equal the original funded amount.

## 15. Project Lifecycle

The main project lifecycle is:

Created → Active → Completed

An alternative pre-activation path is:

Created → Cancelled

A project cannot move from Cancelled to Active or from Completed back to Active.

## 16. Milestone Lifecycle

Normal workflow:

Pending → Submitted → Approved

Dispute workflow:

Submitted → Disputed → ResolvedReleased

Or:

Submitted → Disputed → ResolvedRefunded

Disputed milestones cannot return to normal approval without following the agreed dispute-resolution procedure.

## 17. Error and Exception Scenarios

The application must provide clear feedback for:

- Wallet connection rejected.
- Unsupported network.
- Insufficient DOGE balance.
- Insufficient token approval.
- Transaction rejected by user.
- Transaction reverted.
- Unauthorized wallet attempting an action.
- Invalid project or milestone ID.
- Duplicate funding.
- Duplicate acceptance.
- Duplicate milestone submission.
- Attempted cancellation after activation.
- Attempted approval of a disputed milestone.
- Attempted unilateral dispute settlement.
- Invalid or mismatched resolution proposal.

Failed transactions must not be presented as successful actions.

## 18. MVP Behaviour Boundaries

The following behaviours are intentionally excluded:

- Automatic refunds after a deadline.
- Automatic milestone approval.
- AI-based evidence verification.
- Third-party arbitration.
- Reputation scoring.
- On-chain messaging.
- Partial milestone payments.
- Milestone amount modification after project creation.
- Automatic contributor replacement.
- Explicit onchain `declineProject()` function (contributor simply does not accept; client cancels pre-activation).
- Evidence resubmission or reopening of disputed milestones.
- Storing dispute reason strings in contract storage (emitted via event logs only).
- Creating projects with more than 25 milestones (`MAX_MILESTONES = 25`).

Milestone deadlines are informational in the MVP. They do not automatically release, refund, or cancel funds.

## 19. Core Acceptance Criteria

The user flows are considered correctly implemented when:

1. A client can create a project with multiple milestones (between 1 and 25 milestones; 26 or more rejected).
2. The assigned contributor can accept the project onchain (or leave it unaccepted without an explicit onchain decline transaction).
3. Client funding and contributor acceptance work in either order.
4. Project activation happens only when both conditions are satisfied.
5. A client can cancel before activation and recover any deposited amount.
6. A contributor can submit milestone evidence.
7. A client can approve a submitted milestone and release the exact amount.
8. A client can dispute a submitted milestone (with dispute reason emitted via event; evidence resubmission excluded).
9. Disputed funds remain locked until an allowed resolution occurs.
10. Dispute resolution requires agreement or direct concession by the party giving up the funds.
11. Every milestone is settled at most once.
12. Project completion occurs only after all milestones are settled.
13. Total settlement never exceeds the original project funding.

---

**End of Document — User Flows**
