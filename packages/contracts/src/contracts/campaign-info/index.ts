import type { Address, PublicClient, WalletClient, Chain } from "../../lib";
import { createCampaignInfoReads } from "./reads";
import { createCampaignInfoWrites } from "./writes";
import { createCampaignInfoSimulate } from "./simulate";
import { createCampaignInfoEvents } from "./events";
import type { CampaignInfoEntity } from "./types";

/**
 * Creates a CampaignInfo entity with full read/write/simulate/events access.
 * @param address - Deployed CampaignInfo contract address
 * @param publicClient - Viem PublicClient for on-chain reads
 * @param walletClient - Viem WalletClient for sending transactions
 * @param chain - Chain object (required for writeContract)
 * @returns CampaignInfoEntity
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
  walletClient: WalletClient,
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
