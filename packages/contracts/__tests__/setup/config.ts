import type { Address, Hex } from "../../src/lib";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required env var: ${name} — set it in packages/contracts/.env (see .env.example)`,
    );
  }
  return value;
}

export interface TestConfig {
  rpcUrl: string;
  privateKey: Hex;
  addresses: {
    globalParams: Address;
    campaignInfoFactory: Address;
    treasuryFactory: Address;
    campaignInfo: Address;
    paymentTreasury: Address;
    allOrNothing: Address;
    keepWhatsRaised: Address;
    itemRegistry: Address;
  };
}

export function loadTestConfig(): TestConfig {
  return {
    rpcUrl: requireEnv("RPC_URL"),
    privateKey: requireEnv("PRIVATE_KEY") as Hex,
    addresses: {
      globalParams: requireEnv("GLOBAL_PARAMS_ADDRESS") as Address,
      campaignInfoFactory: requireEnv("CAMPAIGN_INFO_FACTORY_ADDRESS") as Address,
      treasuryFactory: requireEnv("TREASURY_FACTORY_ADDRESS") as Address,
      campaignInfo: requireEnv("CAMPAIGN_INFO_ADDRESS") as Address,
      paymentTreasury: requireEnv("PAYMENT_TREASURY_ADDRESS") as Address,
      allOrNothing: requireEnv("ALL_OR_NOTHING_ADDRESS") as Address,
      keepWhatsRaised: requireEnv("KEEP_WHATS_RAISED_ADDRESS") as Address,
      itemRegistry: requireEnv("ITEM_REGISTRY_ADDRESS") as Address,
    },
  };
}
