import type { Address, Hex, PublicClient, WalletClient, Chain } from "../../lib";
import { PAYMENT_TREASURY_ABI } from "./abi";
import { requireSigner, requireAccount } from "../../utils/account";
import { simulateWithErrorDecode } from "../../errors";
import type { PaymentTreasurySimulate } from "./types";
import type { LineItem, ExternalFees } from "../../types/structs";

/**
 * Builds simulate methods for PaymentTreasury write calls.
 * Each method calls simulateContract against the current chain state and throws a typed
 * SDK error on revert, decoded via parseContractError.
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

  const wrap = async (fn: () => Promise<unknown>) => {
    await simulateWithErrorDecode(fn);
  };

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
    ) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await wrap(() =>
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
    ) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await wrap(() =>
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
    },
    async processCryptoPayment(
      paymentId: Hex,
      itemId: Hex,
      buyerAddress: Address,
      paymentToken: Address,
      amount: bigint,
      lineItems: readonly LineItem[],
      externalFees: readonly ExternalFees[],
    ) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await wrap(() =>
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
    },
    async cancelPayment(paymentId: Hex) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await wrap(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "cancelPayment",
          args: [paymentId],
        }),
      );
    },
    async confirmPayment(paymentId: Hex, buyerAddress: Address) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await wrap(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "confirmPayment",
          args: [paymentId, buyerAddress],
        }),
      );
    },
    async confirmPaymentBatch(paymentIds: readonly Hex[], buyerAddresses: readonly Address[]) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await wrap(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "confirmPaymentBatch",
          args: [[...paymentIds], [...buyerAddresses]],
        }),
      );
    },
    async disburseFees() {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await wrap(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "disburseFees",
          args: [],
        }),
      );
    },
    async withdraw() {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await wrap(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "withdraw",
          args: [],
        }),
      );
    },
    async claimRefund(paymentId: Hex, refundAddress: Address) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await wrap(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "claimRefund",
          args: [paymentId, refundAddress],
        }),
      );
    },
    async claimRefundSelf(paymentId: Hex) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await wrap(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "claimRefund",
          args: [paymentId],
        }),
      );
    },
    async claimExpiredFunds() {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await wrap(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "claimExpiredFunds",
          args: [],
        }),
      );
    },
    async claimNonGoalLineItems(token: Address) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await wrap(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "claimNonGoalLineItems",
          args: [token],
        }),
      );
    },
    async pauseTreasury(message: Hex) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await wrap(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "pauseTreasury",
          args: [message],
        }),
      );
    },
    async unpauseTreasury(message: Hex) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await wrap(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "unpauseTreasury",
          args: [message],
        }),
      );
    },
    async cancelTreasury(message: Hex) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await wrap(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "cancelTreasury",
          args: [message],
        }),
      );
    },
  };
}
