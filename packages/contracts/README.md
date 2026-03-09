# @oaknetwork/contracts

TypeScript SDK for interacting with Oak Network smart contracts. Provides a type-safe client with full read/write access to all Oak protocol contracts.

## Installation

```bash
pnpm add @oaknetwork/contracts
```

## Quick Start

```typescript
import { createOakContractsClient, CHAIN_IDS, toHex } from "@oaknetwork/contracts";

const oak = createOakContractsClient({
  chainId:    CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl:     "https://forno.celo-sepolia.celo-testnet.org",
  privateKey: "0x...",
});
```

## Client Configuration

Two config shapes are supported:

### Simple (chainId + rpcUrl + privateKey)

```typescript
const oak = createOakContractsClient({
  chainId:    CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl:     "https://forno.celo-sepolia.celo-testnet.org",
  privateKey: "0x...",
});
```

### Full (bring your own clients)

```typescript
import {
  createOakContractsClient,
  createPublicClient,
  createWalletClient,
  http,
  getChainFromId,
  CHAIN_IDS,
} from "@oaknetwork/contracts";

const chain    = getChainFromId(CHAIN_IDS.CELO_TESTNET_SEPOLIA);
const provider = createPublicClient({ chain, transport: http(RPC_URL) });
const signer   = createWalletClient({ account, chain, transport: http(RPC_URL) });

const oak = createOakContractsClient({ chain, provider, signer });
```

## Supported Chain IDs

```typescript
import { CHAIN_IDS } from "@oaknetwork/contracts";

CHAIN_IDS.ETHEREUM_MAINNET         // 1
CHAIN_IDS.CELO_MAINNET             // 42220
CHAIN_IDS.ETHEREUM_TESTNET_SEPOLIA // 11155111
CHAIN_IDS.ETHEREUM_TESTNET_GOERLI  // 5
CHAIN_IDS.CELO_TESTNET_SEPOLIA     // 11142220
```

## Contracts

### GlobalParams

Protocol-wide configuration registry.

```typescript
const gp = oak.globalParams("0x...");

// Reads
const admin      = await gp.getProtocolAdminAddress();
const fee        = await gp.getProtocolFeePercent();       // bigint bps (e.g. 100 = 1%)
const count      = await gp.getNumberOfListedPlatforms();
const isListed   = await gp.checkIfPlatformIsListed(platformHash);
const platAdmin  = await gp.getPlatformAdminAddress(platformHash);
const platFee    = await gp.getPlatformFeePercent(platformHash);
const delay      = await gp.getPlatformClaimDelay(platformHash);
const adapter    = await gp.getPlatformAdapter(platformHash);
const tokens     = await gp.getTokensForCurrency(currency); // Address[]
const lineItem   = await gp.getPlatformLineItemType(platformHash, typeId);
const value      = await gp.getFromRegistry(key);

// Writes
await gp.enlistPlatform(platformHash, adminAddress, feePercent, adapterAddress);
await gp.delistPlatform(platformHash);
await gp.updatePlatformAdminAddress(platformHash, newAdmin);
await gp.updatePlatformClaimDelay(platformHash, delaySeconds);
await gp.updateProtocolAdminAddress(newAdmin);
await gp.updateProtocolFeePercent(newFeePercent);
await gp.setPlatformAdapter(platformHash, adapterAddress);
await gp.setPlatformLineItemType(platformHash, typeId, label, countsTowardGoal, applyProtocolFee, canRefund, instantTransfer);
await gp.removePlatformLineItemType(platformHash, typeId);
await gp.addTokenToCurrency(currency, tokenAddress);
await gp.removeTokenFromCurrency(currency, tokenAddress);
await gp.addPlatformData(platformHash, platformDataKey);
await gp.removePlatformData(platformHash, platformDataKey);
await gp.addToRegistry(key, value);
await gp.transferOwnership(newOwner);
```

---

### CampaignInfoFactory

Deploys new CampaignInfo contracts.

```typescript
import {
  createOakContractsClient,
  keccak256,
  toHex,
  getCurrentTimestamp,
  addDays,
  CHAIN_IDS,
} from "@oaknetwork/contracts";

const factory = oak.campaignInfoFactory("0x...");

const PLATFORM_HASH  = keccak256(toHex("my-platform"));
const CURRENCY       = toHex("USD", { size: 32 });
const identifierHash = keccak256(toHex("my-campaign-slug"));
const now            = getCurrentTimestamp();

// Reads
const infoAddress = await factory.identifierToCampaignInfo(identifierHash);
const isValid     = await factory.isValidCampaignInfo(infoAddress);

// Writes
const txHash = await factory.createCampaign({
  creator:              "0x...",
  identifierHash,
  selectedPlatformHash: [PLATFORM_HASH],
  campaignData: {
    launchTime: now + 3_600n,              // 1 hour from now
    deadline:   addDays(now, 30),        // 30 days from now
    goalAmount: 1_000_000n,
    currency:   CURRENCY,
  },
  nftName:     "My Campaign NFT",
  nftSymbol:   "MCN",
  nftImageURI: "https://example.com/nft.png",
  contractURI: "https://example.com/contract.json",
});

const receipt        = await oak.waitForReceipt(txHash);
const campaignAddress = await factory.identifierToCampaignInfo(identifierHash);
```

---

### TreasuryFactory

Deploys treasury contracts for a given CampaignInfo.

