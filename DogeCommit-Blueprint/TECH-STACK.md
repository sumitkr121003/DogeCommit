# DogeCommit — Technology Stack Specification

**Document:** TECH-STACK.md  
**Version:** 1.0  
**Status:** Approved Technical Stack Specification  
**Project:** DogeCommit  
**Target Platform:** DogeOS Chikyū Testnet (Chain ID: `6281971`)  
**Settlement Asset:** DOGE (`0x530000000000000000000000000000000000d09e`)

---

## 1. Technology Stack Overview

DogeCommit is a DOGE-native milestone escrow decentralized application (dApp) operating as a **two-tier zero-custody architecture**:
1. **Client-Side Single-Page Application (SPA):** Static frontend executed purely in the user's browser, communicating directly with the user's Web3 wallet and the DogeOS JSON-RPC endpoint.
2. **Onchain Smart Contract Layer:** Autonomous EVM bytecode deployed to DogeOS Chikyū Testnet holding escrow custody of native DOGE and managing milestone state transitions.

The application has **zero centralized backend services, zero databases, and zero custodial servers**. The DogeOS blockchain serves as the authoritative persistence engine and state machine.

```mermaid
flowchart TD
    subgraph ClientSide["Client Tier (User Browser)"]
        UI["React 18 + TypeScript + Vite"]
        Styling["Tailwind CSS + Stargate Design Tokens"]
        Primitives["Radix UI Primitives + Lucide Icons"]
        Web3["Wagmi v2 + Viem v2 + TanStack Query"]
        Validation["React Hook Form + Zod"]
    end

    subgraph WalletTier["Wallet Tier (EIP-1193)"]
        Wallet["Injected Web3 Wallet (MetaMask / Rabby / Browser Extension)"]
    end

    subgraph NetworkTier["Network Tier (DogeOS Chikyū Testnet)"]
        RPC["DogeOS JSON-RPC Node (https://rpc.testnet.dogeos.com/)"]
        Explorer["L2Scan Explorer (https://dogeos-testnet.l2scan.co)"]
    end

    subgraph ContractTier["Smart Contract Tier (EVM Target: Paris)"]
        Escrow["DogeCommitEscrow.sol (OpenZeppelin 5.x)"]
        DogeToken["Canonical DOGE ERC-20 Precompile (0x530...d09e)"]
    end

    UI --> Web3
    Web3 <--> Wallet
    Wallet -->|Broadcast Transactions| RPC
    Web3 <-->|Read State eth_call / eth_getLogs| RPC
    RPC <--> Escrow
    Escrow <--> DogeToken
    RPC -.-> Explorer
```

---

## 2. Frontend Framework

| Parameter | Selection | Status | Rationale |
|---|---|---|---|
| **Framework** | **React** | Proposed (`^18.3.1`) | De-facto standard for Web3 dApps; full compatibility with Wagmi v2 and TanStack React Query v5. Stable concurrent rendering, rich ecosystem for accessible component primitives. |
| **Alternative Evaluated** | Next.js 14/15 | Rejected | DogeCommit requires no Server-Side Rendering (SSR) or Server Actions. Next.js adds deployment complexity, Node.js runtime overhead, and potential SSR hydration mismatches with browser wallets. |
| **Alternative Evaluated** | Vue 3 / Svelte | Rejected | Smaller ecosystem for Web3 connector hooks (Wagmi is React-first); would require maintaining custom wallet-state bindings. |

---

## 3. Programming Language

| Parameter | Selection | Status | Rationale |
|---|---|---|---|
| **Language** | **TypeScript** | Proposed (`^5.5.4`) | Strict type safety for complex milestone structs, contract return tuples, event payloads, and Web3 transaction arguments. Prevents runtime property mismatches and enforces exhaustive enum handling. |
| **Compiler Configuration** | `tsconfig.json` (`strict: true`) | Proposed | Enforces `noImplicitAny`, `strictNullChecks`, and `exactOptionalPropertyTypes` across all contract data structures and UI models. |

---

## 4. Build Tool

| Parameter | Selection | Status | Rationale |
|---|---|---|---|
| **Build Tool & Dev Server** | **Vite** | Proposed (`^5.4.2`) | Ultra-fast Hot Module Replacement (HMR) based on native ES modules, lightweight bundler (Rollup), minimal configuration overhead, and deterministic output hashing. |
| **Alternative Evaluated** | Create React App (Webpack) | Rejected | Deprecated, slow cold starts, excessive bundle size, and maintenance issues. |
| **Static Build Target** | `dist/` SPA bundle | Proposed | Produces pure static HTML/JS/CSS that can be served from any static host or decentralized CDN (Vercel, Netlify, Cloudflare Pages, IPFS). |

