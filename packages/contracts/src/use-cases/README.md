# Oak Contracts SDK — Use Cases

This folder contains **use-case-driven integration guides** that show how real businesses would integrate with the Oak protocol using the Contracts SDK. Each guide tells a complete business story — from the problem to the on-chain solution — with illustrative code snippets.

> **These are documentation guides, not runnable scripts.** For executable API-reference examples, see [`examples/`](../examples/).

## Multi-token ERC-20 support

Campaigns are **not** tied to a single asset like USDC or USDT. **`GlobalParams`** owns the canonical **currency → ERC-20[]** mapping: **`initialize`** seeds `currencies` and `tokensPerCurrency` at deploy, and the protocol admin can later **`addTokenToCurrency`** / **`removeTokenFromCurrency`** (emitting **`TokenAddedToCurrency`** / **`TokenRemovedFromCurrency`**). **`getTokensForCurrency(currency)`** returns the full address list for a currency key.

When **`CampaignInfoFactory.createCampaign`** runs, it resolves the campaign’s **`campaignData.currency`** to that list and stores a **cached copy** on **`CampaignInfo`** (with **`isTokenAccepted`** for O(1) checks). In the SDK you can read the live list with **`campaign.getAcceptedTokens()`** or cross-check **`globalParams.getTokensForCurrency(currency)`** against what you passed at creation.

Every pledge or payment specifies **`pledgeToken` / `paymentToken`**; treasuries revert if the token is not accepted. Balances, fees, refunds, and raised-amount aggregates are **per token address**, in **each token’s native decimals** (normalized where the protocol compares across tokens). The stories below use USDC or USDT as **examples**; in production, use any address from your campaign’s accepted-token list.

## Use Cases

| Use Case | Demo | Contract(s) Used | Business Story |
|----------|------|-------------------|----------------|
| **Escrow** | [Healthcare Escrow](escrow/healthcare-escrow.md) | PaymentTreasury | MedConnect holds patient payments until a doctor confirms service delivery |
| **Marketplace** | [E-Commerce Marketplace](marketplace/ecommerce-marketplace.md) | PaymentTreasury | CeloMarket locks buyer funds until seller ships; on-chain escrow with line items |
| **Prepayment** | [Automotive Prepayment](prepayment/automotive-prepayment.md) | TimeConstrainedPaymentTreasury | Karma Automotive holds vehicle deposits with automatic expiry protection |
| **Flexible Funding** | [Community Project](flexible-funding/community-project.md) | CampaignInfoFactory + KeepWhatsRaised | TechForge runs keep-what's-raised campaigns with partial withdrawals, tips, and gateway fees |
| **Crowdfunding** | [Creative Campaign](crowdfunding/creative-campaign.md) | CampaignInfoFactory + AllOrNothing | ArtFund runs all-or-nothing campaigns with NFT-backed pledges and reward tiers |

## How to Read These Demos

Each guide follows the same structure:

1. **The Business** — who is the company and what do they do?
2. **Why Oak?** — what specific problems does Oak solve for them?
3. **Contracts Used** — which Oak smart contracts power the solution
4. **Roles** — who are the actors (platform, buyer, seller, backer)?
5. **Integration Flow** — step-by-step walkthrough with code snippets
6. **Architecture Diagram** — visual flow of interactions
7. **Key Takeaways** — lessons and patterns to apply to your own integration

## Contract-to-Use-Case Mapping

Understanding which Oak contract to use for your business:

### PaymentTreasury

Best for: **escrow**, **marketplace**, **service payments**

Funds are held until the platform confirms delivery/service. Supports line items, external fees, batch operations, and refund flows.

- [Healthcare Escrow](escrow/healthcare-escrow.md) — service escrow
- [E-Commerce Marketplace](marketplace/ecommerce-marketplace.md) — product escrow with line items

### TimeConstrainedPaymentTreasury

Best for: **prepayments**, **deposits**, **time-bound commitments**

Same interface as PaymentTreasury, but with on-chain time windows. After the campaign deadline plus the platform claim delay, the platform admin can call `claimExpiredFunds()` to sweep idle balances on-chain (recipients are defined by the contract); align end-customer refunds with your product policy.

- [Automotive Prepayment](prepayment/automotive-prepayment.md) — vehicle deposit with 6-month delivery window

### CampaignInfoFactory + KeepWhatsRaised

Best for: **flexible funding**, **hardware startups**, **ongoing projects**

Like AllOrNothing, creates a campaign with goals and deadlines, but the creator keeps whatever is raised. Supports partial withdrawals (with platform approval), tips, payment gateway fees, and configurable refund delays.

- [Community Project](flexible-funding/community-project.md) — hardware startup with partial withdrawals and tips

### CampaignInfoFactory + AllOrNothing

Best for: **crowdfunding**, **fundraising**, **community-driven projects**

Creates a campaign with a goal and deadline. Pledges mint NFTs. If the goal is met, the creator withdraws. If not, backers get full refunds. Supports reward tiers with physical/digital items.

- [Creative Campaign](crowdfunding/creative-campaign.md) — indie film funding with reward tiers

## Common Patterns Across All Demos

### Simulate Before Send

Every write operation should be simulated first to catch errors without spending gas:

```typescript
await entity.simulate.someMethod(args);   // dry run — reverts throw typed errors
const txHash = await entity.someMethod(args);  // actual transaction
await oak.waitForReceipt(txHash);
```

### Multicall for Dashboard Reads

Batch multiple reads into a single RPC call:

```typescript
const [raised, available, refunded] = await oak.multicall([
  () => treasury.getRaisedAmount(),
  () => treasury.getAvailableRaisedAmount(),
  () => treasury.getRefundedAmount(),
]);
```

### Fee Lifecycle

Fees are always disbursed before withdrawal:

```typescript
await treasury.disburseFees();   // protocol + platform fees distributed
await treasury.withdraw();       // remaining funds to the campaign owner/seller
```

### Signer Flexibility

The SDK supports three levels of signer configuration for different architectures:

```typescript
// Client-level (most common for backends)
const oak = createOakContractsClient({ privateKey: PLATFORM_KEY, ... });

// Per-entity (useful for dApps after wallet connect)
const treasury = oak.paymentTreasury(address, { signer: walletClient });

// Per-call (multi-role systems)
await treasury.confirmPayment(id, buyer, { signer: adminWalletClient });
```

## Related Resources

- [API Reference Examples](../examples/) — executable TypeScript examples organized by contract entity
- [SDK README](../../README.md) — installation, quick start, and full API reference
- [Error Handling Guide](../examples/05-error-handling/) — simulation, typed errors, and safe transaction patterns
- [Advanced Patterns](../examples/06-advanced-patterns/) — multicall, signers, browser wallets, Privy
