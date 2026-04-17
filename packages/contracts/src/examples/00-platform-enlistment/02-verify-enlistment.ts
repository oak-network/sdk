/**
 * Step 2: Verify Platform Enlistment (Anyone)
 *
 * After the Protocol Admin enlists NovaPay, anyone with a read-only client
 * can verify the on-chain state. No private key is needed — these are
 * pure view calls against GlobalParams.
 *
 * This step confirms:
 *   - The platform is listed
 *   - The admin address matches what was submitted
 *   - The fee percent is what was agreed
 *   - The adapter is unset (zero address)
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
});

const globalParams = oak.globalParams(
  process.env.GLOBAL_PARAMS_ADDRESS! as `0x${string}`,
);

const platformHash = keccak256(toHex("NOVAPAY"));

const isListed = await globalParams.checkIfPlatformIsListed(platformHash);
console.log("Platform listed:", isListed); // true

const adminAddress = await globalParams.getPlatformAdminAddress(platformHash);
console.log("Admin address:", adminAddress);

const feePercent = await globalParams.getPlatformFeePercent(platformHash);
console.log("Fee percent:", Number(feePercent), "bps");

const adapter = await globalParams.getPlatformAdapter(platformHash);
console.log("Adapter:", adapter); // 0x0000...0000

const totalPlatforms = await globalParams.getNumberOfListedPlatforms();
console.log("Total enlisted platforms:", Number(totalPlatforms));
