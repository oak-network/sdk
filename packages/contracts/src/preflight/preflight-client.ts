import type { Address, Hex } from "viem";
import type {
  OakContractsClient,
  PublicOakContractsClientConfig,
  CreateCampaignParams,
  CampaignData,
  KeepWhatsRaisedConfig,
  KeepWhatsRaisedFeeKeys,
  KeepWhatsRaisedFeeValues,
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
  type CreatePaymentInput,
  type CreatePaymentBatchInput,
  type ConfirmPaymentInput,
  type ConfirmPaymentBatchInput,
  type ProcessCryptoPaymentInput,
} from "./validators/payment-treasury.js";
import {
  aonPledgeForARewardValidator,
  aonPledgeWithoutARewardValidator,
  type AonPledgeForARewardInput,
  type AonPledgeWithoutARewardInput,
} from "./validators/all-or-nothing.js";
import {
  configureTreasuryValidator,
  kwrPledgeForARewardValidator,
  kwrPledgeWithoutARewardValidator,
  type ConfigureTreasuryInput,
  type KwrPledgeForARewardInput,
  type KwrPledgeWithoutARewardInput,
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

/** AllOrNothing entity with preflight validation on pledge methods. */
export interface PreflightAllOrNothingTreasuryEntity {
  pledgeForAReward: {
    (backer: Address, pledgeToken: Address, shippingFee: bigint, rewardNames: readonly Hex[]): Promise<Hex>;
    preflight(input: AonPledgeForARewardInput, options?: PreflightOptions): Promise<PreflightResult<AonPledgeForARewardInput>>;
  };
  pledgeWithoutAReward: {
    (backer: Address, pledgeToken: Address, pledgeAmount: bigint): Promise<Hex>;
    preflight(input: AonPledgeWithoutARewardInput, options?: PreflightOptions): Promise<PreflightResult<AonPledgeWithoutARewardInput>>;
  };
  // Passthrough reads
  getRaisedAmount(): Promise<bigint>;
  getLifetimeRaisedAmount(): Promise<bigint>;
  getRefundedAmount(): Promise<bigint>;
  getPlatformHash(): Promise<Hex>;
  getplatformFeePercent(): Promise<bigint>;
  paused(): Promise<boolean>;
}

/** KeepWhatsRaised entity with preflight validation on configure and pledge methods. */
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
  // Passthrough reads
  getRaisedAmount(): Promise<bigint>;
  getLifetimeRaisedAmount(): Promise<bigint>;
  getRefundedAmount(): Promise<bigint>;
  getAvailableRaisedAmount(): Promise<bigint>;
  getPlatformHash(): Promise<Hex>;
  getplatformFeePercent(): Promise<bigint>;
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
  return {
    publicClient: client.publicClient,
    contractAddress,
    options,
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

      return {
        createPayment,
        createPaymentBatch,
        confirmPayment,
        confirmPaymentBatch,
        processCryptoPayment,
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

      return {
        pledgeForAReward,
        pledgeWithoutAReward,
        getRaisedAmount: () => entity.getRaisedAmount(),
        getLifetimeRaisedAmount: () => entity.getLifetimeRaisedAmount(),
        getRefundedAmount: () => entity.getRefundedAmount(),
        getPlatformHash: () => entity.getPlatformHash(),
        getplatformFeePercent: () => entity.getplatformFeePercent(),
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

      return {
        configureTreasury,
        pledgeForAReward,
        pledgeWithoutAReward,
        getRaisedAmount: () => entity.getRaisedAmount(),
        getLifetimeRaisedAmount: () => entity.getLifetimeRaisedAmount(),
        getRefundedAmount: () => entity.getRefundedAmount(),
        getAvailableRaisedAmount: () => entity.getAvailableRaisedAmount(),
        getPlatformHash: () => entity.getPlatformHash(),
        getplatformFeePercent: () => entity.getplatformFeePercent(),
        paused: () => entity.paused(),
        getLaunchTime: () => entity.getLaunchTime(),
        getDeadline: () => entity.getDeadline(),
        getGoalAmount: () => entity.getGoalAmount(),
      };
    },
  };
}
