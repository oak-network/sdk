/**
 * Step 1: Enlist a Platform (Protocol Admin)
 *
 * NovaPay has contacted Oak support and agreed on terms. The Protocol Admin
 * now calls `enlistPlatform` on GlobalParams. This single transaction sets:
 *
 *   - platformHash       — keccak256("NOVAPAY"), the permanent on-chain ID
 *   - platformAdminAddress — NovaPay's ops wallet, authorized for day-to-day actions
 *   - platformFeePercent — 250 bps (2.5%), within protocol limits
 *   - platformAdapter    — 0x0 (no meta-transaction adapter)
 *
 * Only the protocol admin can call this. Any other caller reverts with
 * GlobalParamsUnauthorizedError.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PROTOCOL_ADMIN_PRIVATE_KEY! as `0x${string}`,
});

const globalParams = oak.globalParams(
  process.env.GLOBAL_PARAMS_ADDRESS! as `0x${string}`,
);

const platformHash = keccak256(toHex("NOVAPAY"));
const platformAdminAddress = process.env.NOVAPAY_ADMIN_ADDRESS! as `0x${string}`;
const platformFeePercent = 250n; // 2.5% in basis points
const noAdapter = "0x0000000000000000000000000000000000000000" as `0x${string}`;

const txHash = await globalParams.enlistPlatform(
  platformHash,
  platformAdminAddress,
  platformFeePercent,
  noAdapter,
);

const receipt = await oak.waitForReceipt(txHash);
console.log(`NovaPay enlisted at block ${receipt.blockNumber}`);
console.log("Platform hash:", platformHash);
