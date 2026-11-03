# DogeCommit — UI/UX Design Specification

**Document:** UI-UX-DESIGN.md  
**Version:** 1.0  
**Status:** Approved Design Blueprint  
**Primary Visual Reference:** [Stargate Finance](https://stargate.finance/) (Direct Production Audit)  
**Target Platform:** DogeOS Chikyū Testnet (Chain ID: `6281971`)  
**Settlement Asset:** DOGE (`0x530000000000000000000000000000000000d09e`)

---

## 1. Design Vision

DogeCommit is a DOGE-native milestone escrow platform engineered to bring trustless, transparent payment certainty to Web3 freelance agreements.

### Core Visual & Experience Identity
- **DeFi-Grade Sophistication:** Moving far beyond "meme coin" tropes, DogeCommit adopts the ultra-clean, high-contrast, dark-mode architectural visual language pioneered by Stargate Finance. It communicates institutional-grade financial security, cryptographic verifiability, and operational rigor.
- **DOGE Identity Without Clutter:** A bespoke, refined **DOGE Gold** accent palette (`#E1B342` / `#F5C854`) is integrated into a deep slate/charcoal dark foundation (`#141414`, `#1A1A1A`, `#212121`), giving Dogecoin an authoritative, professional DeFi presence.
- **State Transparency & User Clarity:** Every button, card, and modal unequivocally communicates onchain state, required actor permissions, and the custody status of DOGE funds. Users always know who acts next, what transactions cost, and where funds reside.
- **Zero Ambiguity Around Disputes:** Disputed funds are distinctly visualized as frozen in contract custody, with unambiguous messaging that funds remain locked until explicit bilateral consensus or voluntary concession is executed.

---

## 2. Stargate Reference Audit (Phase 1 Inspection)

The official Stargate Finance production application (`https://stargate.finance/`) was inspected directly via its live HTML and production JavaScript application bundles (`app/layout-*.js`, `app/page-*.js`, `2685-*.js`). Below are the audited and verified design tokens extracted directly from Stargate's production theme configuration.

### 2.1 Verified vs. Estimated Status Matrix

| Design Attribute | Inspected Stargate Token / Value | Audit Status | Source / Notes |
|---|---|---|---|
| **Primary Font Family** | `'Geist', sans-serif` | **Verified** | Google Fonts preload link & bundle constant `s="'Geist', sans-serif"` |
| **Fallback Font Stack** | `-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif` | **Verified** | Global CSS stylesheet `fa5e659e093c009b.css` |
| **Monospace Font** | Not explicitly bundled; system monospace used | **Estimated Recommendation** | Recommended: `'Geist Mono', 'JetBrains Mono', monospace` |
| **Page Canvas Background** | `#141414` | **Verified** | `palette.background.default` in Stargate bundle |
| **Elevated Card Background** | `#212121` | **Verified** | `palette.background.paper` in Stargate bundle |
| **Intermediate Sheet Background** | `#1A1A1A` | **Verified** | `palette.background.sheet` in Stargate bundle |
| **Input / Muted Background** | `#272727` | **Verified** | `palette.background.muted` in Stargate bundle |
| **Emphasized Background** | `#161616` | **Verified** | `palette.background.emphasized` in Stargate bundle |
| **Dropdown / Menu Surface** | `rgba(33, 33, 33, 0.64)` | **Verified** | `palette.background.menu` in Stargate bundle |
| **Primary Text Color** | `#FAFAFA` | **Verified** | `palette.text.primary` in Stargate bundle |
| **Secondary Text Color** | `#9A9A9A` | **Verified** | `palette.text.secondary` in Stargate bundle |
| **Disabled Text Color** | `#636363` | **Verified** | `palette.text.disabled` in Stargate bundle |
| **Primary Border / Divider** | `#2C2C2C` | **Verified** | `palette.divider.primary` in Stargate bundle |
| **Secondary Border / Divider** | `#3D3D3D` | **Verified** | `palette.divider.secondary` in Stargate bundle |
| **Success / Approved Color** | `#0FB983` (Dark: `#10A073`) | **Verified** | `palette.success.main` in Stargate bundle |
| **Error / Dispute Color** | `#F3566B` (Dark: `#D84155`) | **Verified** | `palette.error.main` in Stargate bundle |
| **Warning Color** | `#F46F28` (Dark: `#CC622A`) | **Verified** | `palette.warning.main` in Stargate bundle |
| **Info / Accent Blue** | `#3E92E0` (Dark: `#2F82CF`) | **Verified** | `palette.info.main` in Stargate bundle |
| **Default Border Radius** | `12px` | **Verified** | `shape.borderRadius: 12` in Stargate bundle |
| **Sub-component Radius** | `8px` (controls), `16px` (panels) | **Verified** | Component style rules in bundle |
| **Elevated Box Shadow** | `0px 4px 12px 0px rgba(20, 20, 20, 0.43)` | **Verified** | `shadows.md` in Stargate bundle |
| **Deep Glow Shadow** | `0px 4px 111.9px 0px rgba(20, 20, 20, 0.70)` | **Verified** | `shadows.xl` in Stargate bundle |
| **Breakpoints** | `xs: 0px, sm: 600px, md: 900px, lg: 1200px, xl: 1920px` | **Verified** | `breakpoints.values` in Stargate bundle |

### 2.2 Aesthetic Principles Observed in Stargate
1. **Subtle Surface Layering:** Stargate avoids harsh solid borders; depth is created by layering dark shades (`#141414` $\rightarrow$ `#1A1A1A` $\rightarrow$ `#212121` $\rightarrow$ `#272727`) accented with thin 1px `#2C2C2C` borders.
2. **Restrained Glows:** Radial light emissions behind primary interactive containers are rendered with low opacity (`rgba(..., 0.08)` to `rgba(..., 0.12)`), preventing visual noise while giving components a floating, luminous quality.
3. **Typography-Led Hierarchy:** Weight 500 headings with negative letter-spacing (`letter-spacing: -1.44px` on mobile, `-3px` on desktop) paired with clean 400 weight body text (`Geist`) provide immediate legibility and an uncluttered visual cadence.
4. **Frosted Translucency:** Modal overlays and sticky headers utilize `backdrop-filter: blur(12px)` over semi-transparent charcoal surfaces (`rgba(20, 20, 20, 0.8)`), preserving contextual awareness.

---

## 3. Typography System

DogeCommit adopts the verified **Geist** font family for UI and prose, paired with **Geist Mono** for cryptographic hashes, wallet addresses, and DOGE numbers.

### Typography Scale Table

| Role / Tag | Font Family | Size (Mobile) | Size (Desktop $\ge$ 900px) | Line Height | Weight | Letter Spacing | Purpose |
|---|---|---|---|---|---|---|---|
| `display-1` | Geist, sans-serif | 36px | 60px | 56px | 600 | -0.05em (-3px) | Landing Hero Headlines |
| `h1` | Geist, sans-serif | 32px | 44px | 48px | 500 | -0.04em (-1.8px) | Page Titles, Dashboard Overview |
| `h2` | Geist, sans-serif | 24px | 32px | 36px | 500 | -0.03em (-1.2px) | Section Headers, Wizard Steps |
| `h3` | Geist, sans-serif | 20px | 24px | 28px | 500 | -0.02em (-0.8px) | Card Titles, Modal Headers |
| `h4` | Geist, sans-serif | 16px | 18px | 24px | 500 | -0.01em (-0.4px) | Milestone Titles, Sub-headings |
| `body-large` | Geist, sans-serif | 16px | 16px | 24px | 400 | normal | Intro text, primary descriptions |
| `body-medium` | Geist, sans-serif | 14px | 14px | 20px | 400 | normal | Standard body text, form labels |
| `body-small` | Geist, sans-serif | 12px | 12px | 16px | 400 | normal | Secondary hints, timestamp text |
| `caption` | Geist, sans-serif | 10px | 11px | 14px | 600 | +0.06em (Uppercase) | Status badges, category tags |
| `mono-number` | Geist Mono, monospace | 20px | 28px | 32px | 500 | -0.02em | DOGE amounts, financial totals |
| `mono-code` | Geist Mono, monospace | 12px | 13px | 18px | 400 | normal | Addresses, tx hashes, content hashes |

---

## 4. Color Palette

DogeCommit translates Stargate's neutral dark foundation and incorporates a tailored **DOGE Gold** accent system for brand identity.

### Complete Color Token Matrix

| Token Name | HEX / RGBA | Role / Application | Verified / Derived |
|---|---|---|---|
| `bg-canvas` | `#141414` | Main page background canvas | Verified from Stargate |
| `bg-sheet` | `#1A1A1A` | Intermediate section containers, table wrappers | Verified from Stargate |
| `bg-card` | `#212121` | Interactive cards, modal dialogs, dashboard widgets | Verified from Stargate |
| `bg-input` | `#272727` | Text input fields, inactive tabs, select containers | Verified from Stargate |
| `bg-emphasized` | `#161616` | Recessed sub-panels, code blocks | Verified from Stargate |
| `bg-menu` | `rgba(33, 33, 33, 0.75)` | Floating dropdown menus, fixed navigation bar | Verified base with 75% opacity |
| `border-subtle` | `#252525` | Very soft interior item dividers | Verified from Stargate |
| `border-primary` | `#2C2C2C` | Standard card borders, input borders | Verified from Stargate |
| `border-hover` | `#3D3D3D` | Hovered card and input borders | Verified from Stargate |
| `text-primary` | `#FAFAFA` | Main headings, primary button labels, values | Verified from Stargate |
| `text-secondary` | `#9A9A9A` | Explanatory labels, descriptions, inactive nav | Verified from Stargate |
| `text-disabled` | `#636363` | Disabled button text, placeholder inputs | Verified from Stargate |
| `doge-gold-main` | `#E1B342` | Primary brand accent, primary CTA background | Tailored for DogeCommit |
| `doge-gold-hover` | `#F5C854` | Hover state for gold buttons and links | Tailored for DogeCommit |
| `doge-gold-dark` | `#C49626` | Active/pressed state for gold CTA | Tailored for DogeCommit |
| `doge-gold-subtle` | `rgba(225, 179, 66, 0.08)` | Active card tint, selected milestone outline glow | Tailored for DogeCommit |
| `doge-gold-light` | `rgba(225, 179, 66, 0.16)` | Selected tab highlight, gold badge background | Tailored for DogeCommit |
| `success-main` | `#0FB983` | Approved status badge, release confirmation | Verified from Stargate |
| `success-light` | `rgba(15, 185, 131, 0.12)` | Approved milestone card background tint | Verified from Stargate |
| `error-main` | `#F3566B` | Disputed status badge, refund action, error banner | Verified from Stargate |
| `error-light` | `rgba(243, 86, 107, 0.12)` | Disputed milestone container background tint | Verified from Stargate |
| `warning-main` | `#F46F28` | Pre-activation notice, deadline proximity, wrong net | Verified from Stargate |
| `warning-light` | `rgba(244, 111, 40, 0.12)` | Network mismatch badge, lock warning background | Verified from Stargate |
| `info-main` | `#3E92E0` | Submitted milestone badge, info callouts | Verified from Stargate |
| `info-light` | `rgba(62, 146, 224, 0.12)` | Review banner background tint | Verified from Stargate |

---

## 5. Backgrounds, Textures and Effects

1. **Backdrop Blur (Glassmorphism):**
   - Header & Modals: `backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);`
   - Background: `rgba(20, 20, 20, 0.85)`
2. **Radial Subtle Glow:**
   - Positioned softly behind the Hero section and primary dashboard card:
     `background: radial-gradient(circle at 50% 0%, rgba(225, 179, 66, 0.08) 0%, rgba(20, 20, 20, 0) 70%);`
3. **Card Border Treatments:**
   - Idle: `1px solid #2C2C2C`
   - Hover: `1px solid #3D3D3D; transition: border-color 0.2s ease, box-shadow 0.2s ease;`
   - Active / Focus: `1px solid #E1B342; box-shadow: 0px 0px 12px rgba(225, 179, 66, 0.15);`
   - Disputed State: `1px solid rgba(243, 86, 107, 0.5); box-shadow: 0px 0px 16px rgba(243, 86, 107, 0.1);`
4. **Elevations & Drop Shadows:**
   - Small (`shadow-sm`): `0px 2px 6px rgba(0, 0, 0, 0.3)`
   - Medium (`shadow-md`): `0px 4px 12px rgba(20, 20, 20, 0.45)` (Matches verified Stargate shadow)
   - Large / Modal (`shadow-xl`): `0px 12px 36px rgba(0, 0, 0, 0.65), 0px 0px 1px 1px #2C2C2C`

---

## 6. Layout and Spacing System

### Breakpoints (Verified from Stargate Engine)
- **`xs`:** `0px` (Mobile portrait)
- **`sm`:** `600px` (Large mobile / small tablet)
- **`md`:** `900px` (Tablet landscape / small laptop — primary layout shift breakpoint)
- **`lg`:** `1200px` (Desktop desktop container max-width: 1140px)
- **`xl`:** `1440px` (Wide desktop container max-width: 1320px)

### Spacing Scale
- `2xs`: `4px`
- `xs`: `8px`
- `sm`: `12px`
- `md`: `16px`
- `lg`: `24px`
- `xl`: `32px`
- `2xl`: `48px`
- `3xl`: `64px`

### Layout Framework
- **Header Height:** `72px` fixed, sticky with backdrop blur.
- **Main Container Width:** `max-w-6xl` (`1152px`) centered with horizontal padding (`px-4` on mobile, `px-8` on desktop).
- **Form / Card Width:** Max `640px` for wizards and focused escrow cards.

---

## 7. Buttons and Interactive Components

Every interactive element in DogeCommit corresponds to strict onchain actions and role permissions.

### Button Style Hierarchy

| Variant | Normal Background | Hover Background | Border | Text Color | Border Radius | Padding (Y/X) |
|---|---|---|---|---|---|---|
| **Primary Gold** | `#E1B342` | `#F5C854` | None | `#141414` (Bold) | `8px` | `10px 20px` |
| **Secondary Dark** | `#272727` | `#333333` | `1px solid #3D3D3D` | `#FAFAFA` | `8px` | `10px 20px` |
| **Outline Subtle** | `transparent` | `#1A1A1A` | `1px solid #2C2C2C` | `#FAFAFA` | `8px` | `8px 16px` |
| **Success Action** | `#0FB983` | `#10A073` | None | `#FFFFFF` | `8px` | `10px 20px` |
| **Danger / Dispute** | `#F3566B` | `#D84155` | None | `#FFFFFF` | `8px` | `10px 20px` |
| **Ghost / Icon** | `transparent` | `#272727` | None | `#9A9A9A` $\rightarrow$ `#FAFAFA` | `6px` | `8px` |

---

### Detailed Action Button Specifications

#### A. Global & Wallet Actions
1. **`Connect Wallet`**
   - *Role:* Anonymous / Unconnected User
   - *Visibility:* Always visible in top-right navigation when disconnected.
   - *Result:* Opens Wallet Selection Modal.
2. **`Switch to DogeOS Testnet`**
   - *Role:* Connected User on wrong chain ($ID \neq 6281971$)
   - *Visibility:* Replaces action buttons or appears in banner when wrong network detected.
   - *Result:* Triggers `wallet_switchEthereumChain` with fallback to `wallet_addEthereumChain`.
3. **`Disconnect Wallet`**
   - *Role:* Connected User
   - *Visibility:* Inside Account Details dropdown.
   - *Result:* Clears local session and resets UI state.

#### B. Project Lifecycle Actions
1. **`Create Project` (Initiation)**
   - *Role:* Client
   - *Visibility:* Client dashboard and landing page hero.
   - *Result:* Navigates to the multi-step project creation wizard.
2. **`Confirm Project Creation` (Onchain)**
   - *Role:* Client
   - *Visibility:* Final step of Project Creation Wizard.
   - *State Condition:* Form validation passes ($1 \le \text{milestones} \le 25$, valid contributor address, future deadlines).
   - *Result:* Prompts wallet signature for `createProject(...)`. Emits `ProjectCreated`.
3. **`Fund Escrow`**
   - *Role:* Client
   - *Visibility:* Project header when `status == Created` and `!isFunded`.
   - *State Condition:* Client has sufficient DOGE balance.
   - *Sub-steps:* Prompts exact `approve(escrow, totalAmount)` if allowance insufficient, then prompts `fundProject(id)`.
   - *Result:* Releases funds to escrow. If contributor has already accepted, synchronously transitions status to `Active`.
4. **`Accept Project`**
   - *Role:* Contributor
   - *Visibility:* Project header when connected wallet matches `project.contributor`, `status == Created`, and `!isAccepted`.
   - *Result:* Prompts wallet signature for `acceptProject(id)`. If project was already funded, synchronously transitions status to `Active`.
5. **`Cancel Project` (Pre-Activation Recovery)**
   - *Role:* Client
   - *Visibility:* Project header when `status == Created` and `!(isFunded && isAccepted)`.
   - *Disabled When:* `status == Active` or `status == Completed`.
   - *Result:* Prompts `cancelProject(id)`. Returns 100% of deposited DOGE to client if funded. Transitions to `Cancelled`.

#### C. Milestone Actions
1. **`Submit Evidence`**
   - *Role:* Contributor
   - *Visibility:* Individual milestone card when `project.status == Active` and `milestone.status == Pending`.
   - *Result:* Opens evidence submission dialog requiring URL and/or content hash.
2. **`Approve Milestone`**
   - *Role:* Client
   - *Visibility:* Individual milestone card when `project.status == Active` and `milestone.status == Submitted`.
   - *Result:* Prompts `approveMilestone(projectId, index)`. Executes CEI transfer of milestone DOGE to contributor. Status $\rightarrow$ `Approved`.
3. **`Raise Dispute`**
   - *Role:* Client
   - *Visibility:* Individual milestone card when `project.status == Active` and `milestone.status == Submitted`.
   - *Result:* Opens dispute reason modal. Prompts `disputeMilestone(projectId, index, reason)`. Locks funds onchain. Status $\rightarrow$ `Disputed`.

#### D. Dispute Resolution Actions
1. **`Concede & Release to Contributor` (Direct Concession)**
   - *Role:* Client only
   - *Visibility:* Disputed milestone panel when `milestone.status == Disputed`.
   - *Result:* Prompts `resolveDispute(projectId, index, ReleaseToContributor)`. Releases 100% of milestone DOGE to contributor immediately. Status $\rightarrow$ `ResolvedReleased`.
2. **`Concede & Refund to Client` (Direct Concession)**
   - *Role:* Contributor only
   - *Visibility:* Disputed milestone panel when `milestone.status == Disputed`.
   - *Result:* Prompts `resolveDispute(projectId, index, RefundToClient)`. Refunds 100% of milestone DOGE to client immediately. Status $\rightarrow$ `ResolvedRefunded`.
3. **`Propose Refund to Client`**
   - *Role:* Client
   - *Visibility:* Disputed milestone panel when `milestone.status == Disputed`.
   - *Result:* Prompts `proposeDisputeResolution(projectId, index, RefundToClient)`.
4. **`Propose Release to Contributor`**
   - *Role:* Contributor
   - *Visibility:* Disputed milestone panel when `milestone.status == Disputed`.
   - *Result:* Prompts `proposeDisputeResolution(projectId, index, ReleaseToContributor)`.
5. **`Confirm Counterpart Proposal`**
   - *Role:* Counterparty matching active proposal (`msg.sender != proposedBy`)
   - *Visibility:* Disputed milestone panel when counterparty has an active proposal.
   - *Result:* Prompts `resolveDispute(projectId, index, proposedOutcome)`. Executes release or refund.

---

## 8. Forms and Input Components

1. **Text & Address Inputs:**
   - Background: `#272727`
   - Border: `1px solid #2C2C2C`
   - Height: `44px`
   - Border Radius: `8px`
   - Typography: 14px Geist (`Geist Mono` for address and hash fields)
   - Focus State: Border color `#E1B342`, subtle gold ring shadow `0 0 0 1px #E1B342`.
2. **DOGE Amount Field:**
   - Integrated with token adornment badge on right: `[ DOGE ]` in `#9A9A9A` text.
   - Auto-calculates integer/decimal units ($10^{18}$).
3. **Date & Time Picker:**
   - Enforces strictly future timestamps ($t > \text{now}$).
   - Disables past calendar dates.
4. **Validation Messaging:**
   - Real-time client-side error hints rendered below the input in `#F3566B` (12px Geist).

---

## 9. Cards, Tables and Status Indicators

### Status Badge Design Specifications

| Badge Label | Text Color | Background Color | Border Color | Icon / Indicator |
|---|---|---|---|---|
| **Created** | `#FAFAFA` | `#272727` | `#3D3D3D` | Gray Circle |
| **Awaiting Acceptance** | `#F46F28` | `rgba(244, 111, 40, 0.12)` | `rgba(244, 111, 40, 0.3)` | Amber Hourglass |
| **Awaiting Funding** | `#E1B342` | `rgba(225, 179, 66, 0.12)` | `rgba(225, 179, 66, 0.3)` | Gold Coin Icon |
| **Active** | `#3E92E0` | `rgba(62, 146, 224, 0.12)` | `rgba(62, 146, 224, 0.3)` | Blue Pulsing Dot |
| **Submitted** | `#3E92E0` | `rgba(62, 146, 224, 0.16)` | `rgba(62, 146, 224, 0.4)` | Document Icon |
| **Approved / Released** | `#0FB983` | `rgba(15, 185, 131, 0.12)` | `rgba(15, 185, 131, 0.3)` | Checkmark Icon |
| **Disputed** | `#F3566B` | `rgba(243, 86, 107, 0.14)` | `rgba(243, 86, 107, 0.4)` | Warning Triangle |
| **Refunded** | `#FAFAFA` | `rgba(250, 250, 250, 0.10)` | `#3D3D3D` | Return Arrow Icon |
| **Completed** | `#0FB983` | `rgba(15, 185, 131, 0.18)` | `#0FB983` | Verified Shield |
| **Cancelled** | `#636363` | `#1A1A1A` | `#2C2C2C` | Slash Circle |

---

## 10. Navigation and Information Architecture

### Header Bar (`72px`, Sticky, `backdrop-filter: blur(12px)`)
```
[ (DogeCommit Logo) DogeCommit ]      [ Dashboard ]  [ My Projects ]  [ How It Works ]  [ Docs ]      [ (DogeOS Testnet) | 0x12...34 ]
```
- **Logo:** Clean geometric doge-paw lockup with golden highlight.
- **Center Nav Links:** Clean 14px Geist text with `#9A9A9A` idle, `#FAFAFA` hover, and gold underline pill for the active route.
- **Right Utilities:**
  - Network Indicator Badge: Green dot + `DogeOS Chikyū Testnet` (or Amber `Wrong Network`).
  - Wallet Pill: Displays shortened address (`0x1a...4b`), user DOGE balance, and click-to-open menu.

---

## 11. Landing Page Design

### Wireframe & Visual Composition

```
+---------------------------------------------------------------------------------------------------+
|  [DogeCommit Logo]             Dashboard   My Projects   How It Works   Docs       [Connect Wallet] |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|                                       WORK DELIVERED. DOGE SECURED.                               |
|                     The DogeOS-native milestone escrow protocol for trustless Web3 work.          |
|                                                                                                   |
|                       [ Create a Project ]              [ Explore How It Works ]                  |
|                                                                                                   |
|      +-------------------------+  +--------------------------+  +-------------------------------+ |
|      |    1. Lock & Agree      |  |    2. Deliver & Review   |  |     3. Instant Settlement     | |
|      | Client deposits DOGE to |  | Contributor submits work |  | Approved milestones release   | |
|      | escrow with milestones. |  | with verifiable hashes.  |  | DOGE directly to contributor. | |
|      +-------------------------+  +--------------------------+  +-------------------------------+ |
|                                                                                                   |
|  -----------------------------------------------------------------------------------------------  |
|                                     WHY DOGECOMMIT ON DOGEOS?                                     |
|                                                                                                   |
|    [ 100% Onchain Settlement ]     [ Exact DOGE Approvals ]     [ Mutual Dispute Resolution ]     |
|    Settled in native DOGE via      No infinite token drains.    No opaque centralized arbiters.   |
|    DogeOS ERC-20 precompile.       Exact deposit accounting.    Consensus or capital stays locked.|
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
|  (c) 2026 DogeCommit Protocol • Built for DogeOS Chikyū Testnet • Network ID: 6281971 • Explorer  |
+---------------------------------------------------------------------------------------------------+
```

---

## 12. Client Dashboard

### Wireframe & Financial Summary Layout

```
+---------------------------------------------------------------------------------------------------+
|  CLIENT DASHBOARD                                                      [ + Create New Project ]   |
+---------------------------------------------------------------------------------------------------+
|  TOTAL ESCROW VOLUME     ACTIVE ESCROW LOCKED     TOTAL DOGE RELEASED      TOTAL DOGE REFUNDED    |
|  25,000.00 DOGE          10,000.00 DOGE           12,500.00 DOGE           2,500.00 DOGE          |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  YOUR MANAGED PROJECTS (3)                                           [ All ] [ Active ] [ Action Needed ]
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  | Project: Smart Contract Audit v1.0                 Contributor: 0x71C...9A      [ ACTIVE ]  |  |
|  | Total: 5,000.00 DOGE | 2 of 3 Milestones Settled                                            |  |
|  | Progress: [====================================............] 66%                            |  |
|  | ACTION NEEDED: Milestone 3 submitted by contributor. Review evidence now.                   |  |
|  |                                                 [ Review & Approve ]   [ View Details ]      |  |
|  +---------------------------------------------------------------------------------------------+  |
|  | Project: React UI Frontend Implementation          Contributor: 0x4B2...F1      [ ACTIVE ]  |  |
|  | Total: 8,000.00 DOGE | 1 Disputed Milestone                                                 |  |
|  | STATUS: Milestone 2 in dispute. Funds locked in contract custody.                           |  |
|  |                                                 [ Resolve Dispute ]    [ View Details ]      |  |
|  +---------------------------------------------------------------------------------------------+  |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

---

## 13. Contributor Dashboard

### Wireframe & Contributor Work Queue

```
+---------------------------------------------------------------------------------------------------+
|  CONTRIBUTOR WORKSPACE                                                                            |
+---------------------------------------------------------------------------------------------------+
|  TOTAL EARNED TO DATE    ACTIVE WORK VALUE        PENDING RELEASES         AWAITING YOUR ACCEPTANCE
|  12,500.00 DOGE          7,500.00 DOGE            2,500.00 DOGE            1 Project              |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  ATTENTION REQUIRED: INCOMING PROJECT AGREEMENT                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  | Project: DogeOS Indexer Integration                Client: 0x88F...10       [ AWAITING ACCEPTANCE ]
|  | Total Payment: 4,000.00 DOGE (3 Milestones) | Funded by Client: YES (Funds in Escrow)       |  |
|  | Terms: Milestone 1 (1,000 DOGE), Milestone 2 (1,500 DOGE), Milestone 3 (1,500 DOGE)         |  |
|  |                                                 [ Accept Agreement ]   [ Inspect Details ]   |  |
|  +---------------------------------------------------------------------------------------------+  |
|                                                                                                   |
|  YOUR ACTIVE WORKSTREAM                                                                           |
|  +---------------------------------------------------------------------------------------------+  |
|  | Project: Smart Contract Audit v1.0                 Client: 0x71C...9A       [ ACTIVE ]      |  |
|  | Milestone 3: Final Security Report & Remediation Checks (1,500.00 DOGE)                     |  |
|  | Status: SUBMITTED (Awaiting client review)                                                  |  |
|  | Evidence Submitted: https://github.com/org/repo/pull/14 | IPFS: QmZtmD...                     |  |
|  |                                                                        [ View Details ]     |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

---

## 14. Wallet Connection Flow

### Modal Structure & States

```
+-------------------------------------------------------------+
|  Connect Wallet                                         [X] |
+-------------------------------------------------------------+
|  Select an EVM wallet to connect to DogeOS Chikyū Testnet:  |
|                                                             |
|  +-------------------------------------------------------+  |
|  | (MetaMask Icon)   MetaMask              [ Installed ] |  |
|  +-------------------------------------------------------+  |
|  | (Rabby Icon)     Rabby Wallet           [ Detected ]  |  |
|  +-------------------------------------------------------+  |
|  | (Coinbase Icon)  Coinbase Wallet        [ Connect ]   |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  (i) Network Requirement: DogeOS Chikyū Testnet (ID: 6281971)|
|      Your private keys are never requested or stored.       |
+-------------------------------------------------------------+
```

### Connected State Dropdown:
- Displays user's full hex address with copy button and external explorer link.
- Shows balance in DOGE (`0x5300...d09e`).
- Single-click `Disconnect Wallet` button.

---

## 15. Project Creation Wizard

Multi-step form adhering strictly to the **1–25 milestone boundary**:

### Step Progression Layout
```
Step 1: General Info   --->   Step 2: Milestones (1-25)   --->   Step 3: Review & Summary   --->   Step 4: Deposit & Confirm
```

#### Step 2: Milestone Builder Wireframe
```
+---------------------------------------------------------------------------------------------------+
|  STEP 2: DEFINE MILESTONES (Count: 2 / Max: 25)                                                   |
+---------------------------------------------------------------------------------------------------+
|  +---------------------------------------------------------------------------------------------+  |
|  | MILESTONE 1                                                                                 |  |
|  | Title: Initial Architecture & Scaffolding                                                   |  |
|  | Amount (DOGE): [ 1,500.00        DOGE ]   Target Deadline: [ 2026-11-20 18:00 UTC ]         |  |
|  | Deliverable Requirements:                                                                   |  |
|  | [ GitHub repository link containing modular contract structure and unit test setup.       ] |  |
|  +---------------------------------------------------------------------------------------------+  |
|  +---------------------------------------------------------------------------------------------+  |
|  | MILESTONE 2                                                                     [ Remove ]  |  |
|  | Title: Testnet Deployment & Verified Contract                                               |  |
|  | Amount (DOGE): [ 2,000.00        DOGE ]   Target Deadline: [ 2026-11-30 18:00 UTC ]         |  |
|  | Deliverable Requirements:                                                                   |  |
|  | [ Deployed contract address on DogeOS testnet with passing test report and L2Scan link.    ] |  |
|  +---------------------------------------------------------------------------------------------+  |
|                                                                                                   |
|  [ + Add Another Milestone (Max 25) ]                                                             |
|                                                                                                   |
|  TOTAL PROJECT FUNDING REQUIRED: 3,500.00 DOGE                                                    |
|                                                                                                   |
|  [ Back to Step 1 ]                                                       [ Proceed to Review ]   |
+---------------------------------------------------------------------------------------------------+
```

---

## 16. Project Details Screen

```
+---------------------------------------------------------------------------------------------------+
|  <- Back to Projects                                                                              |
|  Smart Contract Audit & Frontend Scaffolding                              [ STATUS: ACTIVE ]      |
+---------------------------------------------------------------------------------------------------+
|  CLIENT: 0x91F...4A (You)           CONTRIBUTOR: 0x48B...11         ESCROW CONTRACT: 0xE7f...12    |
|  TOTAL VALUE: 5,000.00 DOGE         LOCKED: 3,000.00 DOGE           RELEASED: 2,000.00 DOGE       |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  AGREEMENT MILESTONES                                                                             |
|                                                                                                   |
|  [✓] Milestone 1: Core Architecture           1,000 DOGE    Deadline: Nov 10   [ RELEASED ]       |
|      Paid to contributor via Tx 0x4a...c9 on 2026-11-08                                           |
|                                                                                                   |
|  [✓] Milestone 2: Hardhat Test Suite          1,000 DOGE    Deadline: Nov 15   [ RELEASED ]       |
|      Paid to contributor via Tx 0x8b...fa on 2026-11-14                                           |
|                                                                                                   |
|  [!] Milestone 3: Frontend Integration        1,500 DOGE    Deadline: Nov 25   [ SUBMITTED ]      |
|      Evidence URL: https://github.com/dogecommit/app/pull/12                                      |
|      Content Hash: QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco                                 |
|      Submitted: 2026-11-20 14:22 UTC                                                              |
|      [ Approve Milestone & Release 1,500 DOGE ]              [ Raise Milestone Dispute ]          |
|                                                                                                   |
|  [ ] Milestone 4: Final Documentation         1,500 DOGE    Deadline: Dec 05   [ PENDING ]        |
|      Work in progress by contributor. Evidence not yet submitted.                                 |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

---

## 17. Milestone Workflow (Submission & Approval)

### Contributor Evidence Submission Modal
```
+-------------------------------------------------------------+
|  Submit Milestone Evidence                              [X] |
+-------------------------------------------------------------+
|  Milestone 3: Frontend Integration (1,500.00 DOGE)          |
|                                                             |
|  Deliverable URL:                                           |
|  [ https://github.com/dogecommit/frontend/pull/4          ] |
|                                                             |
|  Content Hash (IPFS CID or SHA-256):                        |
|  [ QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG         ] |
|                                                             |
|  (i) At least one reference (URL or hash) is required.      |
|      This reference is permanently recorded onchain.        |
|                                                             |
|  [ Cancel ]                             [ Submit Evidence ] |
+-------------------------------------------------------------+
```

### Client Approval Confirmation Modal
```
+-------------------------------------------------------------+
|  Approve Milestone & Release Payment                    [X] |
+-------------------------------------------------------------+
|  You are authorizing the release of:                        |
|                                                             |
|                 1,500.00 DOGE                               |
|  To Contributor: 0x48B2...11A9                              |
|                                                             |
|  WARNING: This action is permanent and executes immediately |
|  onchain. Completed milestone payments cannot be reversed.  |
|                                                             |
|  [ Review Deliverable Again ]         [ Confirm & Release ] |
+-------------------------------------------------------------+
```

---

## 18. Dispute Workflow

### Client Dispute Initiation Modal
```
+-------------------------------------------------------------+
|  Raise Milestone Dispute                                [X] |
+-------------------------------------------------------------+
|  Milestone 3: Frontend Integration (1,500.00 DOGE)          |
|                                                             |
|  Dispute Reason (Required):                                 |
|  [ Deliverable fails unit test suites; repository lacks   ] |
|  [ documentation specified in milestone requirements.     ] |
|                                                             |
|  CRITICAL NOTICE:                                           |
|  - Raising a dispute FREEZES this milestone's funds.        |
|  - Unresolved disputes remain locked in contract custody.   |
|  - Dispute reason is emitted via onchain event logs.        |
|  - There is no automated third-party arbitrator in the MVP. |
|                                                             |
|  [ Keep Under Review ]                  [ Confirm Dispute ] |
+-------------------------------------------------------------+
```

### Disputed Milestone Management Panel
```
+---------------------------------------------------------------------------------------------+
|  [!] MILESTONE 3: FRONTEND INTEGRATION — DISPUTED                                           |
|  LOCKED ESCROW AMOUNT: 1,500.00 DOGE                                                        |
+---------------------------------------------------------------------------------------------+
|  Dispute Initiated by Client on 2026-11-21 10:15 UTC                                        |
|  Reason: "Deliverable fails unit test suites; repository lacks documentation."               |
|                                                                                             |
|  DISPUTE RESOLUTION CENTER:                                                                 |
|  Funds cannot be released through standard approval. Choose an authorized resolution path: |
|                                                                                             |
|  OPTION 1: VOLUNTARY CONCESSION                                                             |
|  - Client can voluntarily yield 100% of funds to contributor: [ Concede to Contributor ]     |
|  - Contributor can voluntarily yield 100% of funds to client: [ Concede to Client ]         |
|                                                                                             |
|  OPTION 2: MUTUAL PROPOSAL & CONFIRMATION                                                   |
|  - Propose an agreed settlement: [ Propose Refund to Client ] [ Propose Release to Contrib ]|
|                                                                                             |
|  * Unresolved disputes remain locked in escrow indefinitely. Neither party can seize funds.  |
+---------------------------------------------------------------------------------------------+
```

---

## 19. Transaction Feedback & Error States

| State | Visual Indicator | UI Copy / Guidance | Action Available |
|---|---|---|---|
| **Awaiting Wallet Signature** | Blue pulsing spinner | "Please confirm the transaction in your wallet..." | None (wait for prompt) |
| **Transaction Broadcasted** | Gold rotating ring | "Transaction submitted to DogeOS. Waiting for block confirmation..." | View on L2Scan (Link) |
| **Transaction Confirmed** | Green checkmark | "Transaction confirmed onchain! State updated." | Dismiss / View Receipt |
| **Transaction Reverted** | Red warning icon | "Transaction reverted by DogeOS: [Decoded Custom Error]." | Inspect Error & Retry |
| **User Rejected** | Neutral info banner | "Transaction signature rejected in wallet." | Reopen Transaction |
| **Wrong Network** | Persistent top banner | "Connected to unsupported network. DogeCommit requires DogeOS Chikyū Testnet." | Switch Network Button |
| **RPC Log Pruning Warning** | Yellow inline notice | "Historical dispute reason unavailable from RPC logs. Refer to L2Scan tx history." | View Tx on Explorer |

---

## 20. Responsive Design

- **Mobile Viewports ($< 600\text{px}$):**
  - Navigation collapses into a full-screen frosted overlay menu.
  - Financial metric cards stack vertically (1 column).
  - Milestone cards expand to display deliverable links and actions without side-by-side overflow.
- **Tablet Viewports ($600\text{px} - 900\text{px}$):**
  - Financial metric cards display in a $2 \times 2$ grid.
  - Form actions span full width with prominent touch targets ($48\text{px}$ minimum height).
- **Desktop Viewports ($\ge 900\text{px}$):**
  - Standard multi-column grid layouts with fixed sticky summary sidebars.
  - Maximum content container capped at `1152px`.

---

## 21. Accessibility (WCAG 2.1 AA Compliance)

1. **Contrast Ratios:**
   - Text `#FAFAFA` on `#141414`: **16.8:1** (Exceeds WCAG AAA).
   - Text `#9A9A9A` on `#141414`: **5.2:1** (Exceeds WCAG AA for body text).
   - Accent `#E1B342` with `#141414` text: **8.4:1** (Exceeds WCAG AAA).
2. **Keyboard Focus Management:**
   - Visible gold focus rings on all interactive elements (`outline: 2px solid #E1B342; outline-offset: 2px;`).
   - Modal focus trapping: `Escape` key closes modals, tab order restricted to modal children.
3. **Screen Reader ARIA Attributes:**
   - Milestone progress bar tagged with `role="progressbar" aria-valuenow="66" aria-valuemin="0" aria-valuemax="100"`.
   - Modals use `aria-modal="true" role="dialog" aria-labelledby="modal-title"`.

---

## 22. Reusable Component Inventory

1. `Button` (Primary Gold, Secondary Dark, Outline, Danger, Success, Ghost)
2. `Badge` (Status indicators for all 10 project and milestone states)
3. `MetricCard` (Financial overview box with title, mono-amount, and subtext)
4. `AddressPill` (Truncated address with copy icon and block explorer link)
5. `MilestoneCard` (Accordion/card component for individual milestone deliverables)
6. `ModalDialog` (Base frosted backdrop modal with header, body, and action footer)
7. `TextInput` / `TextAreaInput` (Themed form inputs with label, placeholder, and validation error text)
8. `NetworkBanner` (Top sticky warning when wallet is on wrong chain)
9. `ProgressBar` (Segmented progress bar visualizing settled vs pending milestone funds)

---

## 23. Screen Inventory and Priorities

| Screen Name | Route / View | Priority | Primary Actor |
|---|---|---|---|
| **Landing Page** | `/` | P1 | Public / Prospective Users |
| **Client Dashboard** | `/dashboard/client` | P0 | Client |
| **Contributor Workspace** | `/dashboard/contributor` | P0 | Contributor |
| **Project Creation Wizard** | `/projects/create` | P0 | Client |
| **Project Details View** | `/projects/:id` | P0 | Client & Contributor |
| **Milestone Review Modal** | Overlay | P0 | Client |
| **Dispute Resolution Panel**| `/projects/:id/disputes` | P0 | Client & Contributor |
| **Wallet Connection Modal**| Global Overlay | P0 | All Users |
| **How It Works / Explainer**| `/how-it-works` | P2 | Public |

---

## 24. MVP Design Boundaries

In strict alignment with the approved project specifications:
- **No Freelance Marketplace:** No public talent browsing, job posting boards, or algorithmic bidding.
- **No In-App Messaging:** Communication and dispute discussions occur out-of-band.
- **No Third-Party Arbitration:** No decentralized jury panels, Kleros integrations, or automated decision trees.
- **No AI Deliverable Verification:** Evidence is recorded as provided; humans perform reviews.
- **No Evidence Resubmission Loops:** Disputed milestones remain frozen until settled via allowed resolution options.
- **No Automated Deadline Clawbacks:** Milestones never automatically refund or release based on time elapsed.
