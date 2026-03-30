import type { Address, PublicClient, WalletClient, Chain } from "../../lib";
import { createCampaignInfoReads } from "./reads";
import { createCampaignInfoWrites } from "./writes";
import { createCampaignInfoSimulate } from "./simulate";
import { createCampaignInfoEvents } from "./events";
import type { CampaignInfoEntity } from "./types";

/**
 * Creates a fully composed CampaignInfo entity combining reads, writes, simulate, and events.
 * @param address - Deployed CampaignInfo contract address
 * @param publicClient - Viem PublicClient used for reads and simulation
 * @param walletClient - Viem WalletClient used for writes; must have an account attached
 * @param chain - Chain passed to writeContract and simulateContract
 * @returns Composed entity exposing all CampaignInfo methods under a single object
 *
 * @example
 * ```typescript
 * const ci = createCampaignInfoEntity(CAMPAIGN_INFO_ADDRESS, publicClient, walletClient, chain);
 * const deadline = await ci.getDeadline();
 * await ci.simulate.updateDeadline(newDeadline);
 * await ci.updateDeadline(newDeadline);
 * ```
 */
export function createCampaignInfoEntity(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient | null,
  chain: Chain,
): CampaignInfoEntity {
  return {
    ...createCampaignInfoReads(address, publicClient),
    ...createCampaignInfoWrites(address, walletClient, chain),
    simulate: createCampaignInfoSimulate(address, publicClient, walletClient, chain),
    events: createCampaignInfoEvents(address, publicClient),
  };
}

export type { CampaignInfoEntity } from "./types";
