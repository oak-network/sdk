import type { OakContractsClientConfig, SimpleOakContractsClientConfig } from "./types";

/**
 * Type guard that narrows an {@link OakContractsClientConfig} to {@link SimpleOakContractsClientConfig}.
 * @param config - Client config to test
 * @returns True if config contains chainId, rpcUrl, and a 0x-prefixed privateKey; false otherwise
 */
export function isSimpleConfig(
  config: OakContractsClientConfig,
): config is SimpleOakContractsClientConfig {
  return (
    "chainId" in config &&
    "rpcUrl" in config &&
    "privateKey" in config &&
    typeof (config as SimpleOakContractsClientConfig).chainId === "number" &&
    typeof (config as SimpleOakContractsClientConfig).rpcUrl === "string" &&
    (config as SimpleOakContractsClientConfig).rpcUrl.length > 0 &&
    typeof (config as SimpleOakContractsClientConfig).privateKey === "string" &&
    (config as SimpleOakContractsClientConfig).privateKey.startsWith("0x") &&
    (config as SimpleOakContractsClientConfig).privateKey.length === 66 &&
    /^0x[0-9a-fA-F]{64}$/.test((config as SimpleOakContractsClientConfig).privateKey)
  );
}
