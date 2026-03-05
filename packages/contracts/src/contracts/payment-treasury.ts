import type { Address, Hex, PublicClient, WalletClient, Chain } from "viem";
import { PAYMENT_TREASURY_ABI } from "../abis/payment-treasury";
import type { PaymentTreasuryEntity, PaymentData, LineItem, ExternalFees } from "../types";

/**
 * Creates a PaymentTreasury entity with full read/write access.
 *
 * @param address - Deployed PaymentTreasury (or TimeConstrainedPaymentTreasury) contract address
 * @param publicClient - Viem PublicClient for on-chain reads
 * @param walletClient - Viem WalletClient for sending transactions
 * @param chain - Chain object (required for writeContract)
 * @returns PaymentTreasuryEntity
 *
 * @example
 * ```typescript
 * const pt = createPaymentTreasuryEntity(PT_ADDRESS, publicClient, walletClient, chain);
 * const data = await pt.getPaymentData(paymentId);
 * await pt.confirmPayment(paymentId, buyerAddress);
 * ```
 */
export function createPaymentTreasuryEntity(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient,
  chain: Chain,
): PaymentTreasuryEntity {
  const contract = { address, abi: PAYMENT_TREASURY_ABI } as const;

  function requireAccount() {
    if (!walletClient.account) {
      throw new Error("Wallet client has no account; cannot send transaction.");
    }
    return walletClient.account;
  }

  return {
    // ── Reads ────────────────────────────────────────────────────────────────

    async getplatformHash() {
      return publicClient.readContract({ ...contract, functionName: "getplatformHash" });
    },
    async getplatformFeePercent() {
      return publicClient.readContract({ ...contract, functionName: "getplatformFeePercent" });
    },
    async getRaisedAmount() {
      return publicClient.readContract({ ...contract, functionName: "getRaisedAmount" });
    },
    async getAvailableRaisedAmount() {
      return publicClient.readContract({ ...contract, functionName: "getAvailableRaisedAmount" });
    },
    async getLifetimeRaisedAmount() {
      return publicClient.readContract({ ...contract, functionName: "getLifetimeRaisedAmount" });
    },
    async getRefundedAmount() {
      return publicClient.readContract({ ...contract, functionName: "getRefundedAmount" });
    },
    async getExpectedAmount() {
      return publicClient.readContract({ ...contract, functionName: "getExpectedAmount" });
    },
    async getPaymentData(paymentId: Hex): Promise<PaymentData> {
      const result = await publicClient.readContract({ ...contract, functionName: "getPaymentData", args: [paymentId] });
      return result as unknown as PaymentData;
    },
    async cancelled() {
      return publicClient.readContract({ ...contract, functionName: "cancelled" });
    },

    // ── Writes ───────────────────────────────────────────────────────────────

    async createPayment(paymentId: Hex, buyerId: Hex, itemId: Hex, paymentToken: Address, amount: bigint, expiration: bigint, lineItems: readonly LineItem[], externalFees: readonly ExternalFees[]) {
      const account = requireAccount();
      return walletClient.writeContract({
        ...contract, chain, account, functionName: "createPayment",
        args: [paymentId, buyerId, itemId, paymentToken, amount, expiration, [...lineItems] as { typeId: Hex; amount: bigint }[], [...externalFees] as { feeType: Hex; feeAmount: bigint }[]],
      });
    },
    async createPaymentBatch(paymentIds: readonly Hex[], buyerIds: readonly Hex[], itemIds: readonly Hex[], paymentTokens: readonly Address[], amounts: readonly bigint[], expirations: readonly bigint[], lineItemsArray: readonly (readonly LineItem[])[], externalFeesArray: readonly (readonly ExternalFees[])[]) {
      const account = requireAccount();
      return walletClient.writeContract({
        ...contract, chain, account, functionName: "createPaymentBatch",
        args: [[...paymentIds], [...buyerIds], [...itemIds], [...paymentTokens], [...amounts], [...expirations], lineItemsArray.map((li) => [...li]) as { typeId: Hex; amount: bigint }[][], externalFeesArray.map((ef) => [...ef]) as { feeType: Hex; feeAmount: bigint }[][]],
      });
    },
    async processCryptoPayment(paymentId: Hex, itemId: Hex, buyerAddress: Address, paymentToken: Address, amount: bigint, lineItems: readonly LineItem[], externalFees: readonly ExternalFees[]) {
      const account = requireAccount();
      return walletClient.writeContract({
        ...contract, chain, account, functionName: "processCryptoPayment",
        args: [paymentId, itemId, buyerAddress, paymentToken, amount, [...lineItems] as { typeId: Hex; amount: bigint }[], [...externalFees] as { feeType: Hex; feeAmount: bigint }[]],
      });
    },
    async cancelPayment(paymentId: Hex) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "cancelPayment", args: [paymentId] });
    },
    async confirmPayment(paymentId: Hex, buyerAddress: Address) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "confirmPayment", args: [paymentId, buyerAddress] });
    },
    async confirmPaymentBatch(paymentIds: readonly Hex[], buyerAddresses: readonly Address[]) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "confirmPaymentBatch", args: [[...paymentIds], [...buyerAddresses]] });
    },
    async disburseFees() {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "disburseFees", args: [] });
    },
    async withdraw() {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "withdraw", args: [] });
    },
    async claimRefund(paymentId: Hex, refundAddress: Address) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "claimRefund", args: [paymentId, refundAddress] });
    },
    async claimRefundSelf(paymentId: Hex) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "claimRefund", args: [paymentId] });
    },
    async claimExpiredFunds() {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "claimExpiredFunds", args: [] });
    },
    async claimNonGoalLineItems(token: Address) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "claimNonGoalLineItems", args: [token] });
    },
    async pauseTreasury(message: Hex) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "pauseTreasury", args: [message] });
    },
    async unpauseTreasury(message: Hex) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "unpauseTreasury", args: [message] });
    },
    async cancelTreasury(message: Hex) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "cancelTreasury", args: [message] });
    },
  };
}
