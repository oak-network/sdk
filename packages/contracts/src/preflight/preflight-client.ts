import type { Address, Hex } from "viem";
import type {
  OakContractsClient,
  PublicOakContractsClientConfig,
  CreateCampaignParams,
  CampaignData,
  KeepWhatsRaisedConfig,
  KeepWhatsRaisedFeeKeys,
  KeepWhatsRaisedFeeValues,
  TieredReward,
  LineItem,
  ExternalFees,
} from "../types/index.js";
import type {
  PreflightOptions,
  PreflightResult,
  ResolvedPreflightOptions,
  PreflightContext,
  MethodValidator,
} from "./types.js";
import { runPreflight } from "./pipeline.js";
import { createStateReader } from "./state-reader.js";
import { createCampaignValidator } from "./validators/campaign-info-factory.js";
import { deployValidator, type DeployInput } from "./validators/treasury-factory.js";
import {
  createPaymentValidator,
  createPaymentBatchValidator,
  confirmPaymentValidator,
  confirmPaymentBatchValidator,
  processCryptoPaymentValidator,
  cancelPaymentValidator,
  ptWithdrawValidator,
  ptClaimRefundValidator,
  ptClaimRefundSelfValidator,
  ptClaimExpiredFundsValidator,
  ptDisburseFeesValidator,
  ptClaimNonGoalLineItemsValidator,
  type CreatePaymentInput,
  type CreatePaymentBatchInput,
  type ConfirmPaymentInput,
  type ConfirmPaymentBatchInput,
  type ProcessCryptoPaymentInput,
  type CancelPaymentInput,
  type PtWithdrawInput,
  type PtClaimRefundInput,
  type PtClaimRefundSelfInput,
  type PtClaimExpiredFundsInput,
  type PtDisburseFeesInput,
  type PtClaimNonGoalLineItemsInput,
} from "./validators/payment-treasury.js";
import {
  aonPledgeForARewardValidator,
  aonPledgeWithoutARewardValidator,
  addRewardsValidator,
  aonWithdrawValidator,
  aonClaimRefundValidator,
  aonDisburseFeesValidator,
  type AonPledgeForARewardInput,
  type AonPledgeWithoutARewardInput,
  type AddRewardsInput,
  type AonWithdrawInput,
  type AonClaimRefundInput,
  type AonDisburseFeesInput,
} from "./validators/all-or-nothing.js";
import {
  configureTreasuryValidator,
  kwrPledgeForARewardValidator,
  kwrPledgeWithoutARewardValidator,
  setFeeAndPledgeValidator,
  kwrClaimRefundValidator,
  kwrClaimTipValidator,
  kwrClaimFundValidator,
  kwrDisburseFeesValidator,
  type ConfigureTreasuryInput,
  type KwrPledgeForARewardInput,
  type KwrPledgeWithoutARewardInput,
  type SetFeeAndPledgeInput,
  type KwrClaimRefundInput,
  type KwrClaimTipInput,
  type KwrClaimFundInput,
  type KwrDisburseFeesInput,
} from "./validators/keep-whats-raised.js";

// ─── Config ────────────────────────────────────────────────────────────────────

/**
 * Configuration for creating a preflight client.
 *
 * @param globalParamsAddress - Address of the GlobalParams contract (required for most validators)
 * @param defaultOptions - Default preflight options applied to all calls
 */
export interface PreflightClientConfig {
  globalParamsAddress: Address;
  defaultOptions?: PreflightOptions;
}

// ─── Preflight entity interfaces ───────────────────────────────────────────────

