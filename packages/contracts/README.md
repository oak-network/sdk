# Oak Contracts SDK

TypeScript SDK for interacting with Oak Network smart contracts. Provides a type-safe client with full read/write access to all Oak protocol contracts.

> Full Documentation: [oaknetwork.org/docs/contracts-sdk/overview](https://oaknetwork.org/docs/contracts-sdk/overview)

## Prerequisites

> **You need deployed contract addresses to use this SDK.**

> The SDK interacts with Oak Network smart contracts that must already be deployed on-chain. To get your contract addresses and sandbox environment access, contact our team at **support@oaknetwork.org**.

## Installation

```bash
pnpm add @oaknetwork/contracts-sdk
```

```bash
npm install @oaknetwork/contracts-sdk
```

```bash
yarn add @oaknetwork/contracts-sdk
```

**Requirements:** Node.js 18+, TypeScript 5.x recommended.

### Supported Chain IDs

```typescript
import { CHAIN_IDS } from "@oaknetwork/contracts-sdk";

CHAIN_IDS.ETHEREUM_MAINNET; // 1
CHAIN_IDS.CELO_MAINNET; // 42220
CHAIN_IDS.ETHEREUM_TESTNET_SEPOLIA; // 11155111
CHAIN_IDS.ETHEREUM_TESTNET_GOERLI; // 5
CHAIN_IDS.CELO_TESTNET_SEPOLIA; // 11142220
```

> See the full installation documentation here: [oaknetwork.org/docs/contracts-sdk/installation](https://oaknetwork.org/docs/contracts-sdk/installation)

## Quick Start

### Create a client

```typescript
import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: "https://forno.celo-sepolia.celo-testnet.org",
  privateKey: "0x...",
});
```

See the full [Quickstart](https://oaknetwork.org/docs/contracts-sdk/quickstart) guide for a step-by-step walkthrough.

## Client Configuration

Four config/signer patterns are supported. Mix and match as needed.

### Pattern 1 — Simple (chainId + rpcUrl + privateKey)

Full read/write access using a raw private key. Suitable for backend services and scripts.

```typescript
const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: "https://forno.celo-sepolia.celo-testnet.org",
  privateKey: "0x...", // 0x-prefixed 32-byte hex string
});

const gp = oak.globalParams("0x...");
const admin = await gp.getProtocolAdminAddress(); // read
await gp.enlistPlatform(hash, adminAddr, fee, adapter); // write — uses client key
```

### Pattern 2 — Read-only (chainId + rpcUrl, no privateKey)

No private key required. All read methods work normally; write methods throw `"No signer configured"` immediately — no RPC call is made.

```typescript
const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: "https://forno.celo-sepolia.celo-testnet.org",
});

const gp = oak.globalParams("0x...");
const admin = await gp.getProtocolAdminAddress(); // reads work fine
await gp.transferOwnership("0x..."); // throws "No signer configured"
```

### Pattern 3 — Per-entity signer override

Supply a signer when creating an entity. Every write/simulate call on that entity uses the provided signer — no need to pass it again per call. Designed for browser wallets (MetaMask, Privy, etc.) where the signer is resolved after the client is created.

```typescript
import {
  createOakContractsClient,
  createWallet,
  CHAIN_IDS,
} from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: "https://forno.celo-sepolia.celo-testnet.org",
});

// Resolve signer after wallet connect
const signer = createWallet(privateKey, rpcUrl, oak.config.chain);
// or: const signer = await getSigner(window.ethereum, oak.config.chain);

// All write/simulate calls on gp automatically use signer
const gp = oak.globalParams("0x...", { signer });
const admin = await gp.getProtocolAdminAddress(); // read
await gp.simulate.enlistPlatform(hash, addr, fee, adapter); // simulate — uses signer
await gp.enlistPlatform(hash, addr, fee, adapter); // write — uses signer
```

### Pattern 4 — Per-call signer override

Supply a different signer for a single write or simulate call. The entity itself has no fixed signer; the override is passed as the last optional argument. Useful when different operations on the same contract require different signers (e.g. multi-sig flows, role switching).

```typescript
const gp = oak.globalParams("0x..."); // no entity-level signer

// Read — no signer needed
const admin = await gp.getProtocolAdminAddress();

// Write/simulate — inject signer only for this one call
await gp.simulate.enlistPlatform(hash, addr, fee, adapter, { signer });
await gp.enlistPlatform(hash, addr, fee, adapter, { signer });

// Different call, different signer
await gp.transferOwnership(newOwner, { signer: anotherWallet });

// No override → throws "No signer configured"
await gp.delistPlatform(hash); // throws if no client/entity signer set
```

### Pattern 5 — Full (bring your own clients)

Pass pre-built viem `PublicClient` and `WalletClient` directly. Useful for advanced configurations (custom transports, account abstraction, etc.).

```typescript
import {
  createOakContractsClient,
  createPublicClient,
  createWalletClient,
  http,
  getChainFromId,
  CHAIN_IDS,
} from "@oaknetwork/contracts-sdk";

const chain = getChainFromId(CHAIN_IDS.CELO_TESTNET_SEPOLIA);
const provider = createPublicClient({ chain, transport: http(RPC_URL) });
const signer = createWalletClient({ account, chain, transport: http(RPC_URL) });

const oak = createOakContractsClient({ chain, provider, signer });
```

### Signer resolution priority

When a write or simulate method is called, the signer is resolved in this order:

1. **Per-call** `options.signer` — highest priority
2. **Per-entity** `signer` passed to the entity factory method
3. **Client-level** `walletClient` from `createOakContractsClient`
4. **Throws** `"No signer configured"` if none of the above is set

> For a detailed step-by-step guide, please refer to the complete [Client Configuration](https://oaknetwork.org/docs/contracts-sdk/client) documentation.

## Contract Entities

### GlobalParams

Protocol-wide configuration registry. Manages platform listings, fee settings, token currencies, line item types, and a general-purpose key-value registry.

```typescript
const gp = oak.globalParams("0x...");

// Reads
const admin = await gp.getProtocolAdminAddress();
const fee = await gp.getProtocolFeePercent(); // bigint bps (e.g. 100 = 1%)
const count = await gp.getNumberOfListedPlatforms();
const isListed = await gp.checkIfPlatformIsListed(platformHash);
const platAdmin = await gp.getPlatformAdminAddress(platformHash);
const platFee = await gp.getPlatformFeePercent(platformHash);
const delay = await gp.getPlatformClaimDelay(platformHash);
const adapter = await gp.getPlatformAdapter(platformHash);
const tokens = await gp.getTokensForCurrency(currency); // Address[]
const lineItem = await gp.getPlatformLineItemType(platformHash, typeId);
const value = await gp.getFromRegistry(key);

// Writes
await gp.enlistPlatform(platformHash, adminAddress, feePercent, adapterAddress);
await gp.delistPlatform(platformHash);
await gp.updatePlatformAdminAddress(platformHash, newAdmin);
await gp.updatePlatformClaimDelay(platformHash, delaySeconds);
await gp.updateProtocolAdminAddress(newAdmin);
await gp.updateProtocolFeePercent(newFeePercent);
await gp.setPlatformAdapter(platformHash, adapterAddress);
await gp.setPlatformLineItemType(
  platformHash,
  typeId,
  label,
  countsTowardGoal,
  applyProtocolFee,
  canRefund,
  instantTransfer,
);
await gp.removePlatformLineItemType(platformHash, typeId);
await gp.addTokenToCurrency(currency, tokenAddress);
await gp.removeTokenFromCurrency(currency, tokenAddress);
await gp.addPlatformData(platformHash, platformDataKey);
await gp.removePlatformData(platformHash, platformDataKey);
await gp.addToRegistry(key, value);
await gp.transferOwnership(newOwner);
```

> For complete details on the Global Params contract entity, please visit the following link: [Global Params](https://oaknetwork.org/docs/contracts-sdk/global-params).

---

### CampaignInfoFactory

Deploys new CampaignInfo contracts. Each campaign gets its own on-chain CampaignInfo instance with its own address, NFT collection, and configuration.

```typescript
import {
  createOakContractsClient,
  keccak256,
  toHex,
  getCurrentTimestamp,
  addDays,
  CHAIN_IDS,
} from "@oaknetwork/contracts-sdk";

const factory = oak.campaignInfoFactory("0x...");

const PLATFORM_HASH = keccak256(toHex("my-platform"));
const CURRENCY = toHex("USD", { size: 32 });
const identifierHash = keccak256(toHex("my-campaign-slug"));
const now = getCurrentTimestamp();

// Reads
const infoAddress = await factory.identifierToCampaignInfo(identifierHash);
const isValid = await factory.isValidCampaignInfo(infoAddress);

// Writes
const txHash = await factory.createCampaign({
  creator: "0x...",
  identifierHash,
  selectedPlatformHash: [PLATFORM_HASH],
  campaignData: {
    launchTime: now + 3_600n, // 1 hour from now
    deadline: addDays(now, 30), // 30 days from now
    goalAmount: 1_000_000n,
    currency: CURRENCY,
  },
  nftName: "My Campaign NFT",
  nftSymbol: "MCN",
  nftImageURI: "https://example.com/nft.png",
  contractURI: "https://example.com/contract.json",
});

const receipt = await oak.waitForReceipt(txHash);
const campaignAddress = await factory.identifierToCampaignInfo(identifierHash);
```

> For complete details on the Campaign Info Factory contract entity, please visit the following link: [Campaign Info Factory](https://oaknetwork.org/docs/contracts-sdk/campaign-info-factory).

---

### CampaignInfo

Per-campaign configuration and state. Each campaign deployed via the CampaignInfoFactory gets its own CampaignInfo contract that tracks funding progress, accepted tokens, platform settings, and NFT pledge records.

```typescript
const ci = oak.campaignInfo("0x...");

// Reads
const launchTime = await ci.getLaunchTime();
const deadline = await ci.getDeadline();
const goalAmount = await ci.getGoalAmount();
const currency = await ci.getCampaignCurrency();
const totalRaised = await ci.getTotalRaisedAmount();
const available = await ci.getTotalAvailableRaisedAmount();
const isLocked = await ci.isLocked();
const isCancelled = await ci.cancelled();
const config = await ci.getCampaignConfig();
const tokens = await ci.getAcceptedTokens();

// Writes
await ci.updateDeadline(newDeadline);
await ci.updateGoalAmount(newGoal);
await ci.pauseCampaign(message);
await ci.unpauseCampaign(message);
await ci.cancelCampaign(message);
```

> For complete details on the Campaign Info contract entity, please visit the following link: [Campaign Info](https://oaknetwork.org/docs/contracts-sdk/campaign-info).

---

### TreasuryFactory

Deploys treasury contracts for a given CampaignInfo. Manages treasury implementations that platforms can register, approve, and deploy.

```typescript
const tf = oak.treasuryFactory("0x...");

// Deploy
const txHash = await tf.deploy(platformHash, infoAddress, implementationId);

// Implementation management
await tf.registerTreasuryImplementation(
  platformHash,
  implementationId,
  implAddress,
);
await tf.approveTreasuryImplementation(platformHash, implementationId);
await tf.disapproveTreasuryImplementation(implAddress);
await tf.removeTreasuryImplementation(platformHash, implementationId);
```

> For complete details on the Treasury Factory contract entity, please visit the following link: [Treasury Factory](https://oaknetwork.org/docs/contracts-sdk/treasury-factory).

---

### PaymentTreasury

Handles fiat-style payments via a payment gateway. Manages payment creation, confirmation, refunds, fee disbursement, and fund withdrawal for campaigns.

> **Two treasury variants, one SDK method.** The `paymentTreasury()` method works with both on-chain implementations:
>
> | Variant                            | Description                                                                                                                                                                                                                                          |
> | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | **PaymentTreasury**                | Standard payment treasury with no time restrictions. Payments can be created, confirmed, and refunded at any time while the treasury is active.                                                                                                      |
> | **TimeConstrainedPaymentTreasury** | Time-constrained variant that enforces launch-time and deadline windows on-chain. Payments can only be created within the campaign window (launch → deadline + buffer). Refunds, withdrawals, and fee disbursements are only available after launch. |
>
> Both contracts share the same ABI and the same SDK interface. Time enforcement is handled entirely on-chain — simply pass the deployed contract address regardless of which variant was deployed:

```typescript
// Works for both PaymentTreasury and TimeConstrainedPaymentTreasury
const pt = oak.paymentTreasury("0x...");

// Reads
const raised = await pt.getRaisedAmount();
const refunded = await pt.getRefundedAmount();
const payment = await pt.getPaymentData(paymentId);

// Writes
const txHash = await pt.createPayment(
  paymentId,
  buyerId,
  itemId,
  paymentToken,
  amount,
  expiration,
  lineItems,
  externalFees,
);
await pt.confirmPayment(paymentId, buyerAddress);
await pt.claimRefund(paymentId, refundAddress);
await pt.claimRefundSelf(paymentId);
await pt.disburseFees();
await pt.withdraw();
await pt.pauseTreasury(message);
await pt.unpauseTreasury(message);
await pt.cancelTreasury(message);
```

> **Note:** When using a `TimeConstrainedPaymentTreasury`, calls made outside the allowed time window will revert on-chain. For example, `createPayment()` will revert if called before launch or after the deadline + buffer period.

> For complete details on the Payment Treasury contract entity, please visit the following link: [Payment Treasury](https://oaknetwork.org/docs/contracts-sdk/payment-treasury).

---

### AllOrNothing Treasury

Crowdfunding treasury where funds are only released if the campaign goal is met. If the goal is not reached, backers can claim full refunds. Includes ERC-721 pledge NFTs.

```typescript
const aon = oak.allOrNothingTreasury("0x...");

// Reads
const raised = await aon.getRaisedAmount();
const reward = await aon.getReward(rewardName);

// Writes
await aon.addRewards(rewardNames, rewards);
await aon.pledgeForAReward(backer, pledgeToken, shippingFee, rewardNames);
await aon.pledgeWithoutAReward(backer, pledgeToken, pledgeAmount);
await aon.claimRefund(tokenId);
await aon.disburseFees();
await aon.withdraw();
await aon.pauseTreasury(message);
await aon.unpauseTreasury(message);
await aon.cancelTreasury(message);

// ERC-721
const owner = await aon.ownerOf(tokenId);
const uri = await aon.tokenURI(tokenId);
await aon.safeTransferFrom(from, to, tokenId);
```

> For complete details on the AllOrNothing Treasury contract entity, please visit the following link: [AllOrNothing Treasury](https://oaknetwork.org/docs/contracts-sdk/all-or-nothing).

---

### KeepWhatsRaised Treasury

Crowdfunding treasury where the creator keeps all funds raised regardless of whether the goal is met. Includes configurable fee structures, withdrawal delays, and ERC-721 pledge NFTs.

```typescript
const kwr = oak.keepWhatsRaisedTreasury("0x...");

// Reads
const raised = await kwr.getRaisedAmount();
const available = await kwr.getAvailableRaisedAmount();
const reward = await kwr.getReward(rewardName);

// Writes
await kwr.configureTreasury(config, campaignData, feeKeys, feeValues);
await kwr.addRewards(rewardNames, rewards);
await kwr.pledgeForAReward(pledgeId, backer, token, tip, rewardNames);
await kwr.pledgeWithoutAReward(pledgeId, backer, token, amount, tip);
await kwr.approveWithdrawal();
await kwr.claimFund();
await kwr.claimTip();
await kwr.claimRefund(tokenId);
await kwr.disburseFees();
await kwr.withdraw(token, amount);
await kwr.pauseTreasury(message);
await kwr.unpauseTreasury(message);
await kwr.cancelTreasury(message);
```

> For complete details on the KeepWhatsRaised Treasury contract entity, please visit the following link: [KeepWhatsRaised Treasury](https://oaknetwork.org/docs/contracts-sdk/keep-whats-raised).

---

### ItemRegistry

Manages items available for purchase in campaigns. Items represent physical goods with dimensions, weight, and category metadata.

```typescript
const ir = oak.itemRegistry("0x...");

// Read
const item = await ir.getItem(ownerAddress, itemId);

// Writes
await ir.addItem(itemId, item);
await ir.addItemsBatch(itemIds, items);
```

> For complete details on the Item Registry contract entity, please visit the following link: [Item Registry](https://oaknetwork.org/docs/contracts-sdk/item-registry).

---

## Error Handling

Contract calls can revert with on-chain errors. The SDK decodes raw revert data into typed error classes with decoded arguments and human-readable recovery hints.

### Decoding revert errors:

```typescript
import { parseContractError, getRevertData } from "@oaknetwork/contracts-sdk";

function handleError(err) {
  // If the error is already a typed SDK error (thrown by simulate methods)
  if (typeof err?.recoveryHint === "string") {
    console.error("Reverted:", err.name);
    console.error("Args:", err.args);
    console.error("Hint:", err.recoveryHint);
    return;
  }
  // Otherwise extract raw revert hex from the viem error chain and decode it
  const revertData = getRevertData(err);
  const parsed = parseContractError(revertData ?? "");
  if (parsed) {
    console.error("Reverted:", parsed.name);
    console.error("Args:", parsed.args);
    if (parsed.recoveryHint) console.error("Hint:", parsed.recoveryHint);
    return;
  }
  console.error("Unknown error:", err.message);
}

try {
  const txHash = await factory.createCampaign({ ... });
} catch (err) {
  handleError(err);
}
```

> See the full error handling guidelines here: [Error handling](https://oaknetwork.org/docs/contracts-sdk/error-handling)

---

## Utility Functions

The SDK exports pure utility functions and constants that have no client dependency. Import them from @oaknetwork/contracts-sdk or @oaknetwork/contracts-sdk/utils.

```typescript
import {
  keccak256,
  id,
  toHex,
  stringToHex,
  parseEther,
  formatEther,
  parseUnits,
  isAddress,
  getAddress,
  getCurrentTimestamp,
  addDays,
  getChainFromId,
  createJsonRpcProvider,
  createWallet,
  createBrowserProvider,
  getSigner,
  CHAIN_IDS,
  BPS_DENOMINATOR,
  BYTES32_ZERO,
  DATA_REGISTRY_KEYS,
  scopedToPlatform,
} from "@oaknetwork/contracts-sdk";

// Hash a string to bytes32
const platformHash = keccak256(toHex("my-platform"));

// Encode string to fixed bytes32
const currency = toHex("USD", { size: 32 });

// Timestamp helpers
const now = getCurrentTimestamp(); // bigint seconds
const deadline = addDays(now, 30); // 30 days from now

// Fee calculations (fees are in basis points, 10_000 = 100%)
const feeAmount = (raisedAmount * platformFee) / BPS_DENOMINATOR;

// Browser wallet (frontend)
const chain = getChainFromId(CHAIN_IDS.CELO_TESTNET_SEPOLIA);
const provider = createBrowserProvider(window.ethereum, chain);
const signer = await getSigner(window.ethereum, chain);
```

For complete guidelines on utility functions, please refer to the following link: [Utility Functions](https://oaknetwork.org/docs/contracts-sdk/utilities).

---

## Exported Entry Points

| Entry point                       | Contents                                    |
| --------------------------------- | ------------------------------------------- |
| `@oaknetwork/contracts-sdk`           | Everything — client, types, utils, errors   |
| `@oaknetwork/contracts-sdk/utils`     | Utility functions only (no client)          |
| `@oaknetwork/contracts-sdk/contracts` | Contract entity factories only              |
| `@oaknetwork/contracts-sdk/client`    | `createOakContractsClient` only             |
| `@oaknetwork/contracts-sdk/errors`    | Error classes and `parseContractError` only |
| `@oaknetwork/contracts-sdk/metrics`   | Platform, campaign, and treasury reporting helpers (not re-exported from root) |

---

## Local Development & Testing

### Install dependencies

```bash
pnpm install
```

### Build

```bash
pnpm build
```

**Do not** use npm or yarn. The repository enforces pnpm >= 10.0.0.

### Running tests

```bash
pnpm test:unit          # Unit tests
pnpm test:integration   # Integration tests (requires credentials)
pnpm test:all           # All tests with coverage
pnpm test:watch         # Watch mode
```

---

## Changesets Workflow

We use [Changesets](https://github.com/changesets/changesets) to manage versions and changelogs:

1. After making changes, run `pnpm changeset`
2. Select impact (**Major** / **Minor** / **Patch**) for affected packages
3. Commit the generated file in `.changeset/`
4. CI automatically calculates versions, generates changelogs, and creates a release PR

---

## Development Guidelines

See [CLAUDE.md](../../CLAUDE.md) for coding standards including architecture principles, security rules, testing requirements, and anti-patterns.

---

### Code review checklist

- [ ] `pnpm build` succeeds
- [ ] `pnpm test` passes with >90% coverage
- [ ] `pnpm lint` has no errors
- [ ] Changeset created with `pnpm changeset`
- [ ] Documentation updated if needed

---

## Documentation

- [Full docs](https://oaknetwork.org/docs/contracts-sdk/overview) — oaknetwork.org/docs/contracts-sdk/overview
- [Quickstart](https://oaknetwork.org/docs/contracts-sdk/quickstart) — oaknetwork.org/docs/contracts-sdk/quickstart
- [Monorepo README](../../README.md) — README.md
- [Changelog](./CHANGELOG.md) — CHANGELOG.md

---

## License

[MIT](../../LICENSE)

## Security

[Security Policy](../../SECURITY.md)

---

## Links

- [Oak Network](https://oaknetwork.org)
- [Documentation](https://oaknetwork.org/docs/contracts-sdk/overview)
- [GitHub](https://github.com/oak-network/sdk)
- [Issues](https://github.com/oak-network/sdk/issues)
- [npm](https://www.npmjs.com/package/@oaknetwork/contracts-sdk)

Questions? [Open an issue](https://github.com/oak-network/sdk/issues) or contact **support@oaknetwork.org**
