# DogeCommit Smart Contracts

> **Work delivered. DOGE secured.**  
> DOGE-native milestone-based escrow application for **DogeOS Chikyū Testnet**.

## Overview

DogeCommit is an onchain milestone-based escrow contract designed to eliminate trust-related payment friction between Web3 clients and independent contributors.

### Key Features
- **Native DOGE ERC-20 Settlement:** Direct integration with DogeOS native DOGE token interface (`0x530000000000000000000000000000000000d09e`).
- **Exact Approvals & Funding:** Requires exact DOGE deposit matching the sum of milestone amounts.
- **Explicit Contributor Acceptance:** The project only activates when both funding and contributor acceptance are verified.
- **Milestone Evidence & Review:** Contributors submit deliverable evidence (URL + content hash). Clients review and approve.
- **Payment Release:** Approving a milestone transfers the exact milestone DOGE amount to the contributor using the Checks-Effects-Interactions (CEI) pattern.
- **Dispute Locking & Mutual Dispute Resolution:**
  - A client can dispute a milestone, freezing funds in the contract.
  - Neither party can unilaterally claim disputed funds in their own favor.
  - Supports both **Direct Concession** (client conceding release to contributor, or contributor conceding refund to client) and **Proposal & Mutual Confirmation**.
  - Unresolved disputes remain securely locked.
- **Security:** OpenZeppelin `ReentrancyGuard`, `SafeERC20`, custom error guards, and comprehensive event logging.

---

## DogeOS Chikyū Testnet Network Parameters

| Parameter | Value |
|---|---|
| **Network Name** | DogeOS Chikyū Testnet |
| **Chain ID** | `6281971` (`0x5fdaf3`) |
| **RPC URL** | `https://rpc.testnet.dogeos.com/` |
| **Block Explorer** | `https://dogeos-testnet.l2scan.co` |
| **Native Asset** | DOGE (18 decimals) |
| **DOGE ERC-20 Interface** | `0x530000000000000000000000000000000000d09e` |

---

## Contract Architecture

### `contracts/DogeCommitEscrow.sol`
- Implements milestone creation, deposit, acceptance, delivery submission, client approval, dispute handling, and mutual resolution.
- Enforces role-based permissions (`onlyClient`, `onlyContributor`, `onlyParticipant`).

### States
- **ProjectStatus:** `Created`, `Active`, `Completed`, `Cancelled`
- **MilestoneStatus:** `Pending`, `Submitted`, `Approved`, `Disputed`, `Resolved`
- **ResolutionOutcome:** `None`, `ReleaseToContributor`, `RefundToClient`

---

## Automated Test Results

Test execution:
```bash
npx hardhat test
```

Result:
```text
  DogeCommitEscrow
    Initialization & Deployment
      ✔ should set the correct DOGE token address
      ✔ should revert if initialized with address(0)
      ✔ should start with 0 project count
    Project Creation
      ✔ should allow a client to create a project with multiple milestones
      ✔ should revert if contributor address is zero
      ✔ should revert if client address equals contributor address
      ✔ should revert if milestones array is empty
      ✔ should revert if milestone amount is zero
      ✔ should revert if milestone deadline is in the past
    Funding & Contributor Acceptance Workflow
      ✔ should allow client to fund with exact token approval
      ✔ should revert if non-client attempts to fund
      ✔ should revert if client tries to fund twice
      ✔ should allow contributor to accept project
      ✔ should revert if non-contributor attempts to accept
      ✔ should revert if contributor tries to accept twice
      ✔ should activate project when funded first, then accepted
      ✔ should activate project when accepted first, then funded
      ✔ should allow client to cancel and refund if project is not yet active
      ✔ should revert if client tries to cancel an already active project
    Milestone Submission & Approval
      ✔ should allow contributor to submit evidence for an active milestone
      ✔ should revert if unauthorized party attempts to submit
      ✔ should revert if evidence is empty
      ✔ should revert if submitting for out-of-bounds milestone index
      ✔ should revert if submitting milestone that is already submitted
      ✔ should allow client to approve submitted milestone and release exact DOGE
      ✔ should revert if client attempts to approve milestone that is not submitted
      ✔ should revert if non-client attempts to approve
      ✔ should mark project as Completed when all milestones are approved
    Dispute & Mutual Dispute Resolution
      ✔ should allow client to dispute a submitted milestone, locking funds
      ✔ should revert if client tries to dispute an unsubmitted milestone
      ✔ should prevent contributor from withdrawing disputed funds through normal approval
      ✔ should allow mutual resolution via Proposal & Confirmation (RefundToClient)
      ✔ should allow mutual resolution via Proposal & Confirmation (ReleaseToContributor)
      ✔ should allow direct concession by client releasing funds to contributor
      ✔ should allow direct concession by contributor refunding funds to client
      ✔ should REVERT if client tries to unilaterally refund funds to themselves without agreement
      ✔ should REVERT if contributor tries to unilaterally release funds to themselves without agreement
      ✔ should REVERT if stranger attempts to propose or resolve dispute
      ✔ should REVERT if proposing or resolving with Outcome.None
      ✔ should settle full project with one approved milestone and one disputed/refunded milestone
    View Functions and Validation Guards
      ✔ should revert getProject for non-existent project
      ✔ should revert getMilestone for non-existent project
      ✔ should revert getMilestones for non-existent project

  43 passing (2s)
```

---

## How to Deploy to DogeOS Chikyū Testnet

### 1. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and fill in your deployer private key:
```env
DOGEOS_RPC_URL=https://rpc.testnet.dogeos.com/
CHAIN_ID=6281971
DOGE_TOKEN_ADDRESS=0x530000000000000000000000000000000000d09e
PRIVATE_KEY=your_private_key_here
```

### 2. Verify Deployer Balance
Make sure the deployer address has testnet DOGE for gas on DogeOS Chikyū Testnet.

### 3. Deploy Contract
Run the deployment script pointing to `dogeosTestnet`:
```bash
npx hardhat run scripts/deploy.js --network dogeosTestnet
```

The script will:
1. Connect to `https://rpc.testnet.dogeos.com/` (Chain ID `6281971`).
2. Pass the official DOGE ERC-20 contract address (`0x530000000000000000000000000000000000d09e`) into the constructor.
3. Deploy `DogeCommitEscrow`.
4. Output the contract address and write deployment metadata to `deployments/dogeosTestnet.json`.

### 4. Verify on DogeOS Block Explorer
Search the deployed contract address on [https://dogeos-testnet.l2scan.co](https://dogeos-testnet.l2scan.co).
