/**
 * @file scripts/check-abis.ts
 * CI check: detect ABI drift between compiled artifacts and SDK source.
 *
 * TODO: Implement. Compare each contracts/{name}/abi.ts against current
 * compiled artifacts; exit with non-zero if any ABI is stale or missing.
 * Run in CI on every PR to prevent SDK/contract mismatch.
 */

/**
 * Compares each `contracts/{name}/abi.ts` against current compiled Solidity artifacts.
 * Exits with a non-zero code if any ABI is stale or missing.
 * Intended to run in CI on every pull request.
 *
 * @returns true if all ABIs are current, false if any are stale
 * @throws {Error} Not yet implemented
 */
export function checkAbis(): boolean {
  throw new Error("TODO: check-abis not implemented");
}
