import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { Address, Hex, PublicClient, WalletClient } from "viem";
import type { Chain } from "viem/chains";
import type {
  ChainIdentifier,
  OakContractsClient,
  OakContractsClientConfig,
  PublicOakContractsClientConfig,
  FullOakContractsClientConfig,
  SimpleOakContractsClientConfig,
  TransactionReceipt,
  GlobalParamsEntity,
  CampaignInfoFactoryEntity,
  TreasuryFactoryEntity,
  CampaignInfoEntity,
  PaymentTreasuryEntity,
  AllOrNothingTreasuryEntity,
  KeepWhatsRaisedTreasuryEntity,
  ItemRegistryEntity,
} from "../types";
import { DEFAULT_CLIENT_OPTIONS, type OakContractsClientOptions } from "../types";
import { getChainFromId } from "../utils/chain-registry";
import { createGlobalParamsEntity } from "../contracts/global-params";
import { createCampaignInfoFactoryEntity } from "../contracts/campaign-info-factory";
import { createTreasuryFactoryEntity } from "../contracts/treasury-factory";
import { createCampaignInfoEntity } from "../contracts/campaign-info";
import { createPaymentTreasuryEntity } from "../contracts/payment-treasury";
import { createAllOrNothingEntity } from "../contracts/all-or-nothing";
import { createKeepWhatsRaisedEntity } from "../contracts/keep-whats-raised";
import { createItemRegistryEntity } from "../contracts/item-registry";

/**
 * Type guard for simple client config (chainId + rpcUrl + privateKey).
 */
function isSimpleConfig(
  config: OakContractsClientConfig,
): config is SimpleOakContractsClientConfig {
  return "chainId" in config && "rpcUrl" in config && "privateKey" in config;
}

/**
 * Resolves a chain identifier (number or Chain object) to a Chain object.
 */
function resolveChain(chain: ChainIdentifier): Chain {
  if (typeof chain === "number") {
    return getChainFromId(chain);
  }
  return chain;
}

/**
 * Builds viem publicClient and walletClient from the given config.
 */
function buildClients(config: OakContractsClientConfig, options: OakContractsClientOptions): {
  chain: Chain;
  publicClient: PublicClient;
  walletClient: WalletClient;
} {
  if (isSimpleConfig(config)) {
    const chain = getChainFromId(config.chainId);
    const transport = http(config.rpcUrl, { timeout: options.timeout });
    const publicClient = createPublicClient({ chain, transport });
    const account = privateKeyToAccount(config.privateKey);
    const walletClient = createWalletClient({ account, chain, transport });
    return { chain, publicClient, walletClient };
  }

  const fullConfig = config as FullOakContractsClientConfig;
  const chain = resolveChain(fullConfig.chain);
  return {
    chain,
    publicClient: fullConfig.provider as PublicClient,
    walletClient: fullConfig.signer as WalletClient,
  };
}

/**
 * Creates a new Oak Contracts SDK client instance.
 * Supports simple config (chainId, rpcUrl, privateKey) or full config (chain, provider, signer).
 *
 * @param config - Simple: `{ chainId, rpcUrl, privateKey }` or full: `{ chain, provider, signer }`
 * @returns Configured OakContractsClient
 *
 * @example
 * ```typescript
 * const oak = createOakContractsClient({
 *   chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
 *   rpcUrl: "https://forno.celo-sepolia.org",
 *   privateKey: "0x...",
 * });
 *
 * const gp = oak.globalParams(GP_ADDRESS);
 * const admin = await gp.getProtocolAdminAddress();
 *
 * const factory = oak.campaignInfoFactory(FACTORY_ADDRESS);
 * const txHash = await factory.createCampaign({ creator, identifierHash, campaignData, ... });
 * ```
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
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash, timeout: options.timeout });
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
      return createTreasuryFactoryEntity(address, walletClient, chain);
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
