import { toHex as viemToHex } from "../lib";

/**
 * Type guard for 0x-prefixed hex strings.
 * @param data - Value to check
 * @returns True if the value is a valid hex string
 */
export function isHex(data: string): data is `0x${string}` {
  return typeof data === "string" && data.startsWith("0x") && /^0x[0-9a-fA-F]*$/.test(data);
}

/**
 * Encodes a string, number, bigint, boolean, or byte array as a 0x-prefixed hex string.
 * Thin re-export of viem's toHex via the lib/ boundary.
 * @param value - Value to encode
 * @param options - Optional encoding options (e.g. `{ size: 32 }` to pad to 32 bytes)
 * @returns 0x-prefixed hex string
 */
export function toHex(
  value: string | number | bigint | boolean | Uint8Array,
  options?: { size?: number },
): `0x${string}` {
  return viemToHex(value, options);
}

