/**
 * @file scripts/generate-abis.ts
 * Extracts ABIs from compiled Solidity artifacts into contracts/{name}/abi.ts.
 *
 * TODO: Implement. Read Hardhat/Foundry artifacts (e.g. out/ or artifacts/)
 * and write each contract's ABI to the corresponding contracts/{name}/abi.ts
 * as a typed const array. Run after contract recompile to keep SDK in sync.
 * This script is standalone — not imported by SDK source.
 */

/**
 * Reads compiled Solidity artifacts and writes each contract's ABI into
 * the corresponding `contracts/{name}/abi.ts` as a typed const array.
 * Run after a contract recompile to keep SDK sources in sync.
 *
 * @returns void
 * @throws {Error} Not yet implemented
 */
export function generateAbis(): void {
  throw new Error("TODO: generate-abis not implemented");
}
