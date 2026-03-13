import type { Address, Hex } from "../lib";

/** Shape of campaign data passed to createCampaign (matches ICampaignData.CampaignData). */
export interface CreateCampaignData {
  /** Unix launch timestamp in seconds. */
  launchTime: bigint;
  /** Unix deadline timestamp in seconds. */
  deadline: bigint;
  /** Funding goal in currency units. */
  goalAmount: bigint;
  /** bytes32 currency identifier. */
  currency: Hex;
}

/** Input parameters for CampaignInfoFactory.createCampaign. */
export interface CreateCampaignParams {
  /** Address of the campaign creator. */
  creator: Address;
  /** bytes32 unique campaign identifier hash. */
  identifierHash: Hex;
  /** Platform hashes selected for this campaign. */
  selectedPlatformHash: readonly Hex[];
  /** Optional platform-specific data keys (parallel array with platformDataValue). */
  platformDataKey?: readonly Hex[];
  /** Optional platform-specific data values (parallel array with platformDataKey). */
  platformDataValue?: readonly Hex[];
  /** On-chain campaign data struct. */
  campaignData: CreateCampaignData;
  /** ERC-721 collection name for pledge NFTs. */
  nftName: string;
  /** ERC-721 collection symbol for pledge NFTs. */
  nftSymbol: string;
  /** IPFS or HTTPS URI for the NFT image. */
  nftImageURI: string;
  /** IPFS or HTTPS URI for the ERC-721 contract metadata. */
  contractURI: string;
}

/** Config struct for KeepWhatsRaised.configureTreasury. */
export interface KeepWhatsRaisedConfig {
  /** Minimum withdrawal amount exempt from the withdrawal fee. */
  minimumWithdrawalForFeeExemption: bigint;
  /** Delay in seconds between approveWithdrawal and actual withdrawal. */
  withdrawalDelay: bigint;
  /** Delay in seconds before backers can claim refunds. */
  refundDelay: bigint;
  /** Seconds after configuration during which config is locked. */
  configLockPeriod: bigint;
  /** True if the creator qualifies for Colombian creator tax treatment. */
  isColombianCreator: boolean;
}

/** FeeKeys struct for KeepWhatsRaised.configureTreasury. */
export interface KeepWhatsRaisedFeeKeys {
  /** Registry key for the flat withdrawal fee. */
  flatFeeKey: Hex;
  /** Registry key for the cumulative flat fee cap. */
  cumulativeFlatFeeKey: Hex;
  /** Registry keys for gross percentage fees (one per tier). */
  grossPercentageFeeKeys: readonly Hex[];
}

/** FeeValues struct for KeepWhatsRaised.configureTreasury. */
export interface KeepWhatsRaisedFeeValues {
  /** Flat fee amount in token units. */
  flatFeeValue: bigint;
  /** Cumulative flat fee cap in token units. */
  cumulativeFlatFeeValue: bigint;
  /** Gross percentage fee values (one per key in grossPercentageFeeKeys). */
  grossPercentageFeeValues: readonly bigint[];
}
