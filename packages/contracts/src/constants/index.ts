import { keccak256, toHex, encodeAbiParameters, type Hex } from "viem";

/**
 * Common chain IDs for use with createOakContractsClient({ chainId, rpcUrl, privateKey }).
 * Naming convention: {CHAIN}_{MAINNET|TESTNET}
 * CELO_TESTNET_ALFAJORES is the legacy Celo testnet (44787); use CELO_TESTNET_SEPOLIA for new development.
 */
export const CHAIN_IDS = {
  // Mainnets
  ETHEREUM_MAINNET: 1,
  CELO_MAINNET: 42220,
  // Testnets
  ETHEREUM_TESTNET_SEPOLIA: 11155111,
  ETHEREUM_TESTNET_GOERLI: 5,
  CELO_TESTNET_SEPOLIA: 11142220,
  CELO_TESTNET_ALFAJORES: 44787,
} as const;

/** Basis points denominator used for fee calculations (100% = 10_000 bps) */
export const BPS_DENOMINATOR = 10_000n;

/** Zero bytes32 value */
export const BYTES32_ZERO: Hex = `0x${"00".repeat(32)}`;

/** ERC-165 interface IDs */
export const INTERFACE_IDS = {
  ERC721: "0x80ac58cd",
  ERC721Metadata: "0x5b5e139f",
  ERC2612: "0xd505accf",
} as const;

/**
 * Data registry keys used in GlobalParams (matches DataRegistryKeys.sol).
 * Use these when reading/writing GlobalParams data registry or with getDataFromRegistry.
 */
export const DATA_REGISTRY_KEYS = {
  BUFFER_TIME: keccak256(toHex("bufferTime")),
  MAX_PAYMENT_EXPIRATION: keccak256(toHex("maxPaymentExpiration")),
  CAMPAIGN_LAUNCH_BUFFER: keccak256(toHex("campaignLaunchBuffer")),
  MINIMUM_CAMPAIGN_DURATION: keccak256(toHex("minimumCampaignDuration")),
} as const;

/**
 * Generates a namespaced registry key scoped to a platform (matches DataRegistryKeys.scopedToPlatform).
 */
export function scopedToPlatform(baseKey: Hex, platformHash: Hex): Hex {
  return keccak256(
    encodeAbiParameters(
      [{ type: "bytes32" }, { type: "bytes32" }],
      [baseKey, platformHash],
    ),
  );
}
