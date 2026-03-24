/**
 * Base interface implemented by all typed SDK contract revert errors.
 * Every per-contract error class extends Error and implements this interface.
 */
export interface ContractErrorBase {
  readonly name: string;
  readonly args: Record<string, unknown>;
  /** Optional human-readable recovery suggestion for developers. */
  readonly recoveryHint?: string;
}
