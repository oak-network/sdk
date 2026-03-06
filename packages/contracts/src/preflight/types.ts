import type { Address, Hex, PublicClient } from "viem";

// ─── Public types ──────────────────────────────────────────────────────────────

/** Preflight validation mode. */
export type PreflightMode = "strict" | "warn" | "normalize";

/** Controls whether stateful (on-chain) checks run. */
export type StatefulPolicy = "enabled" | "local-only";

/**
 * Options for preflight validation.
 *
 * @param mode - Validation mode: `strict` blocks on any issue, `warn` (default) blocks on errors only, `normalize` applies safe fixes then follows `warn` behavior.
 * @param stateful - Whether to run on-chain state checks. Default: `enabled`.
 * @param collect - If true (default), all issues are collected. If false, short-circuit on first blocking issue.
 * @param blockTag - Block tag for state reads. Default: `latest`.
 * @param effectiveSender - Optional ERC-2771 sender override for auth checks.
 */
export interface PreflightOptions {
  mode?: PreflightMode;
  stateful?: StatefulPolicy;
  collect?: boolean;
  blockTag?: bigint | "latest";
  effectiveSender?: Address;
}

/**
 * A single preflight validation issue.
 *
 * @param code - Stable issue code in `OAK-PF-<SCOPE>-<RULE>` format.
 * @param severity - `error` blocks execution in warn/normalize modes; `warn` is informational (blocks only in strict mode).
 * @param message - Human-readable description of the issue.
 * @param fieldPath - Dot-notation path to the problematic field.
 * @param suggestion - Actionable fix suggestion.
 * @param normalized - True if this field was auto-fixed during normalization.
 */
export interface PreflightIssue {
  code: string;
  severity: "error" | "warn";
  message: string;
  fieldPath?: string;
  suggestion?: string;
  normalized?: boolean;
}

/**
 * Result of a preflight validation run.
 * `ok: true` means no blocking issues were found (warnings may still be present).
 * `ok: false` means at least one blocking issue was found.
 */
export type PreflightResult<T> =
  | { ok: true; normalized: T; warnings: PreflightIssue[] }
  | { ok: false; issues: PreflightIssue[]; normalized?: T };

// ─── Internal types ────────────────────────────────────────────────────────────

/** Resolved preflight options with all defaults applied. */
export interface ResolvedPreflightOptions {
  mode: PreflightMode;
  stateful: StatefulPolicy;
  collect: boolean;
  blockTag: bigint | "latest";
  effectiveSender?: Address;
}

/** A validation rule that checks an input and returns issues. */
export type ValidationRule<T> = (
  input: T,
  ctx: PreflightContext,
) => PreflightIssue[] | Promise<PreflightIssue[]>;

/** Validator definition for a single contract method. */
export interface MethodValidator<T> {
  structural: ReadonlyArray<ValidationRule<T>>;
  semantic: ReadonlyArray<ValidationRule<T>>;
  stateful: ReadonlyArray<ValidationRule<T>>;
  normalize?: (input: T) => T;
}

/** Context passed through the preflight pipeline. */
export interface PreflightContext {
  publicClient: PublicClient;
  contractAddress: Address;
  options: ResolvedPreflightOptions;
  stateReader: StateReader;
  /** Named addresses needed by validators (e.g., globalParams, infoAddress). */
  addresses: Record<string, Address>;
}

/**
 * State reader interface for on-chain reads during preflight.
 * All methods return `null` on RPC failure for graceful degradation.
 */
export interface StateReader {
  /** Get the current block timestamp. */
  getBlockTimestamp(): Promise<bigint | null>;

  // ── GlobalParams reads ───────────────────────────────────────────────
  checkIfPlatformIsListed(globalParamsAddress: Address, platformHash: Hex): Promise<boolean | null>;
  checkIfPlatformDataKeyValid(globalParamsAddress: Address, key: Hex): Promise<boolean | null>;
  getTokensForCurrency(globalParamsAddress: Address, currency: Hex): Promise<readonly Address[] | null>;
  getFromRegistry(globalParamsAddress: Address, key: Hex): Promise<Hex | null>;
  getPlatformAdminAddress(globalParamsAddress: Address, platformHash: Hex): Promise<Address | null>;

  // ── CampaignInfoFactory reads ────────────────────────────────────────
  identifierToCampaignInfo(factoryAddress: Address, identifierHash: Hex): Promise<Address | null>;

  // ── CampaignInfo reads ───────────────────────────────────────────────
  checkIfPlatformSelected(infoAddress: Address, platformHash: Hex): Promise<boolean | null>;
  checkIfPlatformApproved(infoAddress: Address, platformHash: Hex): Promise<boolean | null>;
  isTokenAccepted(infoAddress: Address, token: Address): Promise<boolean | null>;
  getLaunchTime(infoAddress: Address): Promise<bigint | null>;
  getDeadline(infoAddress: Address): Promise<bigint | null>;

  // ── PaymentTreasury reads ────────────────────────────────────────────
  getPaymentData(treasuryAddress: Address, paymentId: Hex): Promise<{
    buyerAddress: Address;
    isConfirmed: boolean;
    expiration: bigint;
    amount: bigint;
  } | null>;

  // ── ERC20 reads ──────────────────────────────────────────────────────
  erc20BalanceOf(token: Address, owner: Address): Promise<bigint | null>;
  erc20Allowance(token: Address, owner: Address, spender: Address): Promise<bigint | null>;
}
