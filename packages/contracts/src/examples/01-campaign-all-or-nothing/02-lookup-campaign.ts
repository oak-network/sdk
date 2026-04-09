/**
 * Step 2: Look Up the Campaign Address (Creator)
 *
 * After creating the campaign in Step 1, Maya needs to find the address
 * of the deployed CampaignInfo contract. She uses the same identifier hash
 * she chose during creation — this acts as a human-readable lookup key.
 *
 * She also validates that the address is recognized by the factory as a
 * legitimate campaign, which is useful for front-end verification before
 * displaying campaign data to users.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.MAYA_PRIVATE_KEY! as `0x${string}`,
});

const factory = oak.campaignInfoFactory(
  process.env.CAMPAIGN_INFO_FACTORY_ADDRESS! as `0x${string}`,
);

const identifierHash = keccak256(toHex("earth-and-fire-2026"));

const campaignInfoAddress = await factory.identifierToCampaignInfo(identifierHash);
console.log("CampaignInfo deployed at:", campaignInfoAddress);

const isValid = await factory.isValidCampaignInfo(campaignInfoAddress);
console.log("Is valid campaign:", isValid); // true
