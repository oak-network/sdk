import type { OakContractsClientConfig, SimpleOakContractsClientConfig } from "./types";

/**
 * Type guard for simple client config (chainId + rpcUrl + privateKey).
 * Returns true iff config has that shape. Testable in isolation per SDK_ARCHITECTURE_V2.md.
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
    (config as SimpleOakContractsClientConfig).privateKey.startsWith("0x")
  );
}
