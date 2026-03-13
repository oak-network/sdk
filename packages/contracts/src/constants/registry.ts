import { keccak256, toHex, encodeAbiParameters, type Hex } from "../lib";

/** Registry keys matching DataRegistryKeys.sol — keccak256 of their string names. */
export const DATA_REGISTRY_KEYS = {
  BUFFER_TIME: keccak256(toHex("bufferTime")),
  MAX_PAYMENT_EXPIRATION: keccak256(toHex("maxPaymentExpiration")),
  CAMPAIGN_LAUNCH_BUFFER: keccak256(toHex("campaignLaunchBuffer")),
  MINIMUM_CAMPAIGN_DURATION: keccak256(toHex("minimumCampaignDuration")),
} as const;

/** Human-readable name of a data registry key in {@link DATA_REGISTRY_KEYS}. */
export type DataRegistryKeyName = keyof typeof DATA_REGISTRY_KEYS;

/**
 * Computes a platform-scoped registry key from a base key and platform hash.
 * Matches DataRegistryKeys.scopedToPlatform on-chain.
 * @param baseKey - Base registry key (bytes32)
 * @param platformHash - Platform hash (bytes32)
 * @returns Scoped registry key (bytes32)
 */
export function scopedToPlatform(baseKey: Hex, platformHash: Hex): Hex {
  return keccak256(encodeAbiParameters([{ type: "bytes32" }, { type: "bytes32" }], [baseKey, platformHash]));
}
