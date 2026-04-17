# Oak Contracts SDK — Examples

Real-world, scenario-driven examples that walk you through every capability of the Oak Contracts SDK. Each scenario tells a story — a platform onboarding, a crowdfunding campaign, an e-commerce checkout — and implements it step by step with working code.

Whether you are a developer integrating Oak into your product or a stakeholder evaluating the protocol, these examples show exactly how the SDK works in practice.

> **Getting started:** You need deployed contract addresses and testnet access.
> Contact **[support@oaknetwork.org](mailto:support@oaknetwork.org)** to begin your onboarding.

---

## How to Read These Examples

Each scenario folder contains:

- A **README.md** with the story, the roles involved, and a summary of each step
- **Numbered TypeScript files** (`01-...`, `02-...`) that you can read top-to-bottom like a tutorial

Start with **Scenario 0** if you are a new platform joining Oak Protocol. Start with **Scenario 1** or **2** if your platform is already onboarded and you want to launch a campaign.

---

## Multi-token ERC-20 support

Oak is **multi-token**: **`GlobalParams`** stores **`currencyToTokens`** — seeded in **`initialize(currencies, tokensPerCurrency)`**, then maintained by the protocol owner with **`addTokenToCurrency`** / **`removeTokenFromCurrency`**, readable via **`getTokensForCurrency(currency)`**. Campaign creation copies that list onto **`CampaignInfo`**; treasuries check **`isTokenAccepted`** on every **`pledgeToken` / `paymentToken`**. In code, use **`globalParams.getTokensForCurrency(...)`** or **`campaign.getAcceptedTokens()`** to populate wallet UIs or validation. Balances, fees, refunds, and raised-amount reads are **per token address**, in **native decimals** (normalized where the protocol aggregates across tokens).

The numbered examples use **one stablecoin** (e.g. USDC) so the files stay easy to read. In production, swap in **any address** from your campaign’s accepted-token list and match **decimals** when you build amounts.

---

## Folder Structure

```
examples/
├── README.md                        ← you are here
├── _shared/
│   └── setup.ts                     ← shared client setup and env helpers
│
├── 00-platform-enlistment/          ← Platform onboarding (Protocol Admin + Platform Admin)
│   ├── README.md
│   ├── 01-enlist-platform.ts
│   ├── 02-verify-enlistment.ts
│   ├── 03-register-treasury-implementations.ts
│   ├── 04-approve-implementations.ts
│   ├── 05-verify-setup.ts
│   └── 06-optional-configuration.ts  ← line items, claim delay, data keys, adapter
│
├── 01-campaign-all-or-nothing/      ← Crowdfunding: all-or-nothing model
│   ├── README.md
│   ├── 01-create-campaign.ts
│   ├── 02-lookup-campaign.ts
│   ├── 03-review-campaign.ts
│   ├── 04-deploy-treasury.ts
│   ├── 05-manage-rewards.ts         ← add + remove rewards
│   ├── 06-backer-pledge.ts           ← with or without a reward
│   ├── 07-monitor-progress.ts
│   ├── 08-disburse-fees.ts
│   ├── 09a-success-withdraw.ts
│   ├── 09b-failure-refund.ts
│   ├── 10-pause-unpause-treasury.ts
│   └── 11-cancel-treasury.ts
│
├── 02-campaign-keep-whats-raised/   ← Crowdfunding: flexible funding model
│   ├── README.md
│   ├── 01-create-campaign.ts
│   ├── 02-deploy-treasury.ts
│   ├── 03-configure-treasury.ts         ← Platform Admin
│   ├── 04-manage-rewards.ts             ← add + remove rewards
│   ├── 05-backer-pledge.ts              ← with/without reward, gateway fees
│   ├── 06a-approve-partial-withdrawal.ts ← platform approves mid-campaign withdraw
│   ├── 06b-execute-partial-withdrawal.ts ← creator partial withdraw (after delay)
│   ├── 06c-final-withdrawal.ts          ← post-deadline sweep
│   ├── 07-monitor-progress.ts           ← full campaign dashboard
│   ├── 08-disburse-fees.ts              ← must call before cancellation
│   ├── 09-claim-fund.ts                 ← Platform Admin
│   ├── 10-claim-tips.ts                 ← Platform Admin
│   ├── 11-claim-refund.ts
│   ├── 12-update-campaign.ts            ← OPTIONAL
│   ├── 13-pause-unpause-treasury.ts     ← OPTIONAL
│   └── 14-cancel-treasury.ts            ← OPTIONAL
│
├── 03-campaign-payment-treasury/    ← E-commerce payment processing
│   ├── README.md
│   ├── 01-create-campaign.ts
│   ├── 02-deploy-treasury.ts
│   ├── 03-create-payment.ts            ← single + batch
│   ├── 04-process-crypto-payment.ts
│   ├── 05-confirm-payment.ts           ← single + batch
│   ├── 06-read-payment-data.ts         ← payment details + treasury dashboard
│   ├── 07-handle-refunds.ts            ← cancel + self/admin refund
│   ├── 08-disburse-fees.ts
│   ├── 09-withdraw-funds.ts
│   ├── 10-claim-expired-funds.ts       ← TimeConstrained only
│   ├── 11-claim-non-goal-line-items.ts
│   ├── 12-pause-unpause-treasury.ts    ← OPTIONAL
│   └── 13-cancel-treasury.ts           ← OPTIONAL
│
├── 04-event-monitoring/             ← Dashboards, analytics, real-time feeds
│   ├── README.md
│   ├── 01-historical-logs.ts
│   ├── 02-treasury-events.ts
│   ├── 03-realtime-watchers.ts
│   ├── 04-decode-raw-logs.ts
│   └── 05-metrics-aggregation.ts
│
├── 05-error-handling/               ← Simulation, typed errors, safe transactions
│   ├── README.md
│   ├── 01-simulate-before-send.ts
│   ├── 02-prepare-transaction.ts
│   ├── 03-catch-typed-errors.ts
│   ├── 04-read-only-client.ts
│   ├── 05-safe-transaction-pattern.ts
│   └── 06-simulate-with-error-decode.ts
│
└── 06-advanced-patterns/            ← Multicall, signers, item registry, registry keys
    ├── README.md
    ├── 01-multicall.ts
    ├── 02-per-entity-signer.ts
    ├── 03-per-call-signer.ts
    ├── 04-item-registry.ts
    ├── 05-registry-keys.ts
    ├── 06-get-receipt.ts
    ├── 07-browser-wallet.ts
    └── 08-privy-wallet.ts
```

