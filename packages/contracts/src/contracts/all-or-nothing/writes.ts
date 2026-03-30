import type { Address, Hex, WalletClient, Chain } from "../../lib";
import { ALL_OR_NOTHING_ABI } from "./abi";
import { requireSigner, requireAccount } from "../../utils/account";
import type { AllOrNothingWrites } from "./types";
import type { TieredReward } from "../../types/structs";

/**
 * Builds write methods for an AllOrNothing treasury contract instance.
 * @param address - Deployed AllOrNothing contract address
 * @param walletClient - Viem WalletClient used to call writeContract; must have an account attached
 * @param chain - Chain passed to writeContract for EIP-1559 and replay protection
 * @returns Write methods bound to the given contract address
 */
export function createAllOrNothingWrites(
  address: Address,
  walletClient: WalletClient | null,
  chain: Chain,
): AllOrNothingWrites {
  const contract = { address, abi: ALL_OR_NOTHING_ABI } as const;

  return {
    async pauseTreasury(message: Hex): Promise<Hex> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "pauseTreasury", args: [message] });
    },
    async unpauseTreasury(message: Hex): Promise<Hex> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "unpauseTreasury", args: [message] });
    },
    async cancelTreasury(message: Hex): Promise<Hex> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "cancelTreasury", args: [message] });
    },
    async addRewards(rewardNames: readonly Hex[], rewards: readonly TieredReward[]): Promise<Hex> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "addRewards", args: [[...rewardNames], [...rewards]] });
    },
    async removeReward(rewardName: Hex): Promise<Hex> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "removeReward", args: [rewardName] });
    },
    async pledgeForAReward(backer: Address, pledgeToken: Address, shippingFee: bigint, rewardNames: readonly Hex[]): Promise<Hex> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "pledgeForAReward", args: [backer, pledgeToken, shippingFee, [...rewardNames]] });
    },
    async pledgeWithoutAReward(backer: Address, pledgeToken: Address, pledgeAmount: bigint): Promise<Hex> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "pledgeWithoutAReward", args: [backer, pledgeToken, pledgeAmount] });
    },
    async claimRefund(tokenId: bigint): Promise<Hex> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "claimRefund", args: [tokenId] });
    },
    async disburseFees(): Promise<Hex> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "disburseFees", args: [] });
    },
    async withdraw(): Promise<Hex> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "withdraw", args: [] });
    },
    async burn(tokenId: bigint): Promise<Hex> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "burn", args: [tokenId] });
    },
    async approve(to: Address, tokenId: bigint): Promise<Hex> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "approve", args: [to, tokenId] });
    },
    async setApprovalForAll(operator: Address, approved: boolean): Promise<Hex> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "setApprovalForAll", args: [operator, approved] });
    },
    async safeTransferFrom(from: Address, to: Address, tokenId: bigint): Promise<Hex> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "safeTransferFrom", args: [from, to, tokenId] });
    },
    async transferFrom(from: Address, to: Address, tokenId: bigint): Promise<Hex> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "transferFrom", args: [from, to, tokenId] });
    },
  };
}
