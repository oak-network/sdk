import type { Address, Hex } from "../../lib";
import type { PaymentData, LineItem, ExternalFees } from "../../types/structs";
import type { CallSignerOptions } from "../../client/types";

/** Read-only methods for PaymentTreasury. */
export interface PaymentTreasuryReads {
  /** Returns the bytes32 platform hash associated with this treasury. */
  getPlatformHash(): Promise<Hex>;
  /** Returns the platform fee percent in basis points. */
  getPlatformFeePercent(): Promise<bigint>;
  /** Returns the current total amount raised (excludes refunds and non-goal items). */
  getRaisedAmount(): Promise<bigint>;
  /** Returns the amount available for withdrawal after fees and refunds. */
  getAvailableRaisedAmount(): Promise<bigint>;
  /** Returns the all-time total raised, including refunded amounts. */
  getLifetimeRaisedAmount(): Promise<bigint>;
  /** Returns the total amount refunded to buyers. */
  getRefundedAmount(): Promise<bigint>;
  /** Returns the total expected amount from all pending payments. */
  getExpectedAmount(): Promise<bigint>;
  /** Returns the full PaymentData snapshot for the given payment ID. */
  getPaymentData(paymentId: Hex): Promise<PaymentData>;
  /** Returns true if the treasury has been cancelled. */
  cancelled(): Promise<boolean>;
}

/** Write methods for PaymentTreasury. */
export interface PaymentTreasuryWrites {
  /** Creates a new off-chain payment record with line items and external fees. */
  createPayment(
    paymentId: Hex,
    buyerId: Hex,
    itemId: Hex,
    paymentToken: Address,
    amount: bigint,
    expiration: bigint,
    lineItems: readonly LineItem[],
    externalFees: readonly ExternalFees[],
    options?: CallSignerOptions,
  ): Promise<Hex>;
  /** Creates multiple payment records in a single transaction. */
  createPaymentBatch(
    paymentIds: readonly Hex[],
    buyerIds: readonly Hex[],
    itemIds: readonly Hex[],
    paymentTokens: readonly Address[],
    amounts: readonly bigint[],
    expirations: readonly bigint[],
    lineItemsArray: readonly (readonly LineItem[])[],
    externalFeesArray: readonly (readonly ExternalFees[])[],
    options?: CallSignerOptions,
  ): Promise<Hex>;
  /** Processes a crypto payment, transferring tokens from the buyer on-chain. */
  processCryptoPayment(
    paymentId: Hex,
    itemId: Hex,
    buyerAddress: Address,
    paymentToken: Address,
    amount: bigint,
    lineItems: readonly LineItem[],
    externalFees: readonly ExternalFees[],
    options?: CallSignerOptions,
  ): Promise<Hex>;
  /** Cancels a pending payment and marks it as refundable. */
  cancelPayment(paymentId: Hex, options?: CallSignerOptions): Promise<Hex>;
  /** Confirms a payment, marking funds as settled and triggering instant transfers. */
  confirmPayment(paymentId: Hex, buyerAddress: Address, options?: CallSignerOptions): Promise<Hex>;
  /** Confirms multiple payments in a single transaction. */
  confirmPaymentBatch(paymentIds: readonly Hex[], buyerAddresses: readonly Address[], options?: CallSignerOptions): Promise<Hex>;
  /** Disburses protocol and platform fees to their respective recipients. */
  disburseFees(options?: CallSignerOptions): Promise<Hex>;
  /** Withdraws settled raised funds to the campaign creator. */
  withdraw(options?: CallSignerOptions): Promise<Hex>;
  /** Issues a refund for a cancelled payment to the specified refund address. */
  claimRefund(paymentId: Hex, refundAddress: Address, options?: CallSignerOptions): Promise<Hex>;
  /** Issues a refund for a cancelled payment directly to the caller. */
  claimRefundSelf(paymentId: Hex, options?: CallSignerOptions): Promise<Hex>;
  /** Claims funds from payments that have passed their expiration timestamp. */
  claimExpiredFunds(options?: CallSignerOptions): Promise<Hex>;
  /** Claims line item amounts that do not count toward the funding goal. */
  claimNonGoalLineItems(token: Address, options?: CallSignerOptions): Promise<Hex>;
  /** Pauses the treasury, halting payment processing; emits a pause message. */
  pauseTreasury(message: Hex, options?: CallSignerOptions): Promise<Hex>;
  /** Unpauses the treasury, resuming normal operation; emits an unpause message. */
  unpauseTreasury(message: Hex, options?: CallSignerOptions): Promise<Hex>;
  /** Cancels the treasury permanently; emits a cancellation message. */
  cancelTreasury(message: Hex, options?: CallSignerOptions): Promise<Hex>;
}

