/**
 * Step 5: Look Up Protocol Registry Values
 *
 * The protocol stores configuration values (buffer times, payment
 * expirations, campaign duration minimums) in a data registry.
 * Values can be global or scoped to a specific platform.
 */

import {
  createOakContractsClient,
  keccak256,
  toHex,
  CHAIN_IDS,
  DATA_REGISTRY_KEYS,
  scopedToPlatform,
} from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
});

const gp = oak.globalParams(process.env.GLOBAL_PARAMS_ADDRESS! as `0x${string}`);

// --- Global registry values (not platform-specific) ---

const bufferTime = await gp.getFromRegistry(DATA_REGISTRY_KEYS.BUFFER_TIME);
console.log("Buffer time:", bufferTime);

const maxPaymentExpiration = await gp.getFromRegistry(
  DATA_REGISTRY_KEYS.MAX_PAYMENT_EXPIRATION,
);
console.log("Max payment expiration:", maxPaymentExpiration);

const minCampaignDuration = await gp.getFromRegistry(
  DATA_REGISTRY_KEYS.MINIMUM_CAMPAIGN_DURATION,
);
console.log("Minimum campaign duration:", minCampaignDuration);

// --- Platform-scoped registry values ---

const platformHash = keccak256(toHex("artfund"));

const platformBufferTime = await gp.getFromRegistry(
  scopedToPlatform(DATA_REGISTRY_KEYS.BUFFER_TIME, platformHash),
);
console.log("ArtFund-specific buffer time:", platformBufferTime);

const platformLaunchBuffer = await gp.getFromRegistry(
  scopedToPlatform(DATA_REGISTRY_KEYS.CAMPAIGN_LAUNCH_BUFFER, platformHash),
);
console.log("ArtFund campaign launch buffer:", platformLaunchBuffer);
