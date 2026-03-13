import type { Address, Hex, PublicClient, WalletClient, Chain } from "../../lib";
import { ALL_OR_NOTHING_ABI } from "./abi";
import { requireAccount } from "../../utils/account";
import { parseContractError, getRevertData, simulateWithErrorDecode } from "../../errors";
import type { AllOrNothingSimulate } from "./types";


/**
 * Builds simulate methods for AllOrNothing write calls.
 * @param address - Contract address
 * @param publicClient - Viem PublicClient for simulateContract
 * @param walletClient - WalletClient (for account)
 * @param chain - Chain for simulateContract
 * @returns AllOrNothingSimulate
 */
export function createAllOrNothingSimulate(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient,
  chain: Chain,
): AllOrNothingSimulate {
  const contract = { address, abi: ALL_OR_NOTHING_ABI } as const;

  return {
    async pledgeForAReward(backer: Address, pledgeToken: Address, shippingFee: bigint, rewardNames: readonly Hex[]): Promise<void> {
      const account = requireAccount(walletClient);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "pledgeForAReward",
          args: [backer, pledgeToken, shippingFee, [...rewardNames]],
        }),
      );
    },
    async pledgeWithoutAReward(backer: Address, pledgeToken: Address, pledgeAmount: bigint): Promise<void> {
      const account = requireAccount(walletClient);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "pledgeWithoutAReward",
          args: [backer, pledgeToken, pledgeAmount],
        }),
      );
    },
    async claimRefund(tokenId: bigint): Promise<void> {
      const account = requireAccount(walletClient);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "claimRefund",
          args: [tokenId],
        }),
      );
    },
    async disburseFees(): Promise<void> {
      const account = requireAccount(walletClient);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "disburseFees",
          args: [],
        }),
      );
    },
    async withdraw(): Promise<void> {
      const account = requireAccount(walletClient);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "withdraw",
          args: [],
        }),
      );
    },
  };
}
