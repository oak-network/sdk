/**
 * Step 4: Deploy an All-or-Nothing Treasury (Creator)
 *
 * Every campaign needs a treasury — the smart contract that holds all
 * pledged funds until the campaign outcome is decided. Maya deploys an
 * All-or-Nothing treasury through the TreasuryFactory.
 *
 * The factory creates a new treasury clone linked to Maya's campaign
 * and emits a TreasuryDeployed event containing the treasury address.
 * Maya reads this event to discover the address of her new treasury.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.MAYA_PRIVATE_KEY! as `0x${string}`,
});

const treasuryFactory = oak.treasuryFactory(
  process.env.TREASURY_FACTORY_ADDRESS! as `0x${string}`,
);

const platformHash = keccak256(toHex("artfund"));
const campaignInfoAddress = process.env.CAMPAIGN_INFO_ADDRESS! as `0x${string}`;
const allOrNothingImplementationId = 0n;

const deployTxHash = await treasuryFactory.deploy(
  platformHash,
  campaignInfoAddress,
  allOrNothingImplementationId,
);

const deployReceipt = await oak.waitForReceipt(deployTxHash);
console.log(`Treasury deployed at block ${deployReceipt.blockNumber}`);

// Get the deployed treasury address from the event
const logs = await treasuryFactory.events.getTreasuryDeployedLogs({
  fromBlock: BigInt(deployReceipt.blockNumber),
});

const treasuryAddress = logs[0]?.args?.treasuryAddress;
console.log("All-or-Nothing treasury deployed at:", treasuryAddress);
