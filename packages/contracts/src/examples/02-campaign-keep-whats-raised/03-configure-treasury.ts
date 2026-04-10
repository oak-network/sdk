/**
 * Step 3: Configure the Treasury (Platform Admin)
 *
 * The platform admin configures the treasury before it can accept
 * pledges. This is a platform-level responsibility — the creator
 * cannot call this function.
 *
 * Configuration includes:
 *
 *   - Withdrawal delay: how long after approval before funds can be
 *     withdrawn (gives backers visibility)
 *   - Refund delay: how long after the deadline (or cancellation)
 *     backers must wait before claiming refunds
 *   - Config lock period: prevents parameter changes close to the
 *     deadline (protects backers from last-minute rule changes)
 *   - Fee structure: flat fees, cumulative flat fees, and gross
 *     percentage-based fees applied to each pledge
 *
 * These parameters balance creator flexibility with backer protection.
 */

import {
  createOakContractsClient,
  keccak256,
  toHex,
  getCurrentTimestamp,
  addDays,
  CHAIN_IDS,
} from "@oaknetwork/contracts-sdk";
import type {
  KeepWhatsRaisedConfig,
  KeepWhatsRaisedFeeKeys,
  KeepWhatsRaisedFeeValues,
  CampaignData,
} from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PLATFORM_PRIVATE_KEY! as `0x${string}`,
});

const treasuryAddress = process.env.KEEP_WHATS_RAISED_ADDRESS! as `0x${string}`;
const treasury = oak.keepWhatsRaisedTreasury(treasuryAddress);

const now = getCurrentTimestamp();
const currency = toHex("USD", { size: 32 });

const config: KeepWhatsRaisedConfig = {
  minimumWithdrawalForFeeExemption: 1_000_000_000n,  // $1,000 — withdrawals above this skip flat fee
  withdrawalDelay: 86400n,        // 24 hours between approval and withdrawal
  refundDelay: 259200n,           // 3-day delay after deadline before backers can refund
  configLockPeriod: 604800n,      // config is locked for 7 days before deadline
  isColombianCreator: false,
};

const campaignData: CampaignData = {
  launchTime: now + 1800n,
  deadline: addDays(now, 60),
  goalAmount: 10_000_000_000n,
  currency,
};

const feeKeys: KeepWhatsRaisedFeeKeys = {
  flatFeeKey: keccak256(toHex("flatWithdrawalFee")),
  cumulativeFlatFeeKey: keccak256(toHex("cumulativeFlatFee")),
  grossPercentageFeeKeys: [keccak256(toHex("grossFee"))],
};

const feeValues: KeepWhatsRaisedFeeValues = {
  flatFeeValue: 5_000_000n,            // $5 flat fee per withdrawal
  cumulativeFlatFeeValue: 50_000_000n,  // $50 max cumulative flat fees
  grossPercentageFeeValues: [200n],     // 2% gross percentage fee
};

const configureTxHash = await treasury.configureTreasury(
  config,
  campaignData,
  feeKeys,
  feeValues,
);

await oak.waitForReceipt(configureTxHash);
console.log("Treasury configured with withdrawal delays and fee structure");
