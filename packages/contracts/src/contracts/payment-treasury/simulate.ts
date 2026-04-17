import type { Address, Hex, PublicClient, WalletClient, Chain } from "../../lib";
import { PAYMENT_TREASURY_ABI } from "./abi";
import { requireSigner, requireAccount } from "../../utils/account";
import { simulateWithErrorDecode, toSimulationResult } from "../../errors";
import type { PaymentTreasurySimulate } from "./types";
import type { LineItem, ExternalFees } from "../../types/structs";
import type { CallSignerOptions } from "../../client/types";

/**
 * Builds simulate methods for PaymentTreasury write calls.
 * Each method calls simulateContract against the current chain state and throws a typed
 * SDK error on revert, decoded via simulateWithErrorDecode.
 * @param address - Deployed PaymentTreasury contract address
 * @param publicClient - Viem PublicClient used to call simulateContract
 * @param walletClient - Viem WalletClient used to resolve the account for simulation
 * @param chain - Chain passed to simulateContract
 * @returns Simulation methods bound to the given contract address
 */
export function createPaymentTreasurySimulate(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient | null,
  chain: Chain,
): PaymentTreasurySimulate {
  const contract = { address, abi: PAYMENT_TREASURY_ABI } as const;

  return {
    async createPayment(
      paymentId: Hex,
      buyerId: Hex,
      itemId: Hex,
      paymentToken: Address,
      amount: bigint,
      expiration: bigint,
      lineItems: readonly LineItem[],
      externalFees: readonly ExternalFees[],
      options?: CallSignerOptions,
    ) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "createPayment",
          args: [
            paymentId,
            buyerId,
            itemId,
            paymentToken,
            amount,
            expiration,
            [...lineItems] as { typeId: Hex; amount: bigint }[],
            [...externalFees] as { feeType: Hex; feeAmount: bigint }[],
          ],
        }),
      );
      return toSimulationResult(response);
    },
    async createPaymentBatch(
      paymentIds: readonly Hex[],
      buyerIds: readonly Hex[],
      itemIds: readonly Hex[],
      paymentTokens: readonly Address[],
      amounts: readonly bigint[],
      expirations: readonly bigint[],
      lineItemsArray: readonly (readonly LineItem[])[],
      externalFeesArray: readonly (readonly ExternalFees[])[],
      options?: CallSignerOptions,
    ) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "createPaymentBatch",
          args: [
            [...paymentIds],
            [...buyerIds],
            [...itemIds],
            [...paymentTokens],
            [...amounts],
            [...expirations],
            lineItemsArray.map((li) => [...li]) as { typeId: Hex; amount: bigint }[][],
            externalFeesArray.map((ef) => [...ef]) as { feeType: Hex; feeAmount: bigint }[][],
          ],
        }),
      );
      return toSimulationResult(response);
    },
    async processCryptoPayment(
      paymentId: Hex,
      itemId: Hex,
      buyerAddress: Address,
      paymentToken: Address,
      amount: bigint,
      lineItems: readonly LineItem[],
      externalFees: readonly ExternalFees[],
      options?: CallSignerOptions,
    ) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "processCryptoPayment",
          args: [
            paymentId,
            itemId,
            buyerAddress,
            paymentToken,
            amount,
            [...lineItems] as { typeId: Hex; amount: bigint }[],
            [...externalFees] as { feeType: Hex; feeAmount: bigint }[],
          ],
        }),
      );
      return toSimulationResult(response);
    },
    async cancelPayment(paymentId: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "cancelPayment",
          args: [paymentId],
        }),
      );
      return toSimulationResult(response);
    },
    async confirmPayment(paymentId: Hex, buyerAddress: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "confirmPayment",
          args: [paymentId, buyerAddress],
        }),
      );
      return toSimulationResult(response);
    },
    async confirmPaymentBatch(paymentIds: readonly Hex[], buyerAddresses: readonly Address[], options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "confirmPaymentBatch",
          args: [[...paymentIds], [...buyerAddresses]],
        }),
      );
      return toSimulationResult(response);
    },
    async disburseFees(options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "disburseFees",
          args: [],
        }),
      );
      return toSimulationResult(response);
    },
    async withdraw(options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "withdraw",
          args: [],
        }),
      );
      return toSimulationResult(response);
    },
    async claimRefund(paymentId: Hex, refundAddress: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "claimRefund",
          args: [paymentId, refundAddress],
        }),
      );
      return toSimulationResult(response);
    },
    async claimRefundSelf(paymentId: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "claimRefund",
          args: [paymentId],
        }),
      );
      return toSimulationResult(response);
    },
    async claimExpiredFunds(options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "claimExpiredFunds",
          args: [],
        }),
      );
      return toSimulationResult(response);
    },
    async claimNonGoalLineItems(token: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "claimNonGoalLineItems",
          args: [token],
        }),
      );
      return toSimulationResult(response);
    },
    async pauseTreasury(message: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "pauseTreasury",
          args: [message],
        }),
      );
      return toSimulationResult(response);
    },
    async unpauseTreasury(message: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "unpauseTreasury",
          args: [message],
        }),
      );
      return toSimulationResult(response);
    },
    async cancelTreasury(message: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "cancelTreasury",
          args: [message],
        }),
      );
      return toSimulationResult(response);
    },
  };
}