/** CampaignInfoFactory entity with preflight validation on createCampaign. */
export interface PreflightCampaignInfoFactoryEntity {
  createCampaign: {
    (params: CreateCampaignParams): Promise<Hex>;
    preflight(params: CreateCampaignParams, options?: PreflightOptions): Promise<PreflightResult<CreateCampaignParams>>;
  };
  identifierToCampaignInfo(identifierHash: Hex): Promise<Address>;
  isValidCampaignInfo(campaignInfo: Address): Promise<boolean>;
  owner(): Promise<Address>;
  updateImplementation(newImplementation: Address): Promise<Hex>;
  transferOwnership(newOwner: Address): Promise<Hex>;
  renounceOwnership(): Promise<Hex>;
}

/** TreasuryFactory entity with preflight validation on deploy. */
export interface PreflightTreasuryFactoryEntity {
  deploy: {
    (platformHash: Hex, infoAddress: Address, implementationId: bigint): Promise<Hex>;
    preflight(input: DeployInput, options?: PreflightOptions): Promise<PreflightResult<DeployInput>>;
  };
  registerTreasuryImplementation(platformHash: Hex, implementationId: bigint, implementation: Address): Promise<Hex>;
  approveTreasuryImplementation(platformHash: Hex, implementationId: bigint): Promise<Hex>;
  disapproveTreasuryImplementation(implementation: Address): Promise<Hex>;
  removeTreasuryImplementation(platformHash: Hex, implementationId: bigint): Promise<Hex>;
}

/** PaymentTreasury entity with preflight validation on payment methods. */
export interface PreflightPaymentTreasuryEntity {
  createPayment: {
    (paymentId: Hex, buyerId: Hex, itemId: Hex, paymentToken: Address, amount: bigint, expiration: bigint, lineItems: readonly LineItem[], externalFees: readonly ExternalFees[]): Promise<Hex>;
    preflight(input: CreatePaymentInput, options?: PreflightOptions): Promise<PreflightResult<CreatePaymentInput>>;
  };
  createPaymentBatch: {
    (paymentIds: readonly Hex[], buyerIds: readonly Hex[], itemIds: readonly Hex[], paymentTokens: readonly Address[], amounts: readonly bigint[], expirations: readonly bigint[], lineItemsArray: readonly (readonly LineItem[])[], externalFeesArray: readonly (readonly ExternalFees[])[]): Promise<Hex>;
    preflight(input: CreatePaymentBatchInput, options?: PreflightOptions): Promise<PreflightResult<CreatePaymentBatchInput>>;
  };
  confirmPayment: {
    (paymentId: Hex, buyerAddress: Address): Promise<Hex>;
    preflight(input: ConfirmPaymentInput, options?: PreflightOptions): Promise<PreflightResult<ConfirmPaymentInput>>;
  };
  confirmPaymentBatch: {
    (paymentIds: readonly Hex[], buyerAddresses: readonly Address[]): Promise<Hex>;
    preflight(input: ConfirmPaymentBatchInput, options?: PreflightOptions): Promise<PreflightResult<ConfirmPaymentBatchInput>>;
  };
  processCryptoPayment: {
    (paymentId: Hex, itemId: Hex, buyerAddress: Address, paymentToken: Address, amount: bigint, lineItems: readonly LineItem[], externalFees: readonly ExternalFees[]): Promise<Hex>;
    preflight(input: ProcessCryptoPaymentInput, options?: PreflightOptions): Promise<PreflightResult<ProcessCryptoPaymentInput>>;
  };
  cancelPayment: {
    (paymentId: Hex): Promise<Hex>;
    preflight(input: CancelPaymentInput, options?: PreflightOptions): Promise<PreflightResult<CancelPaymentInput>>;
  };
  withdraw: {
    (): Promise<Hex>;
    preflight(input: PtWithdrawInput, options?: PreflightOptions): Promise<PreflightResult<PtWithdrawInput>>;
  };
  claimRefund: {
    (paymentId: Hex, refundAddress: Address): Promise<Hex>;
    preflight(input: PtClaimRefundInput, options?: PreflightOptions): Promise<PreflightResult<PtClaimRefundInput>>;
  };
  claimRefundSelf: {
    (paymentId: Hex): Promise<Hex>;
    preflight(input: PtClaimRefundSelfInput, options?: PreflightOptions): Promise<PreflightResult<PtClaimRefundSelfInput>>;
  };
  claimExpiredFunds: {
    (): Promise<Hex>;
    preflight(input: PtClaimExpiredFundsInput, options?: PreflightOptions): Promise<PreflightResult<PtClaimExpiredFundsInput>>;
  };
  disburseFees: {
    (): Promise<Hex>;
    preflight(input: PtDisburseFeesInput, options?: PreflightOptions): Promise<PreflightResult<PtDisburseFeesInput>>;
  };
  claimNonGoalLineItems: {
    (token: Address): Promise<Hex>;
    preflight(input: PtClaimNonGoalLineItemsInput, options?: PreflightOptions): Promise<PreflightResult<PtClaimNonGoalLineItemsInput>>;
  };
  // Passthrough reads
  getplatformHash(): Promise<Hex>;
  getplatformFeePercent(): Promise<bigint>;
  getRaisedAmount(): Promise<bigint>;
  getAvailableRaisedAmount(): Promise<bigint>;
  getLifetimeRaisedAmount(): Promise<bigint>;
  getRefundedAmount(): Promise<bigint>;
  getExpectedAmount(): Promise<bigint>;
  cancelled(): Promise<boolean>;
}

