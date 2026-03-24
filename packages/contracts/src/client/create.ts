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
import { DEFAULT_CLIENT_OPTIONS, type OakContractsClientOptions } from "./types";
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

    globalParams(address: Address): GlobalParamsEntity {
      return createGlobalParamsEntity(address, publicClient, walletClient, chain);
    },
    campaignInfoFactory(address: Address): CampaignInfoFactoryEntity {
      return createCampaignInfoFactoryEntity(address, publicClient, walletClient, chain);
    },
    treasuryFactory(address: Address): TreasuryFactoryEntity {
      return createTreasuryFactoryEntity(address, publicClient, walletClient, chain);
    },
    campaignInfo(address: Address): CampaignInfoEntity {
      return createCampaignInfoEntity(address, publicClient, walletClient, chain);
    },
    paymentTreasury(address: Address): PaymentTreasuryEntity {
      return createPaymentTreasuryEntity(address, publicClient, walletClient, chain);
    },
    allOrNothingTreasury(address: Address): AllOrNothingTreasuryEntity {
      return createAllOrNothingEntity(address, publicClient, walletClient, chain);
    },
    keepWhatsRaisedTreasury(address: Address): KeepWhatsRaisedTreasuryEntity {
      return createKeepWhatsRaisedEntity(address, publicClient, walletClient, chain);
    },
    itemRegistry(address: Address): ItemRegistryEntity {
      return createItemRegistryEntity(address, publicClient, walletClient, chain);
    },
  };
}
