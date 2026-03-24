import type { Address, PublicClient, WalletClient, Chain } from "../../lib";
import { createCampaignInfoFactoryReads } from "./reads";
import { createCampaignInfoFactoryWrites } from "./writes";
import { createCampaignInfoFactorySimulate } from "./simulate";
import { createCampaignInfoFactoryEvents } from "./events";
import type { CampaignInfoFactoryEntity } from "./types";

/**
 * Creates a fully composed CampaignInfoFactory entity combining reads, writes, simulate, and events.
 * @param address - Deployed CampaignInfoFactory contract address
 * @param publicClient - Viem PublicClient used for reads and simulation
 * @param walletClient - Viem WalletClient used for writes; must have an account attached
 * @param chain - Chain passed to writeContract and simulateContract
 * @returns Composed entity exposing all CampaignInfoFactory methods under a single object
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
