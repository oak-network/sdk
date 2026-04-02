import type { Address, Hex } from "../lib";
import type {
  OakContractsClient,
  OakContractsClientConfig,
  PublicOakContractsClientConfig,
  TransactionReceipt,
  GlobalParamsEntity,
  CampaignInfoFactoryEntity,
  TreasuryFactoryEntity,
  CampaignInfoEntity,
  PaymentTreasuryEntity,
  AllOrNothingTreasuryEntity,
  KeepWhatsRaisedTreasuryEntity,
  ItemRegistryEntity,
} from "./types";
import { DEFAULT_CLIENT_OPTIONS, type OakContractsClientOptions, type EntitySignerOptions } from "./types";
import { multicall } from "../utils/multicall";
import { buildClients } from "./resolve";
import { createGlobalParamsEntity } from "../contracts/global-params";
import { createCampaignInfoFactoryEntity } from "../contracts/campaign-info-factory";
import { createTreasuryFactoryEntity } from "../contracts/treasury-factory";
import { createCampaignInfoEntity } from "../contracts/campaign-info";
import { createPaymentTreasuryEntity } from "../contracts/payment-treasury";
import { createAllOrNothingEntity } from "../contracts/all-or-nothing";
import { createKeepWhatsRaisedEntity } from "../contracts/keep-whats-raised";
import { createItemRegistryEntity } from "../contracts/item-registry";

/**
 * Creates a new Oak Contracts SDK client instance. Reads config, calls buildClients
 * from resolve, wires entity factories. No transport/chain/contract logic — only composition.
 *
 * @param config - Simple: `{ chainId, rpcUrl, privateKey }` or full: `{ chain, provider, signer }`
 * @returns Configured OakContractsClient
 */
export function createOakContractsClient(
  config: OakContractsClientConfig,
): OakContractsClient {
  const options: OakContractsClientOptions = {
    ...DEFAULT_CLIENT_OPTIONS,
    ...config?.options,
  };

  const { chain, publicClient, walletClient } = buildClients(config, options);
  const publicConfig: PublicOakContractsClientConfig = { chain };

  async function waitForReceipt(txHash: Hex): Promise<TransactionReceipt> {
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      timeout: options.timeout,
    });
    return {
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
      logs: receipt.logs.map((log) => ({
        topics: log.topics as readonly Hex[],
        data: log.data,
      })),
    };
  }

  return {
    config: publicConfig,
    options,
    publicClient,
    walletClient,
    waitForReceipt,

    multicall<T extends readonly (() => Promise<unknown>)[]>(
      calls: [...T],
    ): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
      return multicall(calls);
    },

    globalParams(address: Address, options?: EntitySignerOptions): GlobalParamsEntity {
      return createGlobalParamsEntity(address, publicClient, options?.signer ?? walletClient, chain);
    },
    campaignInfoFactory(address: Address, options?: EntitySignerOptions): CampaignInfoFactoryEntity {
      return createCampaignInfoFactoryEntity(address, publicClient, options?.signer ?? walletClient, chain);
    },
    treasuryFactory(address: Address, options?: EntitySignerOptions): TreasuryFactoryEntity {
      return createTreasuryFactoryEntity(address, publicClient, options?.signer ?? walletClient, chain);
    },
    campaignInfo(address: Address, options?: EntitySignerOptions): CampaignInfoEntity {
      return createCampaignInfoEntity(address, publicClient, options?.signer ?? walletClient, chain);
    },
    /** @see {@link OakContractsClient.paymentTreasury} — supports both PaymentTreasury and TimeConstrainedPaymentTreasury. */
    paymentTreasury(address: Address, options?: EntitySignerOptions): PaymentTreasuryEntity {
      return createPaymentTreasuryEntity(address, publicClient, options?.signer ?? walletClient, chain);
    },
    allOrNothingTreasury(address: Address, options?: EntitySignerOptions): AllOrNothingTreasuryEntity {
      return createAllOrNothingEntity(address, publicClient, options?.signer ?? walletClient, chain);
    },
    keepWhatsRaisedTreasury(address: Address, options?: EntitySignerOptions): KeepWhatsRaisedTreasuryEntity {
      return createKeepWhatsRaisedEntity(address, publicClient, options?.signer ?? walletClient, chain);
    },
    itemRegistry(address: Address, options?: EntitySignerOptions): ItemRegistryEntity {
      return createItemRegistryEntity(address, publicClient, options?.signer ?? walletClient, chain);
    },
  };
}
