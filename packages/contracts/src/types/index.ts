/**
 * Shared struct types derived from contract ABIs.
 * All uint256 values are represented as bigint.
 */

import type { Address, Hex } from "viem";

/** ICampaignData.CampaignData -- used by CampaignInfo and CampaignInfoFactory */
export interface CampaignData {
  launchTime: bigint;
  deadline: bigint;
  goalAmount: bigint;
  /** bytes32 currency identifier (e.g. keccak256("USD")) */
  currency: Hex;
}

/**
 * Reward struct for AllOrNothing and KeepWhatsRaised treasuries.
 * Includes the `isRewardTier` flag to distinguish tiers from flat rewards.
 */
export interface TieredReward {
  rewardValue: bigint;
  isRewardTier: boolean;
  itemId: readonly Hex[];
  itemValue: readonly bigint[];
  itemQuantity: readonly bigint[];
}

/** ICampaignPaymentTreasury.LineItem -- line item in a payment (typeId + amount). */
export interface LineItem {
  typeId: Hex;
  amount: bigint;
}

/** IItem.Item -- used by ItemRegistry */
export interface Item {
  actualWeight: bigint;
  height: bigint;
  width: bigint;
  length: bigint;
  /** bytes32 category identifier */
  category: Hex;
  /** bytes32 declared currency identifier */
  declaredCurrency: Hex;
}

/**
 * ICampaignPaymentTreasury.PaymentLineItem -- stored with configuration snapshot.
 * All uint256 values are bigint; bytes32 are hex strings.
 */
export interface PaymentLineItem {
  typeId: Hex;
  amount: bigint;
  label: string;
  countsTowardGoal: boolean;
  applyProtocolFee: boolean;
  canRefund: boolean;
  instantTransfer: boolean;
}

/** ICampaignPaymentTreasury.ExternalFees -- informational external fee metadata. */
export interface ExternalFees {
  feeType: Hex;
  feeAmount: bigint;
}

/**
 * ICampaignPaymentTreasury.PaymentData -- comprehensive payment snapshot.
 * Mirrors the on-chain struct; lineItems and externalFees include config snapshots.
 */
export interface PaymentData {
  buyerAddress: Address;
  buyerId: Hex;
  itemId: Hex;
  amount: bigint;
  expiration: bigint;
  isConfirmed: boolean;
  isCryptoPayment: boolean;
  lineItemCount: bigint;
  paymentToken: Address;
  lineItems: readonly PaymentLineItem[];
  externalFees: readonly ExternalFees[];
}

/** EIP-2612 permit parameters */
export interface PermitParams {
  owner: Address;
  spender: Address;
  value: bigint;
  deadline: bigint;
  v: number;
  r: Hex;
  s: Hex;
}

// Re-export client types
export * from "./client";
export * from "./config-options";