import { toHex as viemToHex } from "../lib";
import type { Bytes4 } from "../types/structs";

/**
 * Type guard for 0x-prefixed hex strings.
 * @param data - Value to check
 * @returns True if the value is a valid hex string
 */
export function isHex(data: string): data is `0x${string}` {
  return typeof data === "string" && data.startsWith("0x") && /^0x[0-9a-fA-F]*$/.test(data);
}

/**
 * Type guard that validates a string is a 4-byte hex value (`0x` + exactly 8 hex chars).
 * Use this to narrow an unknown string to {@link Bytes4} before passing it to
 * `supportsInterface` or any ERC-165 method.
 *
 * @param data - Value to check
 * @returns True if the value is a valid 4-byte hex string
 *
 * @example
 * ```typescript
 * const id = "0x01ffc9a7";
 * if (isBytes4(id)) {
 *   const supported = await entity.supportsInterface(id);
 * }
 * ```
 */
export function isBytes4(data: string): data is Bytes4 {
  return /^0x[0-9a-fA-F]{8}$/.test(data);
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

