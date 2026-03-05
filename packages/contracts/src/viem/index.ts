// Re-export commonly used viem types and functions
export type {
  Account,
  Address,
  Hex,
  PublicClient,
  WalletClient,
} from "viem";

export {
  createPublicClient,
  createWalletClient,
  http,
  custom,
  keccak256,
  stringToHex,
  parseEther,
  formatEther,
  parseUnits,
  isAddress,
  getAddress,
  defineChain,
} from "viem";

// Re-export Chain type and common chains
export type { Chain } from "viem/chains";
export { mainnet, sepolia, goerli } from "viem/chains";
