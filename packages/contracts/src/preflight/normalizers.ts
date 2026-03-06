import { getAddress, isAddress } from "viem";

/**
 * Normalizes address fields in an input object by applying EIP-55 checksumming.
 * Returns a shallow clone with the specified fields checksummed.
 *
 * @param input - The input object to normalize
 * @param addressFields - Array of field paths to normalize (supports dot notation for one level, e.g., "creator")
 * @returns A new object with checksummed address fields
 */
export function normalizeAddresses<T extends Record<string, unknown>>(
  input: T,
  addressFields: readonly string[],
): T {
  const result = { ...input };
  for (const field of addressFields) {
    const value = result[field];
    if (typeof value === "string" && isAddress(value)) {
      (result as Record<string, unknown>)[field] = getAddress(value);
    }
  }
  return result;
}
