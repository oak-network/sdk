/**
 * Base type for contract revert errors. All typed SDK errors extend this.
 * Preserves decoded parameters from the chain for logging and retries.
 */
export interface ContractErrorBase {
  readonly name: string;
  readonly args: Record<string, unknown>;
  /** Optional human-readable recovery suggestion for developers. */
  readonly recoveryHint?: string;
}
