# Scenario 6: Advanced Patterns

## The Story

ArtFund has grown. They now manage dozens of active campaigns, multiple treasury contracts, and a growing catalog of physical products that need to be tracked on-chain. Their engineering team needs to optimize for performance and handle complex operational requirements:

- **Performance** — Loading a dashboard that reads data from 10+ contracts should not require 10+ separate RPC calls. They need to batch reads into a single network round-trip.
- **Multi-role operations** — Some operations on the same contract require different signers. For example, the protocol admin disburses fees, but the campaign creator withdraws funds. The SDK needs to support flexible signer resolution.
- **Physical product tracking** — Campaigns that ship physical goods need to register item metadata (dimensions, weight, category) in the ItemRegistry so logistics and customs can be automated.
- **Protocol configuration** — The platform needs to read global and platform-scoped protocol parameters like buffer times, payment expirations, and campaign duration minimums.

## How It Unfolds

1. **Batch multiple reads** into a single RPC call using `oak.multicall()` — read data from GlobalParams and CampaignInfo in one network request
2. **Assign a signer at entity creation time** — useful in browser dApps where the signer is resolved after wallet connection
3. **Override the signer on individual calls** — useful when different roles operate on the same contract
4. **Register physical items** in the ItemRegistry with dimensions, weight, and category — supports single and batch registration
5. **Read protocol configuration** from the data registry — global values and platform-scoped overrides
6. **Look up a transaction receipt** without blocking — useful for webhooks, indexers, and resuming past sessions
7. **Connect a browser wallet** — `createBrowserProvider` and `getSigner` for MetaMask and injected wallet integration (full-config and per-entity patterns)
8. **Connect a Privy wallet** — `createPublicClient` + `createWalletClient` + `custom` transport for Privy embedded wallets

## Files

| Step | File | Description |
| --- | --- | --- |
| 1 | `01-multicall.ts` | Batch multiple read operations into a single RPC call |
| 2 | `02-per-entity-signer.ts` | Assign a signer when creating an entity (browser dApp pattern) |
| 3 | `03-per-call-signer.ts` | Override the signer on individual write calls (multi-role pattern) |
| 4 | `04-item-registry.ts` | Register physical items with dimensions and weight |
| 5 | `05-registry-keys.ts` | Read global and platform-scoped protocol configuration |
| 6 | `06-get-receipt.ts` | Non-blocking receipt lookup for already-mined transactions |
| 7 | `07-browser-wallet.ts` | Browser wallet integration with MetaMask / injected providers |
| 8 | `08-privy-wallet.ts` | Privy embedded wallet integration |
