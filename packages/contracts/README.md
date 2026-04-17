# Oak Contracts SDK

TypeScript SDK for interacting with Oak Network smart contracts. Provides a type-safe client with full read/write access to all Oak protocol contracts.

> Full Documentation: [oaknetwork.org/docs/contracts-sdk/overview](https://oaknetwork.org/docs/contracts-sdk/overview)

## Prerequisites

> **You need deployed contract addresses to use this SDK.**

> The SDK interacts with Oak Network smart contracts that must already be deployed on-chain. To get your contract addresses and sandbox environment access, contact our team at **[support@oaknetwork.org](mailto:support@oaknetwork.org)**.

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

Five config/signer patterns are supported — mix and match as needed:

1. **Simple** — `chainId` + `rpcUrl` + `privateKey` (full read/write)
2. **Read-only** — `chainId` + `rpcUrl`, no private key (reads only, writes throw)
3. **Per-entity signer** — attach a signer when creating an entity
4. **Per-call signer** — pass a signer to individual write/simulate calls
5. **Full (BYO clients)** — pass pre-built viem `PublicClient` / `WalletClient`

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

### Transaction Receipts

The client provides two methods for fetching transaction receipts:

```typescript
// Wait for a pending transaction to be mined (blocking)
const receipt = await oak.waitForReceipt(txHash);
console.log(`Mined in block ${receipt.blockNumber}, gas used: ${receipt.gasUsed}`);

// Look up a receipt for an already-mined transaction (non-blocking)
// Returns null if the transaction hasn't been mined yet
const receipt = await oak.getReceipt(txHash);
if (receipt) {
  console.log(`Block: ${receipt.blockNumber}`);
}
```

Use `waitForReceipt` when you've just sent a transaction and need to block until it's confirmed. Use `getReceipt` when you already have a tx hash (e.g. from a webhook, indexer, or previous session) and want to fetch the receipt without waiting.

---

## Contract Entities

Each entity is created from the client with a deployed contract address. Every entity exposes typed read methods, write methods, a `simulate` namespace, and an `events` namespace.

```typescript
const gp = oak.globalParams("0x...");

// Reads
const admin = await gp.getProtocolAdminAddress();
const fee = await gp.getProtocolFeePercent();
const isListed = await gp.checkIfPlatformIsListed(platformHash);

// Writes
await gp.enlistPlatform(platformHash, adminAddress, feePercent, adapterAddress);
await gp.updateProtocolFeePercent(newFeePercent);

// Simulate (dry-run a write, returns SimulationResult)
const sim = await gp.simulate.enlistPlatform(hash, admin, fee, adapter);

// Events
const logs = await gp.events.getPlatformEnlistedLogs();
const unwatch = gp.events.watchPlatformEnlisted((logs) => { /* ... */ });
```

### Available Entities

| Entity | Factory method | Description | Docs |
| --- | --- | --- | --- |
| **GlobalParams** | `oak.globalParams(addr)` | Protocol-wide config: platforms, fees, currencies, registry | [Docs](https://oaknetwork.org/docs/contracts-sdk/global-params) |
| **CampaignInfoFactory** | `oak.campaignInfoFactory(addr)` | Deploys new CampaignInfo contracts | [Docs](https://oaknetwork.org/docs/contracts-sdk/campaign-info-factory) |
| **CampaignInfo** | `oak.campaignInfo(addr)` | Per-campaign state: deadlines, goals, funding progress | [Docs](https://oaknetwork.org/docs/contracts-sdk/campaign-info) |
| **TreasuryFactory** | `oak.treasuryFactory(addr)` | Deploys and manages treasury implementations | [Docs](https://oaknetwork.org/docs/contracts-sdk/treasury-factory) |
| **PaymentTreasury** | `oak.paymentTreasury(addr)` | Fiat-style payments, confirmations, refunds, withdrawals | [Docs](https://oaknetwork.org/docs/contracts-sdk/payment-treasury) |
| **AllOrNothing** | `oak.allOrNothingTreasury(addr)` | Crowdfunding treasury — funds released only if goal is met | [Docs](https://oaknetwork.org/docs/contracts-sdk/all-or-nothing) |
| **KeepWhatsRaised** | `oak.keepWhatsRaisedTreasury(addr)` | Crowdfunding treasury — creator keeps all funds raised | [Docs](https://oaknetwork.org/docs/contracts-sdk/keep-whats-raised) |
| **ItemRegistry** | `oak.itemRegistry(addr)` | Manages purchasable items with metadata | [Docs](https://oaknetwork.org/docs/contracts-sdk/item-registry) |

> `paymentTreasury()` supports both **PaymentTreasury** and **TimeConstrainedPaymentTreasury** variants — same ABI, same SDK interface.

---

## Simulation & Transaction Preparation

Simulate methods return a `SimulationResult` with the predicted return value and prepared transaction parameters. On revert, a typed SDK error is thrown.

```typescript
const sim = await gp.simulate.enlistPlatform(hash, adminAddr, fee, adapter);
// sim.result   — contract return value
// sim.request  — { to, data, value, gas }
```

For account-abstraction, Safe multisig, or custom signing flows, use `prepareContractWrite` to build raw calldata + gas without sending, or `toPreparedTransaction` to extract params from a `SimulationResult`. All contract ABIs are exported (e.g. `GLOBAL_PARAMS_ABI`, `CAMPAIGN_INFO_ABI`, etc.) for use with these utilities.

> Full simulation and transaction preparation docs: [Simulation](https://oaknetwork.org/docs/contracts-sdk/simulation)

---

## Events

Every entity exposes an `events` namespace with three capabilities: **fetch historical logs** (`get*Logs`), **decode raw logs** (`decodeLog`), and **watch live events** (`watch*`).

```typescript
const gp = oak.globalParams("0x...");

// Fetch historical logs (optionally filter by block range)
const logs = await gp.events.getPlatformEnlistedLogs({ fromBlock: 1_000_000n });

// Decode a raw log from a transaction receipt
const decoded = gp.events.decodeLog({ topics: log.topics, data: log.data });

// Watch live events
const unwatch = gp.events.watchPlatformEnlisted((logs) => {
  for (const log of logs) console.log(log.args);
});
unwatch(); // stop watching
```

> Full event reference for all contracts: [Events](https://oaknetwork.org/docs/contracts-sdk/events)

---

## Error Handling

The SDK decodes on-chain revert data into typed error classes with recovery hints.

```typescript
import { parseContractError, getRevertData } from "@oaknetwork/contracts-sdk";

try {
  await factory.createCampaign({ ... });
} catch (err) {
  const revertData = getRevertData(err);
  const parsed = parseContractError(revertData ?? "");
  if (parsed) {
    console.error(parsed.name, parsed.args, parsed.recoveryHint);
  }
}
```

> Full error handling guide: [Error Handling](https://oaknetwork.org/docs/contracts-sdk/error-handling)

---

## Multicall

Batch multiple read calls into a single RPC round-trip:

```typescript
const gp = oak.globalParams("0x...");
const ci = oak.campaignInfo("0x...");

const [platformCount, goalAmount] = await oak.multicall([
  () => gp.getNumberOfListedPlatforms(),
  () => ci.getGoalAmount(),
]);
```

> Full multicall documentation: [Multicall](https://oaknetwork.org/docs/contracts-sdk/multicall)

---

## Metrics

Pre-built aggregation helpers for platform stats, campaign summaries, and treasury reports. Import from `@oaknetwork/contracts-sdk/metrics`.

> Full metrics documentation: [Metrics](https://oaknetwork.org/docs/contracts-sdk/metrics)

---

## Utility Functions

The SDK exports common helpers with no client dependency: `keccak256`, `toHex`, `parseEther`, `formatEther`, `getCurrentTimestamp`, `addDays`, `getChainFromId`, `createWallet`, `getSigner`, `encodeFunctionData`, `prepareContractWrite`, `toPreparedTransaction`, and more.

```typescript
import { keccak256, toHex, getCurrentTimestamp, addDays } from "@oaknetwork/contracts-sdk";

const platformHash = keccak256(toHex("my-platform"));
const currency = toHex("USD", { size: 32 });
const now = getCurrentTimestamp();
const deadline = addDays(now, 30);
```

> Full utility reference: [Utilities](https://oaknetwork.org/docs/contracts-sdk/utilities)

---

## Exported Entry Points

| Entry point                           | Contents                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| `@oaknetwork/contracts-sdk`           | Everything — client, types, utils, errors, ABI constants                       |
| `@oaknetwork/contracts-sdk/utils`     | Utility functions + `prepareContractWrite` / `toPreparedTransaction`           |
| `@oaknetwork/contracts-sdk/contracts` | Contract entity factories + ABI constants                                      |
| `@oaknetwork/contracts-sdk/client`    | `createOakContractsClient` only                                                |
| `@oaknetwork/contracts-sdk/errors`    | Error classes, `parseContractError`, and `toSimulationResult`                  |
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

- `pnpm build` succeeds
- `pnpm test` passes with >90% coverage
- `pnpm lint` has no errors
- Changeset created with `pnpm changeset`
- Documentation updated if needed

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

Questions? [Open an issue](https://github.com/oak-network/sdk/issues) or contact **[support@oaknetwork.org](mailto:support@oaknetwork.org)**
