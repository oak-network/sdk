import type { ContractErrorBase } from "./base";

/**
 * Returns a human-readable recovery suggestion for a typed contract error, if available.
 *
 * @param error - A typed contract error instance
 * @returns Recovery hint string, or undefined if none is available
 */
export function getRecoveryHint(error: ContractErrorBase): string | undefined {
  return error.recoveryHint;
}
