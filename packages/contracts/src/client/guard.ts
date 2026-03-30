import type { OakContractsClientConfig, SimpleOakContractsClientConfig } from "./types";

/**
 * Type guard that narrows an {@link OakContractsClientConfig} to {@link SimpleOakContractsClientConfig}.
 * Detects simple config by the presence of chainId, rpcUrl, and privateKey fields.
 * Throws immediately if the fields are present but privateKey is malformed, so the
 * caller never silently falls through to the full-config branch with undefined clients.
 * @param config - Client config to test
 * @returns True if config is a valid SimpleOakContractsClientConfig; false if it is a full config
 * @throws {Error} If simple-config fields are present but privateKey is not a valid 32-byte hex string
 */
export function isSimpleConfig(
  config: OakContractsClientConfig,
): config is SimpleOakContractsClientConfig {
  const hasSimpleFields =
    "chainId" in config &&
    "rpcUrl" in config &&
    "privateKey" in config;

  if (!hasSimpleFields) {
    return false;
  }

  const simple = config as SimpleOakContractsClientConfig;

  if (
    typeof simple.chainId !== "number" ||
    typeof simple.rpcUrl !== "string" ||
    simple.rpcUrl.length === 0
  ) {
    return false;
  }

  if (
    typeof simple.privateKey !== "string" ||
    !/^0x[0-9a-fA-F]{64}$/.test(simple.privateKey)
  ) {
    throw new Error(
      "Invalid privateKey: must be a 0x-prefixed 32-byte hex string (66 characters).",
    );
  }

  return true;
}
