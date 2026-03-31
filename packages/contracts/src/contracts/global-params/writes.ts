import type { Address, Hex, WalletClient, Chain } from "../../lib";
import { GLOBAL_PARAMS_ABI } from "./abi";
import { requireSigner, requireAccount } from "../../utils/account";
import type { GlobalParamsWrites } from "./types";
import type { CallSignerOptions } from "../../client/types";

/**
 * Builds write methods for a GlobalParams contract instance.
 * @param address - Deployed GlobalParams contract address
 * @param walletClient - Viem WalletClient used to call writeContract; must have an account attached
 * @param chain - Chain passed to writeContract for EIP-1559 and replay protection
 * @returns Write methods bound to the given contract address
 */
export function createGlobalParamsWrites(
  address: Address,
  walletClient: WalletClient | null,
  chain: Chain,
): GlobalParamsWrites {
  const contract = { address, abi: GLOBAL_PARAMS_ABI } as const;

  return {
    async enlistPlatform(platformHash: Hex, platformAdminAddress: Address, platformFeePercent: bigint, platformAdapter: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "enlistPlatform", args: [platformHash, platformAdminAddress, platformFeePercent, platformAdapter] });
    },
    async delistPlatform(platformBytes: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "delistPlatform", args: [platformBytes] });
    },
    async updatePlatformAdminAddress(platformBytes: Hex, platformAdminAddress: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "updatePlatformAdminAddress", args: [platformBytes, platformAdminAddress] });
    },
    async updatePlatformClaimDelay(platformBytes: Hex, claimDelay: bigint, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "updatePlatformClaimDelay", args: [platformBytes, claimDelay] });
    },
    async updateProtocolAdminAddress(protocolAdminAddress: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "updateProtocolAdminAddress", args: [protocolAdminAddress] });
    },
    async updateProtocolFeePercent(protocolFeePercent: bigint, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "updateProtocolFeePercent", args: [protocolFeePercent] });
    },
    async setPlatformAdapter(platformBytes: Hex, platformAdapter: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "setPlatformAdapter", args: [platformBytes, platformAdapter] });
    },
    async setPlatformLineItemType(platformHash: Hex, typeId: Hex, label: string, countsTowardGoal: boolean, applyProtocolFee: boolean, canRefund: boolean, instantTransfer: boolean, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "setPlatformLineItemType", args: [platformHash, typeId, label, countsTowardGoal, applyProtocolFee, canRefund, instantTransfer] });
    },
    async removePlatformLineItemType(platformHash: Hex, typeId: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "removePlatformLineItemType", args: [platformHash, typeId] });
    },
    async addTokenToCurrency(currency: Hex, token: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "addTokenToCurrency", args: [currency, token] });
    },
    async removeTokenFromCurrency(currency: Hex, token: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "removeTokenFromCurrency", args: [currency, token] });
    },
    async addPlatformData(platformBytes: Hex, platformDataKey: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "addPlatformData", args: [platformBytes, platformDataKey] });
    },
    async removePlatformData(platformBytes: Hex, platformDataKey: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "removePlatformData", args: [platformBytes, platformDataKey] });
    },
    async addToRegistry(key: Hex, value: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "addToRegistry", args: [key, value] });
    },
    async transferOwnership(newOwner: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "transferOwnership", args: [newOwner] });
    },
    async renounceOwnership(options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "renounceOwnership", args: [] });
    },
  };
}
