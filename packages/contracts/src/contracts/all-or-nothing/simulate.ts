import type { Address, Hex, PublicClient, WalletClient, Chain } from "../../lib";
import { ALL_OR_NOTHING_ABI } from "./abi";
import { requireSigner, requireAccount } from "../../utils/account";
import { parseContractError, getRevertData, simulateWithErrorDecode } from "../../errors";
import type { AllOrNothingSimulate } from "./types";


/**
 * Builds simulate methods for AllOrNothing write calls.
 * Each method calls simulateContract against the current chain state and throws a typed
 * SDK error on revert, decoded via parseContractError.
 * @param address - Deployed AllOrNothing contract address
 * @param publicClient - Viem PublicClient used to call simulateContract
 * @param walletClient - Viem WalletClient used to resolve the account for simulation
 * @param chain - Chain passed to simulateContract
 * @returns Simulation methods bound to the given contract address
 */
export function createAllOrNothingSimulate(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient | null,
  chain: Chain,
): AllOrNothingSimulate {
  const contract = { address, abi: ALL_OR_NOTHING_ABI } as const;

  return {
    async pledgeForAReward(backer: Address, pledgeToken: Address, shippingFee: bigint, rewardNames: readonly Hex[]): Promise<void> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
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
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
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
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
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
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
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
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
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
