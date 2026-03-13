import type { Address, Hex, WalletClient, Chain } from "../../lib";
import { ALL_OR_NOTHING_ABI } from "./abi";
import { requireAccount } from "../../utils/account";
import type { AllOrNothingWrites } from "./types";
import type { TieredReward } from "../../types/structs";

/**
 * Builds write methods for an AllOrNothing treasury contract instance.
 * @param address - Contract address
 * @param walletClient - Viem WalletClient for writes
 * @param chain - Chain for writeContract
 * @returns AllOrNothingWrites
 */
export function createAllOrNothingWrites(
  address: Address,
  walletClient: WalletClient,
  chain: Chain,
): AllOrNothingWrites {
  const contract = { address, abi: ALL_OR_NOTHING_ABI } as const;

  return {
    async pauseTreasury(message: Hex): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "pauseTreasury", args: [message] });
    },
    async unpauseTreasury(message: Hex): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "unpauseTreasury", args: [message] });
    },
    async cancelTreasury(message: Hex): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "cancelTreasury", args: [message] });
    },
    async addRewards(rewardNames: readonly Hex[], rewards: readonly TieredReward[]): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "addRewards", args: [[...rewardNames], [...rewards]] });
    },
    async removeReward(rewardName: Hex): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "removeReward", args: [rewardName] });
    },
    async pledgeForAReward(backer: Address, pledgeToken: Address, shippingFee: bigint, rewardNames: readonly Hex[]): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "pledgeForAReward", args: [backer, pledgeToken, shippingFee, [...rewardNames]] });
    },
    async pledgeWithoutAReward(backer: Address, pledgeToken: Address, pledgeAmount: bigint): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "pledgeWithoutAReward", args: [backer, pledgeToken, pledgeAmount] });
    },
    async claimRefund(tokenId: bigint): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "claimRefund", args: [tokenId] });
    },
    async disburseFees(): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "disburseFees", args: [] });
    },
    async withdraw(): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "withdraw", args: [] });
    },
    async burn(tokenId: bigint): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "burn", args: [tokenId] });
    },
    async approve(to: Address, tokenId: bigint): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "approve", args: [to, tokenId] });
    },
    async setApprovalForAll(operator: Address, approved: boolean): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "setApprovalForAll", args: [operator, approved] });
    },
    async safeTransferFrom(from: Address, to: Address, tokenId: bigint): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "safeTransferFrom", args: [from, to, tokenId] });
    },
    async transferFrom(from: Address, to: Address, tokenId: bigint): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "transferFrom", args: [from, to, tokenId] });
    },
  };
}
