# Scenario 0: Platform Enlistment

## The Story

**NovaPay** is a digital marketplace that helps independent sellers accept payments online. They want to integrate Oak Protocol to offer their merchants on-chain payment processing and crowdfunding capabilities. Before any campaign can be created or treasury deployed on their platform, NovaPay must first be **enlisted as a platform** on the protocol.

Platform enlistment is a coordinated process between two roles:

- The **Protocol Admin** (the Oak Network team) — who governs the GlobalParams contract and must approve every new platform joining the protocol
- The **Platform Admin** (NovaPay's operations wallet) — who will manage the platform's day-to-day configuration once enlisted, such as treasury registration, fee settings, and payment operations

There is no self-service signup. NovaPay contacts the Oak support team, provides their admin wallet address, and agrees on a fee structure. The Protocol Admin then records the enlistment on-chain in a single transaction.

Once enlisted, NovaPay registers the treasury implementation contracts they want to use. A platform can register as many or as few treasury models as they need — even a single model is enough to get started. Each registration enters a "pending" state and must be explicitly approved by the Protocol Admin before it can be used to deploy treasuries.

## How It Unfolds

1. **Protocol Admin** enlists NovaPay by calling `enlistPlatform` on GlobalParams — this sets the platform hash, admin address, fee percent, and adapter in one transaction
2. **Anyone** can verify the enlistment by reading back the on-chain state: is the platform listed, who is the admin, what is the fee percent
3. **Platform Admin (NovaPay)** registers a treasury implementation on TreasuryFactory — one call per implementation slot. A platform only needs to register the models they plan to use
4. **Protocol Admin** approves the registered implementation — only approved implementations can be used to deploy treasuries
5. **Platform Admin (NovaPay)** runs a final verification to confirm every piece of the onboarding is in place
6. **Platform Admin (NovaPay)** — optionally — configures additional features like line item types, claim delay, platform data keys, or a meta-transaction adapter. These are all collected in a single reference file

## Platform Hash

Every platform on Oak Protocol is identified by a `bytes32` value called the **platform hash**. It is the `keccak256` hash of the platform name and remains fixed for the lifetime of the platform. It is used everywhere — in GlobalParams, TreasuryFactory, and every campaign created on the platform.

```typescript
const platformHash = keccak256(toHex("NOVAPAY"));
```

## Implementation ID Layout

Each platform maintains its own mapping of implementation ID to treasury contract inside TreasuryFactory. The implementation ID is a numeric slot that you choose when registering. The same ID is used when deploying a treasury from that slot. Register only the models your platform needs:

| Implementation ID | Treasury Model | Use Case |
| --- | --- | --- |
| `0n` | AllOrNothing | Crowdfunding — backers get a full refund if the goal is not met |
| `1n` | KeepWhatsRaised | Crowdfunding — the creator keeps whatever is raised, even if the goal is not met |
| `2n` | PaymentTreasury | E-commerce — structured payments with no time restrictions |
| `3n` | TimeConstrainedPaymentTreasury | E-commerce — same as PaymentTreasury but enforces launch time and deadline on-chain (flash deals, seasonal storefronts) |

> **PaymentTreasury vs. TimeConstrainedPaymentTreasury:** Both share the same SDK interface — `oak.paymentTreasury(address)`. The only difference is at registration time: you register a different implementation contract address. The time constraints are enforced transparently by the smart contract. See the [Payment Treasury README](../03-campaign-payment-treasury/README.md) for details.

## Optional Configuration (Step 6)

After the core onboarding, a platform can configure additional features. These are all optional and independent — skip any you don't need. They are documented in `06-optional-configuration.ts`:

| Section | Feature | Who Calls | Applies To | Description |
| --- | --- | --- | --- | --- |
| A | Line Item Types | Platform Admin | PaymentTreasury only | Define how payment components are categorized (+ remove a type) |
| B | Claim Delay | Platform Admin | PaymentTreasury only | Set a buyer-protection window after a treasury's deadline |
| C | Platform Data Keys | Platform Admin | All treasury types | Register/remove custom metadata fields for campaigns |
| D | Platform Adapter | Protocol Admin | All treasury types | Enable gasless meta-transactions via an ERC-2771 trusted forwarder |
| E | Protocol Admin Functions | Protocol Admin | Protocol-wide | Currency/token management, data registry, delisting, fee/admin updates |

## Files

| Step | File | Role | Description |
| --- | --- | --- | --- |
| 1 | `01-enlist-platform.ts` | Protocol Admin | Enlist NovaPay with admin address, fee percent, and adapter |
| 2 | `02-verify-enlistment.ts` | Anyone | Read back on-chain state to confirm the enlistment |
| 3 | `03-register-treasury-implementations.ts` | Platform Admin | Register a treasury implementation on TreasuryFactory |
| 4 | `04-approve-implementations.ts` | Protocol Admin | Approve the registered implementation for use |
| 5 | `05-verify-setup.ts` | Platform Admin | Run a final check to confirm everything is live |
| 6 | `06-optional-configuration.ts` | Platform Admin / Protocol Admin | All optional configuration — line items, claim delay, data keys, adapter, protocol admin functions |

## Role Reference (from the Smart Contract)

| Function | Who can call | Contract modifier |
| --- | --- | --- |
| `enlistPlatform` | Protocol Admin | `onlyOwner` |
| `delistPlatform` | Protocol Admin | `onlyOwner` |
| `updatePlatformAdminAddress` | Protocol Admin | `onlyOwner` |
| `updateProtocolAdminAddress` | Protocol Admin | `onlyOwner` |
| `updateProtocolFeePercent` | Protocol Admin | `onlyOwner` |
| `addTokenToCurrency` / `removeTokenFromCurrency` | Protocol Admin | `onlyOwner` |
| `addToRegistry` | Protocol Admin | `onlyOwner` |
| `setPlatformAdapter` | Protocol Admin | `onlyOwner` |
| `setPlatformLineItemType` / `removePlatformLineItemType` | Platform Admin | `onlyPlatformAdmin` |
| `updatePlatformClaimDelay` | Platform Admin | `onlyPlatformAdmin` |
| `addPlatformData` / `removePlatformData` | Platform Admin | `onlyPlatformAdmin` |
| All `get*` / `check*` reads | Anyone | (read-only) |
