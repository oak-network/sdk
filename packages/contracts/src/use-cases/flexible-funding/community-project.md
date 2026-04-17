# Flexible Funding — TechForge

## The Business

**TechForge** is a technology platform that helps hardware startups raise funds from their community. Unlike all-or-nothing crowdfunding, TechForge uses a **keep-what's-raised** model: creators keep whatever they raise, even if they don't hit their goal. This works well for hardware projects where any amount of funding helps move the project forward.

TechForge also lets backers add **tips** to their pledges, charges **payment gateway fees** on each pledge, and allows creators to make **partial withdrawals** during the campaign (with platform approval) to cover manufacturing costs before the deadline. Tips are collected by the platform via `claimTip` and sent to the configured **platform tip recipient**.

## Why Oak?

TechForge needs:

- **Flexible funding** — creators keep whatever is raised, no all-or-nothing threshold
- **Partial withdrawals** — creators can withdraw funds mid-campaign with platform approval
- **Tips** — backers can tip on top of their pledge; tips are claimable separately
- **Payment gateway fees** — per-pledge fees recorded on-chain for transparent accounting
- **Configurable fee structure** — flat fees, percentage fees, and cumulative fee caps
- **Refund delay** — backers can refund, but only after a configurable delay period post-deadline
- **Reward tiers** — like all-or-nothing, but with the flexibility of partial delivery

## Oak Contracts Used

| Contract | Purpose |
|----------|---------|
| **CampaignInfoFactory** | Creates campaign instances with metadata, goal, and deadline |
| **CampaignInfo** | Stores campaign state, pledge NFTs, platform/fee configuration |
| **TreasuryFactory** | Deploys the KeepWhatsRaised treasury for the campaign |
| **KeepWhatsRaised** | Holds pledged funds; supports partial withdrawals, tips, configurable fees |

## Multi-token support

Campaigns accept a **whitelist of ERC-20s** resolved from the campaign **currency**; each pledge and withdrawal names **`pledgeToken` / `token`** explicitly, and the treasury enforces **`isTokenAccepted`**. Balances, tips, gateway fees, and withdrawals are tracked **per token contract** (each token’s decimals). Examples below use **USDC**; TechForge can enable additional accepted tokens the same way—**`GlobalParams`** maintains **`currencyToTokens`** (`initialize`, then **`addTokenToCurrency`** / **`removeTokenFromCurrency`**); **`campaign.getAcceptedTokens()`** lists what a given campaign accepts after creation.

## How KeepWhatsRaised Differs from AllOrNothing

| Feature | AllOrNothing | KeepWhatsRaised |
|---------|-------------|-----------------|
| Funding outcome | Goal met = creator gets funds; goal not met = full refund | Creator keeps whatever is raised |
| Partial withdrawals | Not supported | Supported with platform approval |
| Tips | Not supported | Backers can tip; platform claims tips separately |
| Payment gateway fees | Not supported | Per-pledge fee tracking via `setPaymentGatewayFee` |
| Treasury configuration | Not needed | Required — delays, refund policy, fee structure |
| Refund timing | Immediate after deadline (if goal not met) | After deadline + configurable refund delay |
| Withdrawal approval | Not needed | Platform must call `approveWithdrawal` first |
| Fund claiming | `withdraw()` by anyone | `claimFund()` by platform after claim delay |

## Roles

| Role | Who | Actions |
|------|-----|---------|
| Platform Admin | TechForge backend | Configures treasury, approves withdrawals, claims tips/funds |
| Creator | Lena (hardware startup founder) | Creates campaign, adds rewards, withdraws approved amounts |
| Backer | Community supporters | Pledges with/without rewards, can tip, claims refund after delay |

## Integration Flow

### Step 1: Create the campaign

Lena wants to fund her open-source IoT sensor kit. She needs $15,000 ideally but any amount helps. TechForge creates the campaign on-chain.

