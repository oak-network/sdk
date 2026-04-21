import { createOakContractsClient } from "../../src/client/create";
import { CHAIN_IDS } from "../../src/constants/chains";
import { getTestConfig, getTestClient } from "../setup/test-client";
import {
  createJsonRpcProvider,
  createWallet,
} from "../../src/lib/viem/provider";
import { getChainFromId } from "../../src/utils/chain";

const cfg = getTestConfig();

describe("createOakContractsClient — simple config", () => {
  const client = getTestClient();

  it("resolves chain to Celo Sepolia", () => {
    expect(client.config.chain.id).toBe(CHAIN_IDS.CELO_TESTNET_SEPOLIA);
  });

  it("has publicClient and walletClient", () => {
    expect(client.publicClient).toBeDefined();
    expect(client.walletClient).toBeDefined();
  });

  it("defaults timeout to 30000", () => {
    expect(client.options.timeout).toBe(30000);
  });
});

describe("createOakContractsClient — full config", () => {
  const chain = getChainFromId(CHAIN_IDS.CELO_TESTNET_SEPOLIA);
  const provider = createJsonRpcProvider(cfg.rpcUrl, chain);
  const signer = createWallet(cfg.privateKey, cfg.rpcUrl, chain);

  const client = createOakContractsClient({
    chain,
    provider,
    signer,
  });

  it("passes through provider and signer", () => {
    expect(client.publicClient).toBe(provider);
    expect(client.walletClient).toBe(signer);
  });

  it("resolves chain object directly", () => {
    expect(client.config.chain).toBe(chain);
  });
});

describe("createOakContractsClient — full config with numeric chain", () => {
  const chain = getChainFromId(CHAIN_IDS.CELO_TESTNET_SEPOLIA);
  const provider = createJsonRpcProvider(cfg.rpcUrl, chain);
  const signer = createWallet(cfg.privateKey, cfg.rpcUrl, chain);

  const client = createOakContractsClient({
    chain: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
    provider,
    signer,
  });

  it("resolves numeric chain to chain object", () => {
    expect(client.config.chain.id).toBe(CHAIN_IDS.CELO_TESTNET_SEPOLIA);
  });
});

describe("createOakContractsClient — options override", () => {
  const client = createOakContractsClient({
    chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
    rpcUrl: cfg.rpcUrl,
    privateKey: cfg.privateKey,
    options: { timeout: 60000 },
  });

  it("merges custom timeout", () => {
    expect(client.options.timeout).toBe(60000);
  });
});

describe("entity factory methods", () => {
  const client = getTestClient();
  const addr = cfg.addresses;

  it("globalParams returns entity with read/write/simulate/events", () => {
    const entity = client.globalParams(addr.globalParams);
    expect(typeof entity.getProtocolAdminAddress).toBe("function");
    expect(typeof entity.enlistPlatform).toBe("function");
    expect(entity.simulate).toBeDefined();
    expect(entity.events).toBeDefined();
  });

  it("campaignInfoFactory returns entity", () => {
    const entity = client.campaignInfoFactory(addr.campaignInfoFactory);
    expect(typeof entity.identifierToCampaignInfo).toBe("function");
    expect(typeof entity.createCampaign).toBe("function");
    expect(entity.simulate).toBeDefined();
    expect(entity.events).toBeDefined();
  });

  it("treasuryFactory returns entity", () => {
    const entity = client.treasuryFactory(addr.treasuryFactory);
    expect(typeof entity.deploy).toBe("function");
    expect(entity.simulate).toBeDefined();
    expect(entity.events).toBeDefined();
  });

  it("campaignInfo returns entity", () => {
    const entity = client.campaignInfo(addr.campaignInfo);
    expect(typeof entity.getLaunchTime).toBe("function");
    expect(entity.simulate).toBeDefined();
    expect(entity.events).toBeDefined();
  });

  it("paymentTreasury returns entity", () => {
    const entity = client.paymentTreasury(addr.paymentTreasury);
    expect(typeof entity.getPlatformHash).toBe("function");
    expect(entity.simulate).toBeDefined();
    expect(entity.events).toBeDefined();
  });

  it("allOrNothingTreasury returns entity", () => {
    const entity = client.allOrNothingTreasury(addr.allOrNothing);
    expect(typeof entity.getRaisedAmount).toBe("function");
    expect(entity.simulate).toBeDefined();
    expect(entity.events).toBeDefined();
  });

  it("keepWhatsRaisedTreasury returns entity", () => {
    const entity = client.keepWhatsRaisedTreasury(addr.keepWhatsRaised);
    expect(typeof entity.getRaisedAmount).toBe("function");
    expect(entity.simulate).toBeDefined();
    expect(entity.events).toBeDefined();
  });

  it("itemRegistry returns entity", () => {
    const entity = client.itemRegistry("0x0000000000000000000000000000000000000001");
    expect(typeof entity.getItem).toBe("function");
    expect(typeof entity.addItem).toBe("function");
    expect(typeof entity.addItemsBatch).toBe("function");
    expect(entity.simulate).toBeDefined();
    expect(entity.events).toBeDefined();
  });
});

describe("createOakContractsClient — read-only config", () => {
  const readOnlyClient = createOakContractsClient({
    chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
    rpcUrl: cfg.rpcUrl,
  });

  it("has publicClient", () => {
    expect(readOnlyClient.publicClient).toBeDefined();
  });

  it("walletClient is null", () => {
    expect(readOnlyClient.walletClient).toBeNull();
  });

  it("resolves chain correctly", () => {
    expect(readOnlyClient.config.chain.id).toBe(CHAIN_IDS.CELO_TESTNET_SEPOLIA);
  });

  it("read-only entity can perform reads", async () => {
    const gp = readOnlyClient.globalParams(cfg.addresses.globalParams);
    const count = await gp.getNumberOfListedPlatforms();
    expect(typeof count).toBe("bigint");
  });

  it("read-only entity throws on write attempt", async () => {
    const gp = readOnlyClient.globalParams(cfg.addresses.globalParams);
    await expect(gp.enlistPlatform(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000001",
      100n,
      "0x0000000000000000000000000000000000000001",
    )).rejects.toThrow();
  });
});

describe("waitForReceipt / getReceipt", () => {
  const client = getTestClient();

  it("waitForReceipt is a function", () => {
    expect(typeof client.waitForReceipt).toBe("function");
  });

  it("getReceipt is a function", () => {
    expect(typeof client.getReceipt).toBe("function");
  });

  it("getReceipt returns null for a non-existent hash", async () => {
    const fakeHash = "0x0000000000000000000000000000000000000000000000000000000000000001" as `0x${string}`;
    const receipt = await client.getReceipt(fakeHash);
    expect(receipt).toBeNull();
  });
});
