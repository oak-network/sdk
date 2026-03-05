import type { Address } from "viem";
import { PAYMENT_TREASURY_ABI } from "../abis/payment-treasury.js";

/**
 * Returns a typed contract config for PaymentTreasury / TimeConstrainedPaymentTreasury.
 *
 * @example
 * const pt = paymentTreasuryContract('0x...');
 * const data = await publicClient.readContract({ ...pt, functionName: 'getPaymentData', args: [paymentId] });
 */
export function paymentTreasuryContract(address: Address) {
  return { address, abi: PAYMENT_TREASURY_ABI } as const;
}

export type PaymentTreasuryContractConfig = ReturnType<typeof paymentTreasuryContract>;
