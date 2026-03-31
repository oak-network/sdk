// Values
export {
  createPublicClient,
  createWalletClient,
  http,
  custom,
  keccak256,
  toHex,
  stringToHex,
  encodeAbiParameters,
  decodeErrorResult,
  parseEther,
  formatEther,
  parseUnits,
  isAddress,
  getAddress,
  defineChain,
} from "viem";

// Types
export type {
  Account,
  Address,
  Chain,
  Hex,
  PublicClient,
  WalletClient,
  EIP1193Provider,
} from "viem";

// Chain presets
export { mainnet, sepolia, goerli } from "viem/chains";

// Accounts
export { privateKeyToAccount } from "viem/accounts";

// Provider helpers
export {
  createJsonRpcProvider,
  createBrowserProvider,
  getSigner,
  createWallet,
} from "./provider";

// SDK-level wallet type (WalletClient with guaranteed account)
export type { Wallet, JsonRpcProvider } from "../../client/types";
