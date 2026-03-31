import { createOakContractsClient } from "../../src/client/create";
import { CHAIN_IDS } from "../../src/constants/chains";
import { loadTestConfig, type TestConfig } from "./config";
import type { OakContractsClient } from "../../src/client/types";

let _config: TestConfig | undefined;
let _client: OakContractsClient | undefined;

export function getTestConfig(): TestConfig {
  if (!_config) {
    _config = loadTestConfig();
  }
  return _config;
}

export function getTestClient(): OakContractsClient {
  if (!_client) {
    const cfg = getTestConfig();
    _client = createOakContractsClient({
      chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
      rpcUrl: cfg.rpcUrl,
      privateKey: cfg.privateKey,
    });
  }
  return _client;
}
