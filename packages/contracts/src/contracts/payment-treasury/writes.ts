import type { Address, Hex, WalletClient, Chain } from "../../lib";
import { PAYMENT_TREASURY_ABI } from "./abi";
import { requireSigner, requireAccount } from "../../utils/account";
import type { PaymentTreasuryWrites } from "./types";
import type { LineItem, ExternalFees } from "../../types/structs";
import type { CallSignerOptions } from "../../client/types";

/**
 * Builds write methods for a PaymentTreasury contract instance.
 * @param address - Deployed PaymentTreasury contract address
 * @param walletClient - Viem WalletClient used to call writeContract; must have an account attached
 * @param chain - Chain passed to writeContract for EIP-1559 and replay protection
 * @returns Write methods bound to the given contract address
 */
export function createPaymentTreasuryWrites(
  address: Address,
  walletClient: WalletClient | null,
  chain: Chain,
): PaymentTreasuryWrites {
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
      return signer.writeContract({
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
      });
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
      return signer.writeContract({
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
      });
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
      return signer.writeContract({
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
      });
    },
    async cancelPayment(paymentId: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "cancelPayment",
        args: [paymentId],
      });
    },
    async confirmPayment(paymentId: Hex, buyerAddress: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "confirmPayment",
        args: [paymentId, buyerAddress],
      });
    },
    async confirmPaymentBatch(paymentIds: readonly Hex[], buyerAddresses: readonly Address[], options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "confirmPaymentBatch",
        args: [[...paymentIds], [...buyerAddresses]],
      });
    },
    async disburseFees(options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "disburseFees",
        args: [],
      });
    },
    async withdraw(options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "withdraw",
        args: [],
      });
    },
    async claimRefund(paymentId: Hex, refundAddress: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "claimRefund",
        args: [paymentId, refundAddress],
      });
    },
    async claimRefundSelf(paymentId: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "claimRefund",
        args: [paymentId],
      });
    },
    async claimExpiredFunds(options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "claimExpiredFunds",
        args: [],
      });
    },
    async claimNonGoalLineItems(token: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "claimNonGoalLineItems",
        args: [token],
      });
    },
    async pauseTreasury(message: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "pauseTreasury",
        args: [message],
      });
    },
    async unpauseTreasury(message: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "unpauseTreasury",
        args: [message],
      });
    },
    async cancelTreasury(message: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "cancelTreasury",
        args: [message],
      });
    },
  };
}
