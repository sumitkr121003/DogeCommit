# DogeCommit — Product Requirements Document (PRD)

**Document:** 01-PRODUCT-REQUIREMENTS.md  
**Project:** DogeCommit  
**Version:** 1.0  
**Status:** MVP Definition  
**Target Network:** DogeOS Chikyū Testnet  
**Primary Asset:** DOGE

---

## 1. Product Overview

DogeCommit is a DOGE-native milestone-based escrow application designed to make payments between clients and independent contributors safer and more transparent.

The application allows a client to create a project agreement, define milestones, and deposit DOGE into a smart contract. A contributor accepts the agreement, completes the work, and submits evidence for each milestone. The client can approve the submission to release the corresponding DOGE payment.

If a milestone is disputed, its funds remain locked until an agreed resolution is completed.

DogeCommit aims to reduce payment-related trust problems in Web3 work by making agreements, payment conditions, and settlement verifiable onchain.

## 2. Problem Statement

Web3 projects frequently involve independent developers, auditors, designers, researchers, and other contributors working with clients or project teams.

These arrangements create several problems:

- Contributors may complete work but not receive the agreed payment.
- Clients may pay upfront and receive incomplete or unusable work.
- Payment terms and milestones may be unclear.
- Agreements are often scattered across private messages and documents.
- Disagreements can occur without a transparent payment-resolution process.
- Traditional escrow services may introduce centralized intermediaries.

There is a need for a simple, transparent payment mechanism that protects both parties through clearly defined agreements and controlled fund release.

## 3. Proposed Solution

DogeCommit provides a smart-contract-based escrow workflow.

1. A client creates a project agreement.
2. The client specifies the contributor, total payment, milestones, amounts, deadlines, and deliverables.
3. The client deposits the required DOGE into the escrow smart contract.
4. The contributor accepts the agreement.
5. The contributor completes a milestone and submits its evidence.
6. The client reviews the submission.
7. If approved, the smart contract releases that milestone's DOGE to the contributor.
8. If disputed, the milestone's funds remain locked until the defined resolution process is completed.

All important payment and agreement state transitions must be verifiable on DogeOS.

## 4. Target Users

### 4.1 Clients

Individuals, startups, DAOs, and Web3 project teams that hire independent contributors and want payment protection.

### 4.2 Contributors

Freelance developers, smart contract auditors, designers, researchers, and open-source contributors who want assurance that agreed funds have been deposited before completing work.

### 4.3 Initial Use Case

The first version focuses on a client hiring a Web3 developer to complete a project in multiple milestones.

The architecture should allow other types of professional work in the future without changing the fundamental escrow mechanism.

## 5. Product Goals

The MVP must:

- Make DOGE the actual escrow and settlement asset.
- Allow clients to create milestone-based agreements.
- Require the client to fund the agreement before work begins.
- Require the contributor to accept the agreement.
- Allow contributors to submit milestone evidence.
- Allow clients to approve completed milestones.
- Release only the approved milestone payment.
- Allow a milestone to be disputed without releasing its funds.
- Prevent unauthorized withdrawals and duplicate payments.
- Provide a clear interface for both parties.
- Operate on DogeOS Chikyū Testnet.

## 6. Core Features — MVP

### 6.1 Wallet Connection

- Allow users to connect an EVM-compatible wallet.
- Display the connected wallet address.
- Detect whether the wallet is connected to DogeOS Chikyū Testnet.
- Display a clear network-switch instruction when the user is on the wrong network.

### 6.2 Project Creation

The client must be able to define:

- Project title.
- Project description.
- Contributor wallet address.
- Milestone names and descriptions.
- DOGE amount for each milestone.
- Deadline for each milestone.
- Evidence or deliverable requirements.

The total milestone amounts must equal the project funding amount.

### 6.3 DOGE Funding

- The client deposits the exact required amount of native DOGE through its ERC-20-compatible interface on DogeOS.
- The contract must verify that the required amount has been received.
- The project must not become active until funding and contributor acceptance conditions are satisfied.
- The interface must show the deposited amount and transaction status.

### 6.4 Contributor Acceptance

- The designated contributor can view the agreement.
- The contributor must explicitly accept the agreement.
- Only the designated contributor can submit milestone evidence.
- The agreement must not be modified after acceptance and funding.

### 6.5 Milestone Submission

- The contributor can submit evidence for an active milestone.
- Evidence may include a URL and a content hash.
- The submission timestamp and milestone status must be recorded.
- The interface must show submitted evidence to the client.

### 6.6 Milestone Approval

- Only the client can approve a submitted milestone.
- Approval releases the exact milestone amount to the contributor.
- Each milestone can be paid only once.
- The payment transaction must be verifiable on the blockchain.
- Completed milestone payments must not be reversed by later disputes involving other milestones.

### 6.7 Milestone Dispute

- The client can dispute a submitted milestone.
- Disputed funds must remain locked.
- The contributor cannot withdraw disputed milestone funds.
- The interface must clearly identify disputed milestones.
- The MVP will support an explicitly defined mutual resolution process.

**Important limitation:** The MVP does not provide decentralized arbitration. It must not automatically decide whether work is satisfactory. Unresolved disputes remain locked.