/** AllOrNothing entity with preflight validation on pledge and settlement methods. */
export interface PreflightAllOrNothingTreasuryEntity {
  pledgeForAReward: {
    (backer: Address, pledgeToken: Address, shippingFee: bigint, rewardNames: readonly Hex[]): Promise<Hex>;
    preflight(input: AonPledgeForARewardInput, options?: PreflightOptions): Promise<PreflightResult<AonPledgeForARewardInput>>;
  };
  pledgeWithoutAReward: {
    (backer: Address, pledgeToken: Address, pledgeAmount: bigint): Promise<Hex>;
    preflight(input: AonPledgeWithoutARewardInput, options?: PreflightOptions): Promise<PreflightResult<AonPledgeWithoutARewardInput>>;
  };
  addRewards: {
    (rewardNames: readonly Hex[], rewards: readonly TieredReward[]): Promise<Hex>;
    preflight(input: AddRewardsInput, options?: PreflightOptions): Promise<PreflightResult<AddRewardsInput>>;
  };
  withdraw: {
    (): Promise<Hex>;
    preflight(input: AonWithdrawInput, options?: PreflightOptions): Promise<PreflightResult<AonWithdrawInput>>;
  };
  claimRefund: {
    (tokenId: bigint): Promise<Hex>;
    preflight(input: AonClaimRefundInput, options?: PreflightOptions): Promise<PreflightResult<AonClaimRefundInput>>;
  };
  disburseFees: {
    (): Promise<Hex>;
    preflight(input: AonDisburseFeesInput, options?: PreflightOptions): Promise<PreflightResult<AonDisburseFeesInput>>;
  };
  // Passthrough reads
  getRaisedAmount(): Promise<bigint>;
  getLifetimeRaisedAmount(): Promise<bigint>;
  getRefundedAmount(): Promise<bigint>;
  getPlatformHash(): Promise<Hex>;
  getPlatformFeePercent(): Promise<bigint>;
  paused(): Promise<boolean>;
}

