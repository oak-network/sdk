import type { Address, Hex, PublicClient } from "../../lib";
import { PAYMENT_TREASURY_ABI } from "./abi";
import type { PaymentTreasuryReads } from "./types";
import type { PaymentData } from "../../types/structs";

/**
 * Builds read methods for a PaymentTreasury contract instance.
 * @param address - Deployed PaymentTreasury contract address
 * @param publicClient - Viem PublicClient used to call readContract
 * @returns Read methods bound to the given contract address
 */
export function createPaymentTreasuryReads(
  address: Address,
  publicClient: PublicClient,
): PaymentTreasuryReads {
  const contract = { address, abi: PAYMENT_TREASURY_ABI } as const;

  return {
    async getPlatformHash() {
      return publicClient.readContract({ ...contract, functionName: "getplatformHash" });
    },
    async getPlatformFeePercent() {
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
      const result = await publicClient.readContract({
        ...contract,
        functionName: "getPaymentData",
        args: [paymentId],
      });
      return result as unknown as PaymentData;
    },
    async cancelled() {
      return publicClient.readContract({ ...contract, functionName: "cancelled" });
    },
    async paused() {
      return publicClient.readContract({ ...contract, functionName: "paused" });
    },
  };
}