```typescript
import {
  createOakContractsClient, CHAIN_IDS, toHex, keccak256,
} from "@oaknetwork/contracts-sdk";
import type { CreateCampaignParams } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL,
  privateKey: process.env.PLATFORM_PRIVATE_KEY as `0x${string}`,
});

const factory = oak.campaignInfoFactory(CAMPAIGN_INFO_FACTORY_ADDRESS);

const platformHash = keccak256(toHex("TechForge"));
const identifierHash = keccak256(toHex("iot-sensor-kit-2026"));
const now = BigInt(Math.floor(Date.now() / 1000));

const params: CreateCampaignParams = {
  creator: LENA_WALLET_ADDRESS,
  identifierHash,
  selectedPlatformHash: [platformHash],
  campaignData: {
    launchTime: now,
    deadline: now + BigInt(45 * 86400),            // 45 days
    goalAmount: 15_000_000000n,                       // 15,000 USDC (6 decimals)
    currency: toHex("USD", { size: 32 }),
  },
  nftName: "IoT Sensor Kit Backers",
  nftSymbol: "IOTSK",
  nftImageURI: "ipfs://QmSensorKitImage",
  contractURI: "ipfs://QmSensorKitMetadata",
};

await factory.simulate.createCampaign(params);
const txHash = await factory.createCampaign(params);
await oak.waitForReceipt(txHash);
```

### Step 2: Deploy the KeepWhatsRaised treasury

TechForge deploys a KWR treasury for Lena's campaign. Implementation ID `1` = KeepWhatsRaised.

```typescript
const treasuryFactory = oak.treasuryFactory(TREASURY_FACTORY_ADDRESS);

// Implementation ID 1 = KeepWhatsRaised
const txHash = await treasuryFactory.deploy(
  platformHash, campaignInfoAddress, 1n,
);
await oak.waitForReceipt(txHash);

const kwrTreasury = oak.keepWhatsRaisedTreasury(DEPLOYED_KWR_ADDRESS);
```

### Step 3: Configure the treasury

This is **unique to KeepWhatsRaised** — the platform must configure delays, refund policy, and fee structure before the treasury is operational.

```typescript
import type {
  KeepWhatsRaisedConfig, KeepWhatsRaisedFeeKeys, KeepWhatsRaisedFeeValues,
} from "@oaknetwork/contracts-sdk";

const config: KeepWhatsRaisedConfig = {
  minimumWithdrawalForFeeExemption: 5_000_000000n,  // No flat fee on withdrawals > 5,000 USDC
  withdrawalDelay: BigInt(3 * 86400),                 // 3-day delay after approval
  refundDelay: BigInt(14 * 86400),                    // Backers can refund 14 days after deadline
  configLockPeriod: BigInt(7 * 86400),                // Config locked for 7 days after setting
  isColombianCreator: false,
};

const campaignData = {
  launchTime: now,
  deadline: now + BigInt(45 * 86400),
  goalAmount: 15_000_000000n,                         // 15,000 USDC (6 decimals)
  currency: toHex("USD", { size: 32 }),
};

const feeKeys: KeepWhatsRaisedFeeKeys = {
  flatFeeKey: toHex("flat-withdrawal-fee", { size: 32 }),
  cumulativeFlatFeeKey: toHex("cumulative-flat-fee-cap", { size: 32 }),
  grossPercentageFeeKeys: [
    toHex("gross-fee-tier-1", { size: 32 }),
  ],
};

const feeValues: KeepWhatsRaisedFeeValues = {
  flatFeeValue: 10_000000n,              // 10 USDC flat fee per withdrawal
  cumulativeFlatFeeValue: 50_000000n,    // 50 USDC lifetime cap on flat fees
  grossPercentageFeeValues: [250n],       // 2.5% gross percentage fee
};

await kwrTreasury.simulate.configureTreasury(config, campaignData, feeKeys, feeValues);
const txHash = await kwrTreasury.configureTreasury(config, campaignData, feeKeys, feeValues);
await oak.waitForReceipt(txHash);
```

### Step 4: Add reward tiers

Lena defines two reward tiers.

```typescript
import type { TieredReward } from "@oaknetwork/contracts-sdk";

const rewardNames = [
  toHex("early-bird-kit", { size: 32 }),
  toHex("developer-bundle", { size: 32 }),
];

const rewards: TieredReward[] = [
  {
    rewardValue: 50_000000n,                // Minimum 50 USDC (6 decimals)
    isRewardTier: true,
    itemId: [toHex("sensor-kit-v1", { size: 32 })],
    itemValue: [40_000000n],
    itemQuantity: [1n],
  },
  {
    rewardValue: 150_000000n,               // Minimum 150 USDC
    isRewardTier: true,
    itemId: [
      toHex("sensor-kit-v1", { size: 32 }),
      toHex("dev-board-pro", { size: 32 }),
    ],
    itemValue: [40_000000n, 80_000000n],
    itemQuantity: [2n, 1n],
  },
];

const txHash = await kwrTreasury.addRewards(rewardNames, rewards);
await oak.waitForReceipt(txHash);
```

