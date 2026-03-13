/** Chain ID registry mapping human-readable network names to numeric chain IDs. */
export const CHAIN_IDS = {
  ETHEREUM_MAINNET: 1,
  CELO_MAINNET: 42220,
  ETHEREUM_TESTNET_SEPOLIA: 11155111,
  ETHEREUM_TESTNET_GOERLI: 5,
  CELO_TESTNET_SEPOLIA: 11142220,
} as const;

/** Numeric chain ID; one of the values in {@link CHAIN_IDS}. */
export type ChainId = (typeof CHAIN_IDS)[keyof typeof CHAIN_IDS];
