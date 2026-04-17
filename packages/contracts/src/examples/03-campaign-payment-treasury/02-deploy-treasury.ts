/**
 * Step 2: Deploy a Payment Treasury (Platform Admin / Creator)
 *
 * CeloMarket deploys a PaymentTreasury through the TreasuryFactory,
 * linking it to the CampaignInfo contract created in Step 1. The
 * factory creates a new treasury clone and emits a TreasuryDeployed
 * event containing the treasury address.
 *
 * The `implementationId` determines the treasury variant:
 *   - PaymentTreasury: standard, no time restrictions
 *   - TimeConstrainedPaymentTreasury: enforces launch time + deadline
 *
 * The implementation must have been registered and approved during
 * platform onboarding (see Scenario 0, Steps 3–4).
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS, TREASURY_FACTORY_EVENTS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.CELOMARKET_ADMIN_PRIVATE_KEY! as `0x${string}`,
});

const treasuryFactory = oak.treasuryFactory(
  process.env.TREASURY_FACTORY_ADDRESS! as `0x${string}`,
);

const platformHash = keccak256(toHex("celomarket"));
const campaignInfoAddress = process.env.CAMPAIGN_INFO_ADDRESS! as `0x${string}`;
const paymentTreasuryImplementationId = 2n;

const deployTxHash = await treasuryFactory.deploy(
  platformHash,
  campaignInfoAddress,
  paymentTreasuryImplementationId,
);

const deployReceipt = await oak.waitForReceipt(deployTxHash);
console.log(`Treasury deployed at block ${deployReceipt.blockNumber}`);

let treasuryAddress: `0x${string}` | undefined;

for (const log of deployReceipt.logs) {
  try {
    const decoded = treasuryFactory.events.decodeLog({
      topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
      data: log.data as `0x${string}`,
    });

    if (decoded.eventName === TREASURY_FACTORY_EVENTS.TreasuryDeployed) {
      treasuryAddress = decoded.args?.treasuryAddress as `0x${string}`;
      break;
    }
  } catch {
    // Log belongs to a different contract — skip
  }
}

console.log("PaymentTreasury deployed at:", treasuryAddress);