### Step 5: Backers pledge with tips

Backers pledge to Lena's campaign. KWR supports **tips** (on top of the pledge), which go directly to the platform.

**Pledge with a reward and a tip:**

> **Role: Any caller (backer)** — `pledgeForAReward` is permissionless but time-gated (must be within the campaign window).

```typescript
const pledgeId = toHex("pledge-001", { size: 32 });

const txHash = await kwrTreasury.pledgeForAReward(
  pledgeId,
  BACKER_ADDRESS,
  USDC_TOKEN_ADDRESS,
  5_000000n,                                          // 5 USDC tip (6 decimals)
  [toHex("early-bird-kit", { size: 32 })],            // selected reward
);
await oak.waitForReceipt(txHash);
```

**Pledge without a reward:**

> **Role: Any caller (backer)** — `pledgeWithoutAReward` is permissionless but time-gated.

```typescript
const pledgeId = toHex("pledge-003", { size: 32 });

const txHash = await kwrTreasury.pledgeWithoutAReward(
  pledgeId,
  BACKER_ADDRESS,
  USDC_TOKEN_ADDRESS,
  30_000000n,    // 30 USDC pledge (6 decimals)
  2_000000n,     // 2 USDC tip
);
await oak.waitForReceipt(txHash);
```

### Step 5b: Platform records payment gateway fees

> **Role: Platform Admin** — `setPaymentGatewayFee` and `setFeeAndPledge` are admin-gated (`onlyPlatformAdmin`). These are called by the platform backend, not by the backer.

Platforms that charge on-ramp or payment processing fees can record them on-chain for transparent accounting. There are two approaches:

**Record a gateway fee for an existing pledge:**

```typescript
await kwrTreasury.setPaymentGatewayFee(
  pledgeId,
  2_500000n,   // $2.50 USDC gateway fee (6 decimals)
);
```

**Combined fee + pledge in one transaction** — records the gateway fee and creates the pledge atomically. Tokens are transferred from the admin wallet:

```typescript
const pledgeId = toHex("pledge-002", { size: 32 });

const txHash = await kwrTreasury.setFeeAndPledge(
  pledgeId,
  BACKER_ADDRESS,
  USDC_TOKEN_ADDRESS,
  75_000000n,                                         // 75 USDC pledge (6 decimals)
  3_000000n,                                          // 3 USDC tip
  2_000000n,                                          // 2 USDC gateway fee
  [toHex("early-bird-kit", { size: 32 })],            // reward
  true,                                                // isPledgeForAReward
);
await oak.waitForReceipt(txHash);
```

### Step 6: Mid-campaign partial withdrawal

Lena needs funds to order components from her supplier. TechForge approves a partial withdrawal.

**Platform approves the withdrawal:**

```typescript
const txHash = await kwrTreasury.approveWithdrawal();
await oak.waitForReceipt(txHash);
```

**Creator executes the partial amount** (only after **`withdrawalDelay`** seconds since approval, unless the delay is `0` in `configureTreasury` for a walkthrough):

```typescript
const txHash = await kwrTreasury.withdraw(
  USDC_TOKEN_ADDRESS,
  3_000_000000n,   // Withdraw 3,000 USDC for component order (6 decimals)
);
await oak.waitForReceipt(txHash);
```

### Step 7: Monitor campaign progress

TechForge's dashboard shows live progress with all KWR-specific metrics.

```typescript
const [raised, available, lifetime, refunded, goal, deadline] = await oak.multicall([
  () => kwrTreasury.getRaisedAmount(),
  () => kwrTreasury.getAvailableRaisedAmount(),
  () => kwrTreasury.getLifetimeRaisedAmount(),
  () => kwrTreasury.getRefundedAmount(),
  () => kwrTreasury.getGoalAmount(),
  () => kwrTreasury.getDeadline(),
]);

const withdrawalApproved = await kwrTreasury.getWithdrawalApprovalStatus();
```

### Step 8: Disburse fees

After the campaign, protocol and platform fees are distributed.

```typescript
const txHash = await kwrTreasury.disburseFees();
await oak.waitForReceipt(txHash);
```

### Step 9: Platform claims tips

Tips are claimed separately by the platform. The `claimTip` function transfers accumulated tips to the **platform tip recipient** (configured during platform enlistment).

```typescript
const txHash = await kwrTreasury.claimTip();
await oak.waitForReceipt(txHash);
```