/** KeepWhatsRaised entity with preflight validation on configure, pledge, and settlement methods. */
export interface PreflightKeepWhatsRaisedTreasuryEntity {
  configureTreasury: {
    (config: KeepWhatsRaisedConfig, campaignData: CampaignData, feeKeys: KeepWhatsRaisedFeeKeys, feeValues: KeepWhatsRaisedFeeValues): Promise<Hex>;
    preflight(input: ConfigureTreasuryInput, options?: PreflightOptions): Promise<PreflightResult<ConfigureTreasuryInput>>;
  };
  pledgeForAReward: {
    (pledgeId: Hex, backer: Address, pledgeToken: Address, tip: bigint, rewardNames: readonly Hex[]): Promise<Hex>;
    preflight(input: KwrPledgeForARewardInput, options?: PreflightOptions): Promise<PreflightResult<KwrPledgeForARewardInput>>;
  };
  pledgeWithoutAReward: {
    (pledgeId: Hex, backer: Address, pledgeToken: Address, pledgeAmount: bigint, tip: bigint): Promise<Hex>;
    preflight(input: KwrPledgeWithoutARewardInput, options?: PreflightOptions): Promise<PreflightResult<KwrPledgeWithoutARewardInput>>;
  };
  addRewards: {
    (rewardNames: readonly Hex[], rewards: readonly TieredReward[]): Promise<Hex>;
    preflight(input: AddRewardsInput, options?: PreflightOptions): Promise<PreflightResult<AddRewardsInput>>;
  };
  setFeeAndPledge: {
    (pledgeId: Hex, backer: Address, pledgeToken: Address, pledgeAmount: bigint, tip: bigint, fee: bigint, reward: readonly Hex[], isPledgeForAReward: boolean): Promise<Hex>;
    preflight(input: SetFeeAndPledgeInput, options?: PreflightOptions): Promise<PreflightResult<SetFeeAndPledgeInput>>;
  };
  claimRefund: {
    (tokenId: bigint): Promise<Hex>;
    preflight(input: KwrClaimRefundInput, options?: PreflightOptions): Promise<PreflightResult<KwrClaimRefundInput>>;
  };
  claimTip: {
    (): Promise<Hex>;
    preflight(input: KwrClaimTipInput, options?: PreflightOptions): Promise<PreflightResult<KwrClaimTipInput>>;
  };
  claimFund: {
    (): Promise<Hex>;
    preflight(input: KwrClaimFundInput, options?: PreflightOptions): Promise<PreflightResult<KwrClaimFundInput>>;
  };
  disburseFees: {
    (): Promise<Hex>;
    preflight(input: KwrDisburseFeesInput, options?: PreflightOptions): Promise<PreflightResult<KwrDisburseFeesInput>>;
  };
  // Passthrough reads
  getRaisedAmount(): Promise<bigint>;
  getLifetimeRaisedAmount(): Promise<bigint>;
  getRefundedAmount(): Promise<bigint>;
  getAvailableRaisedAmount(): Promise<bigint>;
  getPlatformHash(): Promise<Hex>;
  getPlatformFeePercent(): Promise<bigint>;
  paused(): Promise<boolean>;
  getLaunchTime(): Promise<bigint>;
  getDeadline(): Promise<bigint>;
  getGoalAmount(): Promise<bigint>;
}

