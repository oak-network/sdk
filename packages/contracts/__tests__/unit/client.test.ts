import { createOakContractsClient } from "../../src/client/create";
import { buildClients } from "../../src/client/resolve";
import { getChainFromId } from "../../src/utils/chain";
import {
  createJsonRpcProvider,
  createWallet,
} from "../../src/lib/viem/provider";
import { CHAIN_IDS } from "../../src/constants/chains";
import type { OakContractsClientConfig } from "../../src/client/types";
import {
  TEST_PRIVATE_KEY,
  TEST_RPC_URL,
  TEST_GLOBAL_PARAMS_ADDRESS,
} from "../setup/constant";

const PK = TEST_PRIVATE_KEY;
const RPC = TEST_RPC_URL;
const ADDR = TEST_GLOBAL_PARAMS_ADDRESS;
const chain = getChainFromId(CHAIN_IDS.CELO_TESTNET_SEPOLIA);

describe("buildClients", () => {
  it("builds from simple config", () => {
    const {
      chain: c,
      publicClient,
      walletClient,
    } = buildClients(
      { chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA, rpcUrl: RPC, privateKey: PK },
      { timeout: 30000 },
    );
    expect(c.id).toBe(CHAIN_IDS.CELO_TESTNET_SEPOLIA);
    expect(publicClient).toBeDefined();
    expect(walletClient).toBeDefined();
  });

  it("builds read-only client (no privateKey)", () => {
    const {
      chain: c,
      publicClient,
      walletClient,
    } = buildClients(
      {
        chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
        rpcUrl: RPC,
      } as OakContractsClientConfig,
      { timeout: 30000 },
    );
    expect(c.id).toBe(CHAIN_IDS.CELO_TESTNET_SEPOLIA);
    expect(publicClient).toBeDefined();
    expect(walletClient).toBeNull();
  });

  it("builds from full config with Chain object", () => {
    const provider = createJsonRpcProvider(RPC, chain);
    const signer = createWallet(PK, RPC, chain);
    const {
      chain: c,
      publicClient,
      walletClient,
    } = buildClients({ chain, provider, signer }, { timeout: 30000 });
    expect(c).toBe(chain);
    expect(publicClient).toBe(provider);
    expect(walletClient).toBe(signer);
  });

  it("builds from full config with numeric chain", () => {
    const provider = createJsonRpcProvider(RPC, chain);
    const signer = createWallet(PK, RPC, chain);
    const { chain: c } = buildClients(
      { chain: CHAIN_IDS.CELO_TESTNET_SEPOLIA, provider, signer },
      { timeout: 30000 },
    );
    expect(c.id).toBe(CHAIN_IDS.CELO_TESTNET_SEPOLIA);
  });
});

describe("createOakContractsClient", () => {
  it("creates a client with simple config", () => {
    const client = createOakContractsClient({
      chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
      rpcUrl: RPC,
      privateKey: PK,
    });
    expect(client.config.chain.id).toBe(CHAIN_IDS.CELO_TESTNET_SEPOLIA);
    expect(client.publicClient).toBeDefined();
    expect(client.walletClient).toBeDefined();
    expect(client.options.timeout).toBe(30000);
  });

  it("merges custom options", () => {
    const client = createOakContractsClient({
      chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
      rpcUrl: RPC,
      privateKey: PK,
      options: { timeout: 60000 },
    });
    expect(client.options.timeout).toBe(60000);
  });

  it("entity factories return entities", () => {
    const client = createOakContractsClient({
      chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
      rpcUrl: RPC,
      privateKey: PK,
    });
    expect(client.globalParams(ADDR)).toBeDefined();
    expect(client.campaignInfoFactory(ADDR)).toBeDefined();
    expect(client.treasuryFactory(ADDR)).toBeDefined();
    expect(client.campaignInfo(ADDR)).toBeDefined();
    expect(client.paymentTreasury(ADDR)).toBeDefined();
    expect(client.allOrNothingTreasury(ADDR)).toBeDefined();
    expect(client.keepWhatsRaisedTreasury(ADDR)).toBeDefined();
    expect(client.itemRegistry(ADDR)).toBeDefined();
  });

  it("waitForReceipt is a function", () => {
    const client = createOakContractsClient({
      chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
      rpcUrl: RPC,
      privateKey: PK,
    });
    expect(typeof client.waitForReceipt).toBe("function");
  });

  it("multicall runs closures concurrently and returns results", async () => {
    const client = createOakContractsClient({
      chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
      rpcUrl: RPC,
      privateKey: PK,
    });

    const results = await client.multicall([
      () => Promise.resolve(5n),
      () => Promise.resolve(250n),
    ]);

    expect(results).toEqual([5n, 250n]);
  });

  it("waitForReceipt calls publicClient.waitForTransactionReceipt", async () => {
    const client = createOakContractsClient({
      chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
      rpcUrl: RPC,
      privateKey: PK,
    });
    const mockReceipt = {
      blockNumber: 123n,
      gasUsed: 21000n,
      logs: [{ topics: ["0xabc"], data: "0xdef" }],
    };
    (
      client.publicClient as unknown as { waitForTransactionReceipt: jest.Mock }
    ).waitForTransactionReceipt = jest.fn().mockResolvedValue(mockReceipt);

    const receipt = await client.waitForReceipt("0xdeadbeef");
    expect(receipt.blockNumber).toBe(123n);
    expect(receipt.gasUsed).toBe(21000n);
    expect(receipt.logs).toHaveLength(1);
  });
});

// Import contracts barrel to ensure coverage
import * as contractsIndex from "../../src/contracts/index";

describe("contracts barrel export", () => {
  it("re-exports all entity factories", () => {
    expect(contractsIndex.createGlobalParamsEntity).toBeDefined();
    expect(contractsIndex.createCampaignInfoFactoryEntity).toBeDefined();
    expect(contractsIndex.createTreasuryFactoryEntity).toBeDefined();
    expect(contractsIndex.createCampaignInfoEntity).toBeDefined();
    expect(contractsIndex.createPaymentTreasuryEntity).toBeDefined();
    expect(contractsIndex.createAllOrNothingEntity).toBeDefined();
    expect(contractsIndex.createKeepWhatsRaisedEntity).toBeDefined();
    expect(contractsIndex.createItemRegistryEntity).toBeDefined();
  });
});
