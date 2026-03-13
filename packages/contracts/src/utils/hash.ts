import { keccak256 as viemKeccak256, stringToHex, type Hex } from "../lib";

/**
 * Hashes a string or Uint8Array using keccak256.
 * Accepts 0x-prefixed hex strings directly without conversion.
 * @param data - String (converted to hex) or raw Uint8Array
 * @returns keccak256 hash as 0x-prefixed hex
 */
export function keccak256(data: string | Uint8Array): `0x${string}` {
  if (typeof data === "string") {
    return data.startsWith("0x")
      ? (viemKeccak256(data as Hex) as `0x${string}`)
      : (viemKeccak256(stringToHex(data)) as `0x${string}`);
  }
  return viemKeccak256(data) as `0x${string}`;
}

/**
 * Produces a bytes32 event topic from a UTF-8 string (keccak256(stringToHex(input))).
 * Equivalent to Solidity's keccak256(abi.encodePacked(str)).
 * @param input - UTF-8 string to hash
 * @returns keccak256 hash as 0x-prefixed hex
 */
export function id(input: string): `0x${string}` {
  return viemKeccak256(stringToHex(input)) as `0x${string}`;
}
