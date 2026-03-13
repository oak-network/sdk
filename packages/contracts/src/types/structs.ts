import type { Address, Hex } from "../lib";

/** ICampaignData.CampaignData — used by CampaignInfo and CampaignInfoFactory. */
export interface CampaignData {
  /** Unix timestamp (seconds) when the campaign launches. */
  launchTime: bigint;
  /** Unix timestamp (seconds) when the campaign ends. */
  deadline: bigint;
  /** Minimum funding goal in the campaign currency unit. */
  goalAmount: bigint;
  /** bytes32 currency identifier (e.g. keccak256("USD")). */
  currency: Hex;
}

/**
 * Reward struct for AllOrNothing and KeepWhatsRaised treasuries.
 * The isRewardTier flag distinguishes tiered rewards from flat rewards.
 */
export interface TieredReward {
  /** Minimum pledge value required for this reward tier. */
  rewardValue: bigint;
  /** True if this entry is a reward tier rather than a flat reward. */
  isRewardTier: boolean;
  /** bytes32 item IDs included in this reward. */
  itemId: readonly Hex[];
  /** Declared item values parallel to itemId. */
  itemValue: readonly bigint[];
  /** Item quantities parallel to itemId. */
  itemQuantity: readonly bigint[];
}

/** ICampaignPaymentTreasury.LineItem — typeId + amount pair sent into a payment. */
export interface LineItem {
  /** bytes32 type identifier registered in GlobalParams. */
  typeId: Hex;
  /** Token amount for this line item. */
  amount: bigint;
}

/** IItem.Item — physical-item record used by ItemRegistry. */
export interface Item {
  /** Actual weight in grams. */
  actualWeight: bigint;
  /** Height in millimetres. */
  height: bigint;
  /** Width in millimetres. */
  width: bigint;
  /** Length in millimetres. */
  length: bigint;
  /** bytes32 category identifier. */
  category: Hex;
  /** bytes32 declared currency identifier. */
  declaredCurrency: Hex;
}

/**
 * ICampaignPaymentTreasury.PaymentLineItem — line item stored with its configuration snapshot.
 * Returned by getPaymentData; all uint256 values are bigint; bytes32 are hex strings.
 */
export interface PaymentLineItem {
  /** bytes32 type identifier. */
  typeId: Hex;
  /** Token amount. */
  amount: bigint;
  /** Human-readable label from the line item type config. */
  label: string;
  /** True if this amount counts toward the funding goal. */
  countsTowardGoal: boolean;
  /** True if the protocol fee is applied to this item. */
  applyProtocolFee: boolean;
  /** True if the backer can claim a refund for this item. */
  canRefund: boolean;
  /** True if funds are transferred immediately on confirmation. */
  instantTransfer: boolean;
}

/** ICampaignPaymentTreasury.ExternalFees — informational external fee metadata. */
export interface ExternalFees {
  /** bytes32 fee type identifier. */
  feeType: Hex;
  /** Fee amount in token units. */
  feeAmount: bigint;
}

/**
 * ICampaignPaymentTreasury.PaymentData — comprehensive payment snapshot.
 * Mirrors the on-chain struct; lineItems and externalFees carry config snapshots.
 */
export interface PaymentData {
  /** Buyer's wallet address. */
  buyerAddress: Address;
  /** bytes32 off-chain buyer identifier. */
  buyerId: Hex;
  /** bytes32 item identifier. */
  itemId: Hex;
  /** Total payment amount in token units. */
  amount: bigint;
  /** Unix timestamp when the payment expires. */
  expiration: bigint;
  /** True once the payment has been confirmed on-chain. */
  isConfirmed: boolean;
  /** True if the payment was processed as a crypto payment. */
  isCryptoPayment: boolean;
  /** Total number of line items in this payment. */
  lineItemCount: bigint;
  /** ERC-20 token address used for payment. */
  paymentToken: Address;
  /** Snapshot of all line items with their configuration. */
  lineItems: readonly PaymentLineItem[];
  /** External fee entries associated with this payment. */
  externalFees: readonly ExternalFees[];
}

/** EIP-2612 permit parameters for off-chain token approvals. */
export interface PermitParams {
  /** Token owner granting the permit. */
  owner: Address;
  /** Spender being approved. */
  spender: Address;
  /** Amount approved. */
  value: bigint;
  /** Permit expiry timestamp. */
  deadline: bigint;
  /** Signature v component. */
  v: number;
  /** Signature r component. */
  r: Hex;
  /** Signature s component. */
  s: Hex;
}

/**
 * Return type for getLineItemType / getPlatformLineItemType.
 * Reflects the on-chain struct stored per platform-scoped type ID.
 */
export interface LineItemTypeInfo {
  /** True if the line item type is registered. */
  exists: boolean;
  /** Human-readable label. */
  label: string;
  /** True if amounts of this type count toward the funding goal. */
  countsTowardGoal: boolean;
  /** True if the protocol fee applies to this type. */
  applyProtocolFee: boolean;
  /** True if backers can claim refunds for this type. */
  canRefund: boolean;
  /** True if funds are transferred immediately on confirmation. */
  instantTransfer: boolean;
}

/** Return type for CampaignInfo.getCampaignConfig. */
export interface CampaignConfig {
  /** Address of the TreasuryFactory used to deploy treasuries. */
  treasuryFactory: Address;
  /** Protocol fee percent in basis points. */
  protocolFeePercent: bigint;
  /** bytes32 identifier hash for this campaign. */
  identifierHash: Hex;
}