---

## 5. Styling and UI Component Libraries

Per the visual audit in [`UI-UX-DESIGN.md`](file:///C:/Users/sumit/DogeCommit/DogeCommit-Blueprint/UI-UX-DESIGN.md) (derived directly from live Stargate Finance production bundles):

| Component / Layer | Selection | Version / Source | Rationale |
|---|---|---|---|
| **CSS Utility Framework** | **Tailwind CSS** | Proposed (`^3.4.10`) | Utility-first styling enabling direct configuration of Stargate's audited color palette, border radii, and elevated drop shadows. Zero runtime overhead. |
| **PostCSS & Autoprefixer** | `postcss` (`^8.4.41`), `autoprefixer` (`^10.4.20`) | Proposed | Standard automated CSS vendor prefixing and build optimization. |
| **Typography System** | **Geist** & **Geist Mono** | `@fontsource/geist-sans` (`^5.0.3`), `@fontsource/geist-mono` (`^5.0.3`) | Verified primary font family from Stargate Finance audit; clean negative-tracking headings and monospaced cryptographic hashes/numbers. Self-hosted via npm packages to eliminate Google Fonts third-party tracking dependencies. |
| **Headless UI Primitives** | **Radix UI Primitives** | `@radix-ui/react-dialog` (`^1.1.1`), `@radix-ui/react-dropdown-menu` (`^2.1.1`), `@radix-ui/react-tooltip` (`^1.1.2`), `@radix-ui/react-tabs` (`^1.1.0`), `@radix-ui/react-accordion` (`^1.2.0`) | Unstyled, fully accessible (WAI-ARIA compliant) headless components that can be customized with exact Stargate design tokens. |
| **Iconography** | **Lucide React** | Proposed (`^0.436.0`) | Modern, clean outline icons matching Stargate's minimalist visual style (checkmarks, alert triangles, chevron arrows, copy buttons, external link indicators). |
| **Class Name Utility** | `clsx` (`^2.1.1`), `tailwind-merge` (`^2.5.2`) | Proposed | Safe dynamic concatenation and conflict resolution of Tailwind utility classes. |

---

## 6. Wallet Integration

| Parameter | Selection | Status | Rationale |
|---|---|---|---|
| **Connector Framework** | **Wagmi v2** (`wagmi`) | Proposed (`^2.12.7`) | Industry-standard React hooks for Ethereum/EVM wallet management. Built on Viem, natively supports EIP-1193, accounts, chain switching, and reconnection persistence. |
| **Wallet Providers** | Injected (`injected()`), MetaMask (`metaMask()`), Coinbase Wallet (`coinbaseWallet()`) | Proposed | Covers all standard browser extension wallets (MetaMask, Rabby, Frame, Brave Wallet, Coinbase Wallet). |
| **Modal / Connect Kit** | Custom Connect Modal (or `@rainbow-me/rainbowkit` / `@web3modal/wagmi`) | Evaluated | A lightweight custom modal styled with Radix UI + Tailwind prevents external dependency bloat and guarantees exact alignment with Stargate styling tokens. |

---

## 7. Blockchain Interaction Library

| Parameter | Selection | Status | Rationale |
|---|---|---|---|
| **EVM Client Library** | **Viem v2** (`viem`) | Proposed (`^2.20.0`) | Lightweight, tree-shakeable, type-safe replacement for Ethers.js. Native support for ABI inference (`as const`), low memory footprint, and first-class JSON-RPC performance. |
| **Server State Management** | **TanStack React Query v5** (`@tanstack/react-query`) | Proposed (`^5.52.0`) | Required core peer dependency of Wagmi v2. Manages caching, query deduplication, polling, and background revalidation of onchain contract reads. |

---

## 8. DogeOS Chikyū Testnet Configuration

The DogeOS Chikyū Testnet is defined as a custom chain in Viem / Wagmi:

```typescript
import { defineChain } from 'viem';

export const dogeosTestnet = defineChain({
  id: 6281971,
  name: 'DogeOS Chikyū Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Dogecoin',
    symbol: 'DOGE',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.dogeos.com/'],
    },
    public: {
      http: ['https://rpc.testnet.dogeos.com/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'DogeOS L2Scan',
      url: 'https://dogeos-testnet.l2scan.co',
    },
  },
  testnet: true,
});
```

### Network Verification Matrix

| Parameter | Value | Verification Status | Notes |
|---|---|---|---|
| **Chain ID** | `6281971` (`0x5fdaf3`) | **Verified onchain** | Query to `eth_chainId` confirmed |
| **RPC URL** | `https://rpc.testnet.dogeos.com/` | **Verified responsive** | Public JSON-RPC endpoint |
| **Block Explorer** | `https://dogeos-testnet.l2scan.co` | **Verified active** | Transaction, block, and address indexing |
| **EIP-1559 Support** | `baseFeePerGas` / dynamic fee | **Unverified** | Must treat EIP-1559 as conditional. If RPC reverts or returns null for base fees, client must fall back to legacy `gasPrice`. |
| **Block Gas Limit** | Unknown ($\ge 10\text{M}$ estimated) | **Unverified** | Must verify before scheduling large transaction bursts |
| **Target EVM Version** | `paris` | **Verified in Hardhat** | Set in contract compilation target |

---

## 9. DOGE Token Integration

- **Canonical Address:** `0x530000000000000000000000000000000000d09e`
- **Decimals:** 18 ($1 \text{ DOGE} = 10^{18} \text{ base units / wei-DOGE}$).
- **Interface Model:** Standard ERC-20 (`IERC20`):
  - `allowance(owner, spender)`
  - `approve(spender, amount)` (Strictly exact amounts; no infinite `type(uint256).max`)
  - `balanceOf(account)`
  - `transfer(to, amount)`
  - `transferFrom(from, to, amount)`
- **Local Dev vs. Testnet:**
  - Local Hardhat testnet deploys `TestDOGE.sol` (matching 18-decimal token).
  - Testnet / Production binds directly to `0x530000000000000000000000000000000000d09e`. Mock tokens are strictly prohibited on live networks.

---

## 10. Smart Contract Development Environment

| Parameter | Current Installed Configuration | Status |
|---|---|---|
| **Framework** | **Hardhat 2** (`hardhat: ^2.29.1`) | **Installed & Verified** (`package.json`) |
| **Toolbox** | `@nomicfoundation/hardhat-toolbox: ^6.1.2` | **Installed & Verified** (`package.json`) |
| **Plugins Included** | `@nomicfoundation/hardhat-ethers`, `@nomicfoundation/hardhat-network-helpers`, `@nomicfoundation/hardhat-chai-matchers`, `typechain` | **Installed & Active** |
| **Test Runner** | Mocha + Chai matchers | **Installed & Active** (53/53 tests passing) |
| **Network Helpers** | `@nomicfoundation/hardhat-network-helpers` (`time.latest()`) | **Installed & Active** |

---

## 11. Solidity and Compiler Configuration

| Setting | Value in `hardhat.config.js` | Verification Status |
|---|---|---|
| **Solidity Version** | `0.8.28` | **Configured & Verified** |
| **Optimizer** | `enabled: true`, `runs: 200` | **Configured & Verified** |
| **EVM Target** | `paris` | **Verified during compilation** |
| **Contract File** | [`contracts/DogeCommitEscrow.sol`](file:///C:/Users/sumit/DogeCommit/contracts/DogeCommitEscrow.sol) | **Implemented & Committed** (615 lines) |
| **Constants Enforced** | `MAX_MILESTONES = 25` | **Implemented & Tested** |

---

## 12. OpenZeppelin Dependencies

| Package | Installed Version | Used Contracts & Modules | Rationale |
|---|---|---|---|
| `@openzeppelin/contracts` | `^5.6.1` (Installed) | `@openzeppelin/contracts/token/ERC20/IERC20.sol`<br>`@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol`<br>`@openzeppelin/contracts/utils/ReentrancyGuard.sol` | Secure, audited ERC-20 interaction primitives and reentrancy protection. Version 5.x uses custom errors and modern EVM optimizations. |

---

## 13. Contract ABI and Type Generation

1. **Source of Truth:** Compiled artifact generated by Hardhat:
   `artifacts/contracts/DogeCommitEscrow.sol/DogeCommitEscrow.json`
2. **Frontend ABI Export:** Extracted via automated script or build step to:
   `src/contracts/DogeCommitEscrow.json` (or TypeScript constant with `as const`).
3. **Type Safety via Viem:** Viem infers strict function parameter and return types directly from `const DogeCommitEscrowABI = [...] as const` without needing external TypeChain runtime wrappers in the frontend.

---

## 14. Frontend State Management

DogeCommit separates state into three distinct scopes:

```mermaid
flowchart LR
    subgraph S1["Server / Blockchain State"]
        B1["Project Headers"]
        B2["Milestone Arrays"]
        B3["Token Balances & Allowances"]
        B4["Event Logs"]
    end
    
    subgraph S2["Global Client State"]
        C1["Connected Wallet / Address"]
        C2["Active Chain ID / Network Guard"]
        C3["Active Dashboard Filter / Tab"]
    end

    subgraph S3["Local Ephemeral State"]
        F1["Wizard Form Step"]
        F2["Draft Milestone Inputs"]
        F3["Pending Transaction Modal State"]
    end

    S1 -->|TanStack React Query| Hooks["Custom Contract Hooks"]
    S2 -->|Wagmi Context / Zustand| UIComp["UI Components"]
    S3 -->|React Hook Form / useState| UIComp
```

- **Blockchain State:** Governed by **TanStack Query** (via Wagmi hooks `useReadContract`, `useWatchContractEvent`). Automatic cache invalidation occurs when transaction receipts are confirmed.
- **Global Session State:** Managed natively by Wagmi's React Context (account address, connection status, network mismatch). For lightweight UI state (e.g., active dashboard filter, notification drawer), React `useState` or **Zustand** (`^4.5.5`) is recommended.
- **Local Form State:** Managed by **React Hook Form**.

---

## 15. Form Validation

| Parameter | Selection | Status | Rationale |
|---|---|---|---|
| **Form Library** | **React Hook Form** | Proposed (`^7.53.0`) | Performant uncontrolled inputs with minimal re-renders; native support for dynamic milestone array fields (`useFieldArray`). |
| **Schema Validation** | **Zod** | Proposed (`^3.23.8`) | Composable TypeScript-first schemas validating boundary rules before wallet submission: |

### Client-Side Validation Rules Enforced via Zod:
1. `contributor`: Valid Ethereum address (`isAddress()`), non-zero, cannot equal client address.
2. `title`: 3–100 characters, non-empty.
3. `description`: 10–2000 characters.
4. `milestones`: Array length between **1 and 25** (`MAX_MILESTONES`). Creation with $\ge 26$ is blocked client-side.
5. `milestones.*.amount`: Number $> 0$, precision up to 18 decimals.
6. `milestones.*.deadline`: Unix timestamp in the future ($> \text{Date.now}() + 300\text{s}$).
7. `evidenceUrl` / `evidenceHash`: At least one non-empty reference string on milestone submission.

---

## 16. Notifications and Transaction Feedback

| Parameter | Selection | Status | Rationale |
|---|---|---|---|
| **Toast Notification Engine** | **Sonner** | Proposed (`^1.5.0`) | Lightweight, performant toast library with smooth stacking, dark theme alignment, and rich action buttons (e.g., "View on L2Scan"). |
| **Transaction Lifecycle UX** | Step-by-Step Status Flow | Standard Web3 Pattern | Formulates clear UI state:
  1. *Prompted:* Awaiting wallet signature.
  2. *Submitted:* Transaction broadcast with pending spinner and L2Scan link.
  3. *Confirmed:* Transaction receipt received; refetches contract state.
  4. *Error / Rejected:* Displays readable custom error interpretation. |

---

## 17. Blockchain Event Retrieval

The frontend queries onchain events (e.g., `MilestoneDisputed` for dispute reasons, `ProjectCreated` for activity feeds) directly via `eth_getLogs`.

### Historical Logs Strategy & Fallbacks:
- **Default Window:** Configurable 5,000-block range (`DEFAULT_LOGS_BLOCK_RANGE = 5000`).
- **Unverified Status:** DogeOS RPC query limits on block range have not been officially documented.
- **Adaptive Splitter:** If `eth_getLogs` returns an RPC error (e.g., range timeout or response payload limit), the query engine dynamically halves the range (e.g., $5,000 \rightarrow 2,500 \rightarrow 1,000$ blocks) and queries sequentially.
- **Graceful UI Fallback:** If event logs are pruned or unavailable via RPC, the UI falls back to showing onchain status (`MilestoneStatus.Disputed`) with a note: *"Dispute reason recorded in transaction log (historical RPC event log unavailable)"*.

---

## 18. Multicall and Read Fallback

| Parameter | Architectural Pattern | Verification Status |
|---|---|---|
| **Multicall3 Engine** | `0xcA11bde05977b3631167028862bE2a173976CA11` | **Unverified on DogeOS** |
| **Primary Query Strategy** | Wagmi batching / multicall aggregation if standard Multicall3 contract exists on DogeOS. | To be probed onchain during pre-implementation verification. |
| **Mandatory Fallback** | Individual `eth_call` reads executed concurrently via `Promise.all` (`getProject(id)` + `getMilestones(id)`). | **Guaranteed Compatible**; works against any standard EVM RPC node. |

---

## 19. Environment Variables and Secrets

### Separation of Concerns
1. **Frontend (`.env` / `vite.config.ts`):** Only public variables prefixed with `VITE_` are bundled.
2. **Hardhat / Deployer (`.env`):** Deployment secrets (`PRIVATE_KEY`) reside exclusively in local root `.env` and are strictly excluded from frontend builds and version control.

### Required Frontend Environment Variables (`.env.example` for web app):
```env
# Public RPC URL for DogeOS Chikyū Testnet
VITE_DOGEOS_RPC_URL=https://rpc.testnet.dogeos.com/

# DogeOS Chain ID
VITE_CHAIN_ID=6281971

# Deployed DogeCommitEscrow Contract Address
VITE_ESCROW_CONTRACT_ADDRESS=0x...

# Canonical DOGE ERC-20 Address
VITE_DOGE_TOKEN_ADDRESS=0x530000000000000000000000000000000000d09e

# Block Explorer URL
VITE_EXPLORER_URL=https://dogeos-testnet.l2scan.co

# Default Block Range for eth_getLogs
VITE_LOGS_BLOCK_RANGE=5000
```

> [!CAUTION]
> Private keys, deployer mnemonics, and administrative credentials must NEVER be placed in `VITE_` environment variables or committed to version control.

---

## 20. Build and Deployment

| Stage | Tooling | Target / Output |
|---|---|---|
| **Local Development** | Vite Dev Server (`npm run dev`) | `http://localhost:5173` |
| **Contract Testing** | Hardhat Test Runner (`npx hardhat test`) | Local Hardhat Network (53 tests passing) |
| **Production Build** | `tsc && vite build` | Static assets in `dist/` |
| **Hosting Platform** | Vercel / Netlify / Cloudflare Pages / IPFS | Zero-backend static single-page hosting |
| **CI / Quality Checks** | ESLint (`^9.x`) + TypeScript Compiler (`tsc --noEmit`) | Automated linting and type verification |

---

## 21. Dependency Version Compatibility

### Existing Installed Dependencies (Root `package.json`)
| Package | Installed Version | Status |
|---|---|---|
| `hardhat` | `^2.29.1` | Installed & Verified |
| `@nomicfoundation/hardhat-toolbox` | `^6.1.2` | Installed & Verified |
| `@openzeppelin/contracts` | `^5.6.1` | Installed & Verified |
| `dotenv` | `^18.0.9` | Installed & Verified |

### Proposed Frontend Dependencies (To Be Installed)
| Package | Proposed Version | Status | Category |
|---|---|---|---|
| `react` | `^18.3.1` | Proposed | Core Framework |
| `react-dom` | `^18.3.1` | Proposed | Core Framework |
| `typescript` | `^5.5.4` | Proposed | Language |
| `vite` | `^5.4.2` | Proposed | Build Tool |
| `@vitejs/plugin-react` | `^4.3.1` | Proposed | Build Plugin |
| `wagmi` | `^2.12.7` | Proposed | Web3 Integration |
| `viem` | `^2.20.0` | Proposed | Web3 Integration |
| `@tanstack/react-query` | `^5.52.0` | Proposed | State Management |
| `tailwindcss` | `^3.4.10` | Proposed | Styling |
| `postcss` | `^8.4.41` | Proposed | Build Tooling |
| `autoprefixer` | `^10.4.20` | Proposed | Build Tooling |
| `@fontsource/geist-sans` | `^5.0.3` | Proposed | Typography |
| `@fontsource/geist-mono` | `^5.0.3` | Proposed | Typography |
| `lucide-react` | `^0.436.0` | Proposed | Icons |
| `@radix-ui/react-dialog` | `^1.1.1` | Proposed | UI Primitive |
| `@radix-ui/react-dropdown-menu` | `^2.1.1` | Proposed | UI Primitive |
| `@radix-ui/react-tooltip` | `^1.1.2` | Proposed | UI Primitive |
| `@radix-ui/react-tabs` | `^1.1.0` | Proposed | UI Primitive |
| `react-hook-form` | `^7.53.0` | Proposed | Form Validation |
| `zod` | `^3.23.8` | Proposed | Schema Validation |
| `@hookform/resolvers` | `^3.9.0` | Proposed | Form-Schema Bridge |
| `sonner` | `^1.5.0` | Proposed | Notifications |
| `clsx` | `^2.1.1` | Proposed | Styling Utility |
| `tailwind-merge` | `^2.5.2` | Proposed | Styling Utility |

---

## 22. Technology Decisions and Trade-offs

| Decision | Selected Path | Trade-off / Rationale |
|---|---|---|
| **Pure SPA vs. Next.js SSR** | Pure SPA (Vite + React) | Eliminates node server dependencies; immune to wallet hydration mismatches; lower hosting complexity; zero server custody. |
| **Viem/Wagmi vs. Ethers.js v6** | Viem / Wagmi v2 | Viem provides automatic TypeScript ABI type inference and smaller bundle footprints. Wagmi provides React hooks optimized for concurrent renders. |
| **Tailwind + Radix vs. Material UI** | Tailwind + Radix UI | Stargate Finance's visual identity requires exact custom tokens, dark surfaces, and subtle glows. Material UI introduces heavy runtime CSS-in-JS and styling friction. |
| **Event Reason Query vs. Contract Storage** | `eth_getLogs` | Keeps contract storage minimal and saves gas on dispute creation. Trade-off: relies on RPC log retention. Mitigated with retry splitter and UI fallback notes. |
| **Exact Approvals vs. Unlimited Approvals** | Exact `totalAmount` Approval | Requires separate approval transaction per project creation/funding, but guarantees absolute user asset security against systemic contract drains. |

---

## 23. MVP Technology Boundaries

To ensure delivery within the 4-day hackathon timeline, the following technical capabilities are strictly out of scope:

1. **No Backend Database:** No PostgreSQL, MongoDB, Supabase, or Firebase. All state is onchain.
2. **No Centralized API:** No Express/NestJS server, indexing daemon, or cloud worker.
3. **No Centralized Storage Servers:** Deliverables reside on third-party links (GitHub, IPFS) supplied as plain strings.
4. **No Custodial Wallets / Social Logins:** No Web3Auth, Privy, or custodial key sharding. Users connect via standard EIP-1193 browser extensions.
5. **No Cross-Chain Bridges:** Escrow operations are native to DogeOS Chikyū Testnet.
6. **No Arbitrator Oracles:** Dispute resolution is exclusively bilateral consensus or voluntary concession.

---

## 24. Pre-Implementation Verification Checklist

Before writing frontend implementation code, the following operational checks must be executed:

- [ ] **Probe DogeOS JSON-RPC (`https://rpc.testnet.dogeos.com/`):**
  - Verify response time and stability via `curl` / `fetch`.
  - Check whether `eth_feeHistory` and EIP-1559 fields are returned, or if legacy `gasPrice` must be specified.
  - Test `eth_getLogs` with a 5,000-block range to check for RPC throttling or limits.
- [ ] **Check Multicall3 Contract Presence:**
  - Call `eth_getCode` on `0xcA11bde05977b3631167028862bE2a173976CA11` on DogeOS. If bytecode is empty, configure frontend exclusively for individual read fallbacks.
- [ ] **Probe DOGE Precompile Address (`0x530000000000000000000000000000000000d09e`):**
  - Verify `name()`, `symbol()`, `decimals()`, and `balanceOf()` on testnet.
- [ ] **Deploy DogeCommitEscrow to Testnet:**
  - Run `scripts/deploy.js --network dogeosTestnet` once faucet DOGE is available to verify deployment bytecode size, constructor acceptance, and explorer recognition.
- [ ] **Initialize Frontend Directory Structure:**
  - Create Vite + React + TypeScript scaffold without modifying existing Hardhat and contract files.