/** Simulate counterparts for PaymentTreasury write methods. */
export interface PaymentTreasurySimulate {
  /** Simulates createPayment; throws a typed error on revert. */
  createPayment(
    paymentId: Hex,
    buyerId: Hex,
    itemId: Hex,
    paymentToken: Address,
    amount: bigint,
    expiration: bigint,
    lineItems: readonly LineItem[],
    externalFees: readonly ExternalFees[],
    options?: CallSignerOptions,
  ): Promise<void>;
  /** Simulates createPaymentBatch; throws a typed error on revert. */
  createPaymentBatch(
    paymentIds: readonly Hex[],
    buyerIds: readonly Hex[],
    itemIds: readonly Hex[],
    paymentTokens: readonly Address[],
    amounts: readonly bigint[],
    expirations: readonly bigint[],
    lineItemsArray: readonly (readonly LineItem[])[],
    externalFeesArray: readonly (readonly ExternalFees[])[],
    options?: CallSignerOptions,
  ): Promise<void>;
  /** Simulates processCryptoPayment; throws a typed error on revert. */
  processCryptoPayment(
    paymentId: Hex,
    itemId: Hex,
    buyerAddress: Address,
    paymentToken: Address,
    amount: bigint,
    lineItems: readonly LineItem[],
    externalFees: readonly ExternalFees[],
    options?: CallSignerOptions,
  ): Promise<void>;
  /** Simulates cancelPayment; throws a typed error on revert. */
  cancelPayment(paymentId: Hex, options?: CallSignerOptions): Promise<void>;
  /** Simulates confirmPayment; throws a typed error on revert. */
  confirmPayment(paymentId: Hex, buyerAddress: Address, options?: CallSignerOptions): Promise<void>;
  /** Simulates confirmPaymentBatch; throws a typed error on revert. */
  confirmPaymentBatch(paymentIds: readonly Hex[], buyerAddresses: readonly Address[], options?: CallSignerOptions): Promise<void>;
  /** Simulates disburseFees; throws a typed error on revert. */
  disburseFees(options?: CallSignerOptions): Promise<void>;
  /** Simulates withdraw; throws a typed error on revert. */
  withdraw(options?: CallSignerOptions): Promise<void>;
  /** Simulates claimRefund; throws a typed error on revert. */
  claimRefund(paymentId: Hex, refundAddress: Address, options?: CallSignerOptions): Promise<void>;
  /** Simulates claimRefundSelf; throws a typed error on revert. */
  claimRefundSelf(paymentId: Hex, options?: CallSignerOptions): Promise<void>;
  /** Simulates claimExpiredFunds; throws a typed error on revert. */
  claimExpiredFunds(options?: CallSignerOptions): Promise<void>;
  /** Simulates claimNonGoalLineItems; throws a typed error on revert. */
  claimNonGoalLineItems(token: Address, options?: CallSignerOptions): Promise<void>;
  /** Simulates pauseTreasury; throws a typed error on revert. */
  pauseTreasury(message: Hex, options?: CallSignerOptions): Promise<void>;
  /** Simulates unpauseTreasury; throws a typed error on revert. */
  unpauseTreasury(message: Hex, options?: CallSignerOptions): Promise<void>;
  /** Simulates cancelTreasury; throws a typed error on revert. */
  cancelTreasury(message: Hex, options?: CallSignerOptions): Promise<void>;
}

/** Event helpers for PaymentTreasury. */
export interface PaymentTreasuryEvents {}

/**
 * Full PaymentTreasury entity (reads, writes, simulate, events).
 *
 * This entity is compatible with both on-chain treasury variants:
 * - **PaymentTreasury** — standard payment treasury with no time restrictions.
 * - **TimeConstrainedPaymentTreasury** — payment treasury that enforces launch-time
 *   and deadline constraints on-chain. Time checks are applied transparently by the
 *   contract; the SDK interface is identical for both variants.
 */
export type PaymentTreasuryEntity = PaymentTreasuryReads &
  PaymentTreasuryWrites & {
    simulate: PaymentTreasurySimulate;
    events: PaymentTreasuryEvents;
  };