### Step 10: Platform claims remaining funds

After the deadline + claim delay period, the platform claims any remaining funds for the creator.

```typescript
const txHash = await kwrTreasury.claimFund();
await oak.waitForReceipt(txHash);
```

### Step 11: Backer claims refund (after refund delay)

If a backer wants a refund, they can claim one — but only after the deadline + the configured refund delay (14 days in this example).

Before calling `claimRefund`, the backer must approve the treasury to manage their pledge NFT. Pledge NFTs live on the **CampaignInfo** contract, so `approve` is called on the CampaignInfo entity:

```typescript
// After deadline + 14-day refund delay

// Approve the treasury to burn this pledge NFT (NFTs live on CampaignInfo)
const campaign = oak.campaignInfo(CAMPAIGN_INFO_ADDRESS);
await campaign.approve(KWR_TREASURY_ADDRESS, backerTokenId);

// Claim the refund — burns the NFT and returns pledged tokens
const txHash = await kwrTreasury.claimRefund(backerTokenId);
await oak.waitForReceipt(txHash);
// Pledge amount refunded; NFT burned
```

### Optional: Update campaign parameters

KWR allows updating the deadline and goal mid-campaign (subject to config lock period).

```typescript
// Extend deadline by 2 weeks
const newDeadline = currentDeadline + BigInt(14 * 86400);
await kwrTreasury.updateDeadline(newDeadline);

// Adjust goal
await kwrTreasury.updateGoalAmount(20_000_000000n);  // 20,000 USDC
```

## Architecture Diagram

```
Creator (Lena)         TechForge Platform           KeepWhatsRaised Treasury
     |                        |                               |
     |   createCampaign(...)  |                               |
     |  [Any caller]          |                               |
     |------------------------------------------------------->|  Campaign created
     |                        |  deploy(hash, info, 1)        |
     |                        |------------------------------>|  KWR treasury deployed
     |                        |  configureTreasury(...)       |
     |                        |------------------------------>|  Delays, fees configured
     |   addRewards(...)      |                               |
     |  [Campaign Owner]      |                               |
     |------------------------------------------------------->|  Reward tiers set
     |                        |                               |
Backers pledge + tip          |                               |
     |  pledgeForAReward()    |                               |
     |----------------------->|------------------------------>|  NFT minted, funds + tip locked
     |                        |  setPaymentGatewayFee()       |
     |                        |  [Platform Admin]             |
     |                        |------------------------------>|  Gateway fee recorded
     |                        |                               |
     |           --- MID-CAMPAIGN WITHDRAWAL ---              |
     |                        |  approveWithdrawal()          |
     |                        |------------------------------>|  Withdrawal approved
     |   withdraw(token, amt) |                               |
     |----------------------->|------------------------------>|  Partial funds to creator
     |                        |                               |
     |              --- AFTER DEADLINE ---                    |
     |                        |  disburseFees()               |
     |                        |------------------------------>|  Fees distributed
     |                        |  claimTip()                   |
     |                        |------------------------------>|  Tips to platform
     |                        |  claimFund()                  |
     |                        |------------------------------>|  Remaining funds to creator
     |                        |                               |
Backer refund (after delay)   |                               |
     |   claimRefund(tokenId) |                               |
     |----------------------->|------------------------------>|  Backer refunded, NFT burned
```

## Key Takeaways

- **`configureTreasury`** is mandatory and unique to KWR — it sets withdrawal delays, refund delays, and the full fee structure before the treasury operates
- **Partial withdrawals** let creators access funds mid-campaign, but require explicit platform approval via `approveWithdrawal()`
- **Tips** are a separate fund pool claimed via `claimTip()`, distinct from pledges
- **Payment gateway fees** are tracked per-pledge with `setPaymentGatewayFee()` or combined with the pledge in `setFeeAndPledge()`
- **Refund delay** protects creators from last-minute refund rushes — backers can only refund after deadline + configured delay
- **Three claim methods** serve different purposes: `claimFund()` for main funds, `claimTip()` for tips, `claimRefund()` for backers
- **`withdraw()` takes a specific token and amount**, unlike AllOrNothing where `withdraw()` sweeps everything
- **Multi-token** — pledges and withdrawals name the ERC-20 explicitly; only whitelisted tokens are accepted; accounting is per token
- **Campaign parameters are updatable** (`updateDeadline`, `updateGoalAmount`) subject to config lock period