```typescript
const tf = oak.treasuryFactory("0x...");

// Deploy
const txHash = await tf.deploy(platformHash, infoAddress, implementationId);

// Implementation management
await tf.registerTreasuryImplementation(platformHash, implementationId, implAddress);
await tf.approveTreasuryImplementation(platformHash, implementationId);
await tf.disapproveTreasuryImplementation(implAddress);
await tf.removeTreasuryImplementation(platformHash, implementationId);
```

---

### CampaignInfo

Per-campaign configuration and state.

```typescript
const ci = oak.campaignInfo("0x...");

// Reads
const launchTime    = await ci.getLaunchTime();
const deadline      = await ci.getDeadline();
const goalAmount    = await ci.getGoalAmount();
const currency      = await ci.getCampaignCurrency();
const totalRaised   = await ci.getTotalRaisedAmount();
const available     = await ci.getAvailableRaisedAmount();
const isLocked      = await ci.isLocked();
const isCancelled   = await ci.cancelled();
const config        = await ci.getCampaignConfig();
const tokens        = await ci.getAcceptedTokens();

// Writes
await ci.updateDeadline(newDeadline);
await ci.updateGoalAmount(newGoal);
await ci.pauseCampaign(message);
await ci.unpauseCampaign(message);
await ci.cancelCampaign(message);
```

---

### PaymentTreasury

Handles fiat-style payments via a payment gateway.

```typescript
const pt = oak.paymentTreasury("0x...");

// Reads
const raised    = await pt.getRaisedAmount();
const refunded  = await pt.getRefundedAmount();
const payment   = await pt.getPaymentData(paymentId);

// Writes
const txHash = await pt.createPayment(paymentId, buyerId, itemId, paymentToken, amount, expiration, lineItems, externalFees);
await pt.confirmPayment(paymentId, buyerAddress);
await pt.claimRefund(paymentId, refundAddress);
await pt.claimRefundSelf(paymentId);
await pt.disburseFees();
await pt.withdraw();
await pt.pauseTreasury(message);
await pt.unpauseTreasury(message);
await pt.cancelTreasury(message);
```

---

### AllOrNothing Treasury

Crowdfunding treasury — funds only released if goal is met, otherwise backers can claim refunds.

```typescript
const aon = oak.allOrNothingTreasury("0x...");

// Reads
const raised   = await aon.getRaisedAmount();
const reward   = await aon.getReward(rewardName);

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
const uri   = await aon.tokenURI(tokenId);
await aon.safeTransferFrom(from, to, tokenId);
```

---

### KeepWhatsRaised Treasury

Crowdfunding treasury — creator keeps all funds raised regardless of goal.

```typescript
const kwr = oak.keepWhatsRaisedTreasury("0x...");

// Reads
const raised    = await kwr.getRaisedAmount();
const available = await kwr.getAvailableRaisedAmount();
const reward    = await kwr.getReward(rewardName);

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

---

### ItemRegistry

Manages items available for purchase in campaigns.

```typescript
const ir = oak.itemRegistry("0x...");

// Read
const item = await ir.getItem(ownerAddress, itemId);

// Writes
await ir.addItem(itemId, item);
await ir.addItemsBatch(itemIds, items);
```

---

## Error Handling

Contract revert errors can be decoded into typed SDK errors:

```typescript
import { parseContractError } from "@oaknetwork/contracts";

function handleError(err) {
  // Walk the cause chain to find raw revert data
  let current = err;
  while (current) {
    if (typeof current.data === "string" && current.data.startsWith("0x")) {
      const parsed = parseContractError(current.data);
      if (parsed) {
        console.error("Reverted:", parsed.name);
        console.error("Args:", parsed.args);
        if (parsed.recoveryHint) console.error("Hint:", parsed.recoveryHint);
        return;
      }
    }
    current = current.cause;
  }
  console.error("Unknown error:", err.message);
}

try {
  const txHash = await factory.createCampaign({ ... });
} catch (err) {
  handleError(err);
}
```

Recognized error types:
- `GlobalParams*` — platform/protocol configuration errors
- `CampaignInfoFactory*` — campaign creation errors

---

## Utility Functions

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
} from "@oaknetwork/contracts";

// Hash a string to bytes32
const platformHash = keccak256(toHex("my-platform"));

// Encode string to fixed bytes32
const currency = toHex("USD", { size: 32 });

// Timestamp helpers
const now      = getCurrentTimestamp();          // bigint seconds
const deadline = addDays(now, 30);              // 30 days from now

// Fee calculations (fees are in basis points, 10_000 = 100%)
const feeAmount = (raisedAmount * platformFee) / BPS_DENOMINATOR;

// Browser wallet (frontend)
const chain    = getChainFromId(CHAIN_IDS.CELO_TESTNET_SEPOLIA);
const provider = createBrowserProvider(window.ethereum, chain);
const signer   = await getSigner(window.ethereum, chain);
```

---

## Exported Entry Points

| Entry point                       | Contents                                   |
|-----------------------------------|--------------------------------------------|
| `@oaknetwork/contracts`           | Everything — client, types, utils, errors  |
| `@oaknetwork/contracts/utils`     | Utility functions only (no client)         |
| `@oaknetwork/contracts/contracts` | Contract entity factories only             |
| `@oaknetwork/contracts/client`    | `createOakContractsClient` only            |
| `@oaknetwork/contracts/errors`    | Error classes and `parseContractError` only |

---

## Local Development & Testing

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run smoke test (edit addresses in test-example.mjs first)
node test-example.mjs

# Run unit tests
pnpm test
```

The `test-example.mjs` file at the package root contains runnable examples for all three contract groups (GlobalParams reads, CampaignInfoFactory, TreasuryFactory). Each section can be toggled by uncommenting the relevant block.
