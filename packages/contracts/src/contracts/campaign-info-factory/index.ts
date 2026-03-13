import type { Address, PublicClient, WalletClient, Chain } from "../../lib";
import { createCampaignInfoFactoryReads } from "./reads";
import { createCampaignInfoFactoryWrites } from "./writes";
import { createCampaignInfoFactorySimulate } from "./simulate";
import { createCampaignInfoFactoryEvents } from "./events";
import type { CampaignInfoFactoryEntity } from "./types";

/**
 * Creates a CampaignInfoFactory entity (reads, writes, simulate, events).
 * @param address - Deployed CampaignInfoFactory contract address
 * @param publicClient - Viem PublicClient for reads/simulate
 * @param walletClient - Viem WalletClient for writes
 * @param chain - Chain for writeContract/simulateContract
 * @returns CampaignInfoFactoryEntity
 */
export function createCampaignInfoFactoryEntity(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient,
  chain: Chain,
): CampaignInfoFactoryEntity {
  return {
    ...createCampaignInfoFactoryReads(address, publicClient),
    ...createCampaignInfoFactoryWrites(address, walletClient, chain),
    simulate: createCampaignInfoFactorySimulate(address, publicClient, walletClient, chain),
    events: createCampaignInfoFactoryEvents(address, publicClient),
  };
}

export type { CampaignInfoFactoryEntity } from "./types";
