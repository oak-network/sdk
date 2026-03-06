export { createOakContractsClient } from "./client";

export * from "./utils";
export * from "./types";

export type {
  Account,
  Address,
  Hex,
  PublicClient,
  WalletClient,
} from "viem";
export type { Chain } from "viem/chains";

export {
  createPublicClient,
  createWalletClient,
  http,
  custom,
  keccak256,
  stringToHex,
  toHex,
  parseEther,
  formatEther,
  parseUnits,
  isAddress,
  getAddress,
} from "viem";
export { mainnet, sepolia, goerli } from "viem/chains";

export * from "./constants";
export * from "./errors";