/** The preflight-enabled Oak contracts client. */
export interface PreflightOakContractsClient {
  readonly config: PublicOakContractsClientConfig;
  campaignInfoFactory(address: Address): PreflightCampaignInfoFactoryEntity;
  treasuryFactory(address: Address): PreflightTreasuryFactoryEntity;
  paymentTreasury(address: Address, infoAddress: Address): PreflightPaymentTreasuryEntity;
  allOrNothingTreasury(address: Address, infoAddress: Address): PreflightAllOrNothingTreasuryEntity;
  keepWhatsRaisedTreasury(address: Address, infoAddress: Address): PreflightKeepWhatsRaisedTreasuryEntity;
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

function resolveOptions(defaults: PreflightOptions | undefined, overrides: PreflightOptions | undefined): ResolvedPreflightOptions {
  return {
    mode: overrides?.mode ?? defaults?.mode ?? "warn",
    stateful: overrides?.stateful ?? defaults?.stateful ?? "enabled",
    collect: overrides?.collect ?? defaults?.collect ?? true,
    blockTag: overrides?.blockTag ?? defaults?.blockTag ?? "latest",
    effectiveSender: overrides?.effectiveSender ?? defaults?.effectiveSender,
  };
}

function buildContext(
  client: OakContractsClient,
  contractAddress: Address,
  options: ResolvedPreflightOptions,
  addresses: Record<string, Address>,
): PreflightContext {
  const stateReader = createStateReader(client.publicClient, options.blockTag);

  // Auto-derive sender from walletClient if not explicitly provided
  const resolvedOptions = options.effectiveSender
    ? options
    : {
        ...options,
        effectiveSender: client.walletClient.account?.address,
      };

  return {
    publicClient: client.publicClient,
    contractAddress,
    options: resolvedOptions,
    stateReader,
    addresses,
  };
}

function createPreflightFn<TInput>(
  client: OakContractsClient,
  contractAddress: Address,
  validator: MethodValidator<TInput>,
  defaultOptions: PreflightOptions | undefined,
  addresses: Record<string, Address>,
): (input: TInput, options?: PreflightOptions) => Promise<PreflightResult<TInput>> {
  return async (input: TInput, options?: PreflightOptions): Promise<PreflightResult<TInput>> => {
    const resolved = resolveOptions(defaultOptions, options);
    const ctx = buildContext(client, contractAddress, resolved, addresses);
    return runPreflight(input, validator, ctx);
  };
}

// ─── Factory ───────────────────────────────────────────────────────────────────

/**
 * Creates a preflight-enabled Oak contracts client that wraps an existing client.
 * Write methods gain `.preflight()` for input validation before submission.
 *
 * @param client - The base OakContractsClient to wrap
 * @param config - Preflight configuration (globalParamsAddress, default options)
 * @returns PreflightOakContractsClient with validation capabilities
 *
 * @example
 * ```typescript
 * const oak = createOakContractsClient({ chainId, rpcUrl, privateKey });
 * const preflight = createPreflightClient(oak, { globalParamsAddress: GP_ADDR });
 *
 * const factory = preflight.campaignInfoFactory(FACTORY_ADDR);
 * const result = await factory.createCampaign.preflight(params);
 * if (result.ok) {
 *   const txHash = await factory.createCampaign(params);
 * }
 * ```
 */
export function createPreflightClient(
  client: OakContractsClient,
  config: PreflightClientConfig,
): PreflightOakContractsClient {
  const { globalParamsAddress, defaultOptions } = config;

  return {
    config: client.config,

    campaignInfoFactory(address: Address): PreflightCampaignInfoFactoryEntity {
      const entity = client.campaignInfoFactory(address);
      const addresses = { globalParams: globalParamsAddress };

      const createCampaign = Object.assign(
        (params: CreateCampaignParams) => entity.createCampaign(params),
        {
          preflight: createPreflightFn(client, address, createCampaignValidator, defaultOptions, addresses),
        },
      );

      return {
        createCampaign,
        identifierToCampaignInfo: (h) => entity.identifierToCampaignInfo(h),
        isValidCampaignInfo: (a) => entity.isValidCampaignInfo(a),
        owner: () => entity.owner(),
        updateImplementation: (a) => entity.updateImplementation(a),
        transferOwnership: (a) => entity.transferOwnership(a),
        renounceOwnership: () => entity.renounceOwnership(),
      };
    },

    treasuryFactory(address: Address): PreflightTreasuryFactoryEntity {
      const entity = client.treasuryFactory(address);
      const addresses = { globalParams: globalParamsAddress };

      const deploy = Object.assign(
        (platformHash: Hex, infoAddress: Address, implementationId: bigint) =>
          entity.deploy(platformHash, infoAddress, implementationId),
        {
          preflight: createPreflightFn(client, address, deployValidator, defaultOptions, addresses),
        },
      );

      return {
        deploy,
        registerTreasuryImplementation: (p, i, impl) => entity.registerTreasuryImplementation(p, i, impl),
        approveTreasuryImplementation: (p, i) => entity.approveTreasuryImplementation(p, i),
        disapproveTreasuryImplementation: (impl) => entity.disapproveTreasuryImplementation(impl),
        removeTreasuryImplementation: (p, i) => entity.removeTreasuryImplementation(p, i),
      };
    },

    paymentTreasury(address: Address, infoAddress: Address): PreflightPaymentTreasuryEntity {
      const entity = client.paymentTreasury(address);
      const addresses = { globalParams: globalParamsAddress, infoAddress };

      const createPayment = Object.assign(
        (paymentId: Hex, buyerId: Hex, itemId: Hex, paymentToken: Address, amount: bigint, expiration: bigint, lineItems: readonly LineItem[], externalFees: readonly ExternalFees[]) =>
          entity.createPayment(paymentId, buyerId, itemId, paymentToken, amount, expiration, lineItems, externalFees),
        {
          preflight: createPreflightFn(client, address, createPaymentValidator, defaultOptions, addresses),
        },
      );

      const createPaymentBatch = Object.assign(
        (paymentIds: readonly Hex[], buyerIds: readonly Hex[], itemIds: readonly Hex[], paymentTokens: readonly Address[], amounts: readonly bigint[], expirations: readonly bigint[], lineItemsArray: readonly (readonly LineItem[])[], externalFeesArray: readonly (readonly ExternalFees[])[]) =>
          entity.createPaymentBatch(paymentIds, buyerIds, itemIds, paymentTokens, amounts, expirations, lineItemsArray, externalFeesArray),
        {
          preflight: createPreflightFn(client, address, createPaymentBatchValidator, defaultOptions, addresses),
        },
      );

      const confirmPayment = Object.assign(
        (paymentId: Hex, buyerAddress: Address) => entity.confirmPayment(paymentId, buyerAddress),
        {
          preflight: createPreflightFn(client, address, confirmPaymentValidator, defaultOptions, addresses),
        },
      );

      const confirmPaymentBatch = Object.assign(
        (paymentIds: readonly Hex[], buyerAddresses: readonly Address[]) =>
          entity.confirmPaymentBatch(paymentIds, buyerAddresses),
        {
          preflight: createPreflightFn(client, address, confirmPaymentBatchValidator, defaultOptions, addresses),
        },
      );

      const processCryptoPayment = Object.assign(
        (paymentId: Hex, itemId: Hex, buyerAddress: Address, paymentToken: Address, amount: bigint, lineItems: readonly LineItem[], externalFees: readonly ExternalFees[]) =>
          entity.processCryptoPayment(paymentId, itemId, buyerAddress, paymentToken, amount, lineItems, externalFees),
        {
          preflight: createPreflightFn(client, address, processCryptoPaymentValidator, defaultOptions, addresses),
        },
      );

      const cancelPayment = Object.assign(
        (paymentId: Hex) => entity.cancelPayment(paymentId),
        { preflight: createPreflightFn(client, address, cancelPaymentValidator, defaultOptions, addresses) },
      );

      const withdraw = Object.assign(
        () => entity.withdraw(),
        { preflight: createPreflightFn(client, address, ptWithdrawValidator, defaultOptions, addresses) },
      );

      const claimRefund = Object.assign(
        (paymentId: Hex, refundAddress: Address) => entity.claimRefund(paymentId, refundAddress),
        { preflight: createPreflightFn(client, address, ptClaimRefundValidator, defaultOptions, addresses) },
      );

      const claimRefundSelf = Object.assign(
        (paymentId: Hex) => entity.claimRefundSelf(paymentId),
        { preflight: createPreflightFn(client, address, ptClaimRefundSelfValidator, defaultOptions, addresses) },
      );

      const claimExpiredFunds = Object.assign(
        () => entity.claimExpiredFunds(),
        { preflight: createPreflightFn(client, address, ptClaimExpiredFundsValidator, defaultOptions, addresses) },
      );

      const disburseFees = Object.assign(
        () => entity.disburseFees(),
        { preflight: createPreflightFn(client, address, ptDisburseFeesValidator, defaultOptions, addresses) },
      );

      const claimNonGoalLineItems = Object.assign(
        (token: Address) => entity.claimNonGoalLineItems(token),
        { preflight: createPreflightFn(client, address, ptClaimNonGoalLineItemsValidator, defaultOptions, addresses) },
      );

      return {
        createPayment,
        createPaymentBatch,
        confirmPayment,
        confirmPaymentBatch,
        processCryptoPayment,
        cancelPayment,
        withdraw,
        claimRefund,
        claimRefundSelf,
        claimExpiredFunds,
        disburseFees,
        claimNonGoalLineItems,
        getplatformHash: () => entity.getplatformHash(),
        getplatformFeePercent: () => entity.getplatformFeePercent(),
        getRaisedAmount: () => entity.getRaisedAmount(),
        getAvailableRaisedAmount: () => entity.getAvailableRaisedAmount(),
        getLifetimeRaisedAmount: () => entity.getLifetimeRaisedAmount(),
        getRefundedAmount: () => entity.getRefundedAmount(),
        getExpectedAmount: () => entity.getExpectedAmount(),
        cancelled: () => entity.cancelled(),
      };
    },

    allOrNothingTreasury(address: Address, infoAddress: Address): PreflightAllOrNothingTreasuryEntity {
      const entity = client.allOrNothingTreasury(address);
      const addresses = { globalParams: globalParamsAddress, infoAddress };

      const pledgeForAReward = Object.assign(
        (backer: Address, pledgeToken: Address, shippingFee: bigint, rewardNames: readonly Hex[]) =>
          entity.pledgeForAReward(backer, pledgeToken, shippingFee, rewardNames),
        {
          preflight: createPreflightFn(client, address, aonPledgeForARewardValidator, defaultOptions, addresses),
        },
      );

      const pledgeWithoutAReward = Object.assign(
        (backer: Address, pledgeToken: Address, pledgeAmount: bigint) =>
          entity.pledgeWithoutAReward(backer, pledgeToken, pledgeAmount),
        {
          preflight: createPreflightFn(client, address, aonPledgeWithoutARewardValidator, defaultOptions, addresses),
        },
      );

      const addRewards = Object.assign(
        (rewardNames: readonly Hex[], rewards: readonly TieredReward[]) =>
          entity.addRewards(rewardNames, rewards),
        { preflight: createPreflightFn(client, address, addRewardsValidator, defaultOptions, addresses) },
      );

      const aonWithdraw = Object.assign(
        () => entity.withdraw(),
        { preflight: createPreflightFn(client, address, aonWithdrawValidator, defaultOptions, addresses) },
      );

      const claimRefund = Object.assign(
        (tokenId: bigint) => entity.claimRefund(tokenId),
        { preflight: createPreflightFn(client, address, aonClaimRefundValidator, defaultOptions, addresses) },
      );

      const disburseFees = Object.assign(
        () => entity.disburseFees(),
        { preflight: createPreflightFn(client, address, aonDisburseFeesValidator, defaultOptions, addresses) },
      );

      return {
        pledgeForAReward,
        pledgeWithoutAReward,
        addRewards,
        withdraw: aonWithdraw,
        claimRefund,
        disburseFees,
        getRaisedAmount: () => entity.getRaisedAmount(),
        getLifetimeRaisedAmount: () => entity.getLifetimeRaisedAmount(),
        getRefundedAmount: () => entity.getRefundedAmount(),
        getPlatformHash: () => entity.getPlatformHash(),
        getPlatformFeePercent: () => entity.getPlatformFeePercent(),
        paused: () => entity.paused(),
      };
    },

    keepWhatsRaisedTreasury(address: Address, infoAddress: Address): PreflightKeepWhatsRaisedTreasuryEntity {
      const entity = client.keepWhatsRaisedTreasury(address);
      const addresses = { globalParams: globalParamsAddress, infoAddress };

      const configureTreasury = Object.assign(
        (config: KeepWhatsRaisedConfig, campaignData: CampaignData, feeKeys: KeepWhatsRaisedFeeKeys, feeValues: KeepWhatsRaisedFeeValues) =>
          entity.configureTreasury(config, campaignData, feeKeys, feeValues),
        {
          preflight: createPreflightFn(client, address, configureTreasuryValidator, defaultOptions, addresses),
        },
      );

      const pledgeForAReward = Object.assign(
        (pledgeId: Hex, backer: Address, pledgeToken: Address, tip: bigint, rewardNames: readonly Hex[]) =>
          entity.pledgeForAReward(pledgeId, backer, pledgeToken, tip, rewardNames),
        {
          preflight: createPreflightFn(client, address, kwrPledgeForARewardValidator, defaultOptions, addresses),
        },
      );

      const pledgeWithoutAReward = Object.assign(
        (pledgeId: Hex, backer: Address, pledgeToken: Address, pledgeAmount: bigint, tip: bigint) =>
          entity.pledgeWithoutAReward(pledgeId, backer, pledgeToken, pledgeAmount, tip),
        {
          preflight: createPreflightFn(client, address, kwrPledgeWithoutARewardValidator, defaultOptions, addresses),
        },
      );

      const addRewards = Object.assign(
        (rewardNames: readonly Hex[], rewards: readonly TieredReward[]) =>
          entity.addRewards(rewardNames, rewards),
        { preflight: createPreflightFn(client, address, addRewardsValidator, defaultOptions, addresses) },
      );

      const setFeeAndPledge = Object.assign(
        (pledgeId: Hex, backer: Address, pledgeToken: Address, pledgeAmount: bigint, tip: bigint, fee: bigint, reward: readonly Hex[], isPledgeForAReward: boolean) =>
          entity.setFeeAndPledge(pledgeId, backer, pledgeToken, pledgeAmount, tip, fee, reward, isPledgeForAReward),
        { preflight: createPreflightFn(client, address, setFeeAndPledgeValidator, defaultOptions, addresses) },
      );

      const claimRefund = Object.assign(
        (tokenId: bigint) => entity.claimRefund(tokenId),
        { preflight: createPreflightFn(client, address, kwrClaimRefundValidator, defaultOptions, addresses) },
      );

      const claimTip = Object.assign(
        () => entity.claimTip(),
        { preflight: createPreflightFn(client, address, kwrClaimTipValidator, defaultOptions, addresses) },
      );

      const claimFund = Object.assign(
        () => entity.claimFund(),
        { preflight: createPreflightFn(client, address, kwrClaimFundValidator, defaultOptions, addresses) },
      );

      const disburseFees = Object.assign(
        () => entity.disburseFees(),
        { preflight: createPreflightFn(client, address, kwrDisburseFeesValidator, defaultOptions, addresses) },
      );

      return {
        configureTreasury,
        pledgeForAReward,
        pledgeWithoutAReward,
        addRewards,
        setFeeAndPledge,
        claimRefund,
        claimTip,
        claimFund,
        disburseFees,
        getRaisedAmount: () => entity.getRaisedAmount(),
        getLifetimeRaisedAmount: () => entity.getLifetimeRaisedAmount(),
        getRefundedAmount: () => entity.getRefundedAmount(),
        getAvailableRaisedAmount: () => entity.getAvailableRaisedAmount(),
        getPlatformHash: () => entity.getPlatformHash(),
        getPlatformFeePercent: () => entity.getPlatformFeePercent(),
        paused: () => entity.paused(),
        getLaunchTime: () => entity.getLaunchTime(),
        getDeadline: () => entity.getDeadline(),
        getGoalAmount: () => entity.getGoalAmount(),
      };
    },
  };
}
