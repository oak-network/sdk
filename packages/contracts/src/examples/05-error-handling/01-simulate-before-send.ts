/**
 * Step 1: Simulate Before Sending
 *
 * Simulation calls the contract against the current chain state
 * without broadcasting a transaction. If the simulation succeeds,
 * the real transaction is safe to send. The simulation result
 * includes the predicted return value and gas estimate.
 */

import {
  createOakContractsClient,
  keccak256,
  toHex,
  getCurrentTimestamp,
  addDays,
  CHAIN_IDS,
} from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PRIVATE_KEY! as `0x${string}`,
});

const factory = oak.campaignInfoFactory(
  process.env.CAMPAIGN_INFO_FACTORY_ADDRESS! as `0x${string}`,
);

const platformHash = keccak256(toHex("artfund"));
const identifierHash = keccak256(toHex("simulation-test-campaign"));
const now = getCurrentTimestamp();

const campaignParams = {
  creator: process.env.CREATOR_ADDRESS! as `0x${string}`,
  identifierHash,
  selectedPlatformHash: [platformHash],
  campaignData: {
    launchTime: now + 3600n,
    deadline: addDays(now, 30),
    goalAmount: 1_000_000_000n,
    currency: toHex("USD", { size: 32 }),
  },
  nftName: "Test Campaign",
  nftSymbol: "TC",
  nftImageURI: "ipfs://test",
  contractURI: "ipfs://test-meta",
};

// Simulate first
const simulation = await factory.simulate.createCampaign(campaignParams);

// simulation.result — the return value the contract would produce
// simulation.request — { to, data, value, gas }
console.log("Simulation succeeded!");
console.log("Estimated gas:", simulation.request.gas);

// Safe to send the real transaction
const txHash = await factory.createCampaign(campaignParams);
await oak.waitForReceipt(txHash);
console.log("Campaign created successfully");
