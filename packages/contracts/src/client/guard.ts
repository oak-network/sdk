import type { OakContractsClientConfig, SimpleOakContractsClientConfig, SimpleReadOnlyOakContractsClientConfig } from "./types";

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

/**
 * Type guard that narrows an {@link OakContractsClientConfig} to {@link SimpleReadOnlyOakContractsClientConfig}.
 * Matches configs that have chainId + rpcUrl but no privateKey, chain, provider, or signer.
 * @param config - Client config to test
 * @returns True if config is a read-only simple config (no signer)
 */
export function isReadOnlySimpleConfig(
  config: OakContractsClientConfig,
): config is SimpleReadOnlyOakContractsClientConfig {
  return (
    "chainId" in config &&
    "rpcUrl" in config &&
    !("privateKey" in config) &&
    !("chain" in config) &&
    !("provider" in config) &&
    !("signer" in config)
  );
}