---

## Roles

Four roles appear throughout these examples. Understanding who does what is key to following each scenario:

| Role | Who they are | What they do |
| --- | --- | --- |
| **Protocol Admin** | The Oak Network team | Enlists new platforms, approves treasury implementations, governs global protocol parameters |
| **Platform Admin** | The operations team running a platform (e.g., an e-commerce site or crowdfunding portal) | Registers treasury models, configures fees and line items, confirms and cancels payments |
| **Campaign Creator** | A user who launches a campaign on a platform (e.g., an artist, a startup founder) | Creates campaigns, deploys treasuries, adds reward tiers, withdraws raised funds |
| **Backer / Buyer** | A user who supports a campaign or makes a purchase | Pledges for rewards, processes crypto payments, claims refunds if eligible |

> **Platform Onboarding** is a coordinated process between the Protocol Admin and the Platform Admin. See [`00-platform-enlistment/`](./00-platform-enlistment/) for the complete walkthrough, or contact [support@oaknetwork.org](mailto:support@oaknetwork.org) to get started.

---

## Quick Start

Every example imports from `@oaknetwork/contracts-sdk`. The `_shared/setup.ts` file shows the common client setup pattern used across all examples.

```typescript
import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL,
  privateKey: process.env.PRIVATE_KEY! as `0x${string}`,
});
```

Then pick a scenario folder and follow the steps in order.

---

## Scenario Overview

| # | Scenario | What you will learn |
| --- | --- | --- |
| 0 | [Platform Enlistment](./00-platform-enlistment/) | How a new platform joins Oak Protocol — enlistment, treasury registration, approval, plus optional configuration (line items, claim delay, data keys, adapter) |
| 1 | [All-or-Nothing Campaign](./01-campaign-all-or-nothing/) | Full crowdfunding lifecycle with a funding goal — success path and failure path |
| 2 | [Keep-What's-Raised Campaign](./02-campaign-keep-whats-raised/) | Flexible funding with mid-campaign withdrawals, tips, and configurable fees |
| 3 | [Payment Treasury](./03-campaign-payment-treasury/) | E-commerce payment flow with line items, confirmations, and refunds |
| 4 | [Event Monitoring](./04-event-monitoring/) | Building dashboards with historical logs, real-time watchers, and metrics |
| 5 | [Error Handling](./05-error-handling/) | Simulating transactions, catching typed errors, and safe send patterns |
| 6 | [Advanced Patterns](./06-advanced-patterns/) | Multicall batching, signer overrides, item registry, and protocol configuration |