### 6.8 Project and Milestone Status

Display the current status of each project and milestone.

The interface must distinguish between:

- Created
- Awaiting contributor acceptance
- Awaiting funding
- Active
- Submitted
- Approved
- Disputed
- Released
- Refunded, where applicable

The application should obtain authoritative payment and status information from the smart contract and its events.

## 7. DOGE and DogeOS Integration

DogeCommit must use DogeOS Chikyū Testnet for its MVP.

Network configuration:

| Property | Value |
|---|---|
| Network | DogeOS Chikyū Testnet |
| Chain ID | 6281971 |
| RPC URL | https://rpc.testnet.dogeos.com/ |
| Explorer | https://dogeos-testnet.l2scan.co |
| Native asset | DOGE |
| DOGE ERC-20 interface | 0x530000000000000000000000000000000000d09e |

The native DOGE ERC-20 interface must be used for escrow deposits and payments.

The implementation must verify the token interface and its behavior against the official DogeOS documentation before deployment.

DOGE is the actual value transferred between the client, escrow contract, and contributor. It must not be replaced with a mock token in the final testnet demonstration.

Use exact token approvals rather than unlimited approvals.

## 8. Basic Business Rules

1. A project must have a valid client and contributor address.
2. The client and contributor must be different addresses.
3. Milestone amounts must be greater than zero.
4. The sum of milestone amounts must equal the total project funding.
5. The client must fund the project before work becomes active.
6. The contributor must accept the agreement before submitting work.
7. Only the assigned contributor can submit evidence.
8. Only the client can approve or dispute a submitted milestone.
9. A milestone can be released only once.
10. A disputed milestone cannot be released through the normal approval process.
11. A completed milestone cannot be paid again.
12. Contract functions must validate the current project and milestone state before executing.
13. A project must not allow changes to its agreed payment terms after activation.

## 9. Dispute and Resolution Rules

The MVP will not implement an external arbitrator or automated judgment system.

For the first version:

- A client can dispute a submitted milestone.
- A dispute freezes that milestone's funds.
- Both parties can communicate and reach an agreement outside the contract.
- The parties can jointly authorize a defined resolution action through the contract.
- Resolution may release the disputed amount to the contributor or refund it to the client.
- Neither party can independently resolve a disputed milestone.
- If the parties cannot agree, funds remain locked.

The contract must enforce these conditions. The frontend must explain this limitation clearly.

## 10. Out of Scope

The following features are deliberately excluded from the MVP:

- Public freelancer marketplace.
- User-to-user messaging system.
- AI-based work verification.
- Automated quality assessment.
- Decentralized arbitration network.
- Reputation and rating system.
- DAO governance.
- Custom token creation.
- Cross-chain payments.
- Stablecoin support.
- Automated currency conversion.
- Recurring subscriptions.
- Streaming payments.
- Mobile application.
- Advanced analytics dashboards.

These may be considered after the core escrow workflow is functional.

## 11. User Experience Requirements

The application should be:

- Simple and understandable for Web3 users.
- Professional and trustworthy in appearance.
- Responsive on desktop and mobile.
- Clear about wallet and network requirements.
- Transparent about transaction amounts and statuses.
- Explicit about pending transactions and failed transactions.
- Clear about which party must perform the next action.

The user should never be confused about whether DOGE is deposited, locked, released, or disputed.

## 12. Security Requirements

The smart contract must:

- Restrict functions to authorized participants.
- Prevent unauthorized fund withdrawals.
- Prevent duplicate milestone payments.
- Prevent invalid state transitions.
- Use checks-effects-interactions for fund transfers.
- Include appropriate reentrancy protection.
- Validate token transfer results.
- Use exact approval amounts.
- Avoid arbitrary administrator withdrawal functions.
- Emit events for important state changes.
- Be tested against malicious and unexpected inputs.

The application must never claim that an untested contract is audited or production-ready.

## 13. MVP Success Criteria

The MVP is considered functional only when all of the following work on DogeOS Chikyū Testnet:

1. A client connects a wallet.
2. The client creates a project with multiple milestones.
3. The client deposits actual testnet DOGE.
4. The contributor connects a separate wallet.
5. The contributor accepts the agreement.
6. The contributor submits evidence for a milestone.
7. The client approves the milestone.
8. The contract transfers the correct DOGE amount to the contributor.
9. A second milestone can be disputed.
10. The disputed milestone's funds remain locked.
11. The application displays the correct onchain statuses.
12. Transaction hashes can be checked using the DogeOS testnet explorer.

The complete workflow must be demonstrable using two separate wallets.

## 14. Product Positioning

**Product name:** DogeCommit

**Tagline:** Work delivered. DOGE secured.

**Short description:**

DogeCommit is a DOGE-native milestone escrow application that enables safer payments between Web3 clients and independent contributors through transparent agreements, conditional fund releases, and onchain settlement on DogeOS.

## 15. Development Principle

Build a functional, secure, and demonstrable MVP before adding secondary features.

The smart contract is the source of truth for funds and payment states. The frontend must reflect the actual contract state rather than simulate successful payments.

Do not sacrifice payment security or correctness for additional features or visual complexity.
