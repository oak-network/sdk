import type { Address, Hex, PublicClient } from "viem";
import type { ContractErrorBase } from "../errors/contract-error.js";

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

// ─── Safe types ───────────────────────────────────────────────────────────────

/** Stage at which a safe() call failed. */
export type SafeFailureStage = "preflight" | "simulation" | "send";

/**
 * Result of a safe() call.
 *
 * On success: preflight passed (possibly with warnings), simulation passed, transaction sent.
 * On failure: identifies the stage and provides details.
 *
 * `MissingSignerError` is thrown (not returned) because it is a configuration error,
 * not a runtime validation outcome.
 */
export type SafeResult =
  | { ok: true; txHash: Hex; warnings: PreflightIssue[] }
  | { ok: false; stage: "preflight"; issues: PreflightIssue[] }
  | { ok: false; stage: "simulation"; reason: string; cause?: unknown; contractError?: ContractErrorBase }
  | { ok: false; stage: "send"; reason: string; cause?: unknown; contractError?: ContractErrorBase };

/**
 * Descriptor bundling everything needed for a safe() call on a single method.
 *
 * @param validator - The existing preflight validator for the method.
 * @param abi - The contract ABI (used for simulateContract).
 * @param functionName - The Solidity function name.
 * @param toArgs - Maps the structured preflight input to positional contract args.
 */
export interface SafeMethodDescriptor<TInput> {
  validator: MethodValidator<TInput>;
  abi: readonly unknown[];
  functionName: string;
  toArgs: (input: TInput) => readonly unknown[];
}

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
  /** Check if a line item type exists for a given platform on a CampaignInfo contract. */
  getLineItemType(
    infoAddress: Address,
    platformHash: Hex,
    typeId: Hex,
  ): Promise<{ exists: boolean } | null>;

  // ── Treasury reward reads ─────────────────────────────────────────────
  /** Read a reward from an AON or KWR treasury contract. Returns null on failure. */
  getReward(
    treasuryAddress: Address,
    rewardName: Hex,
  ): Promise<{ rewardValue: bigint; isRewardTier: boolean } | null>;

  // ── Treasury common reads ──────────────────────────────────────────────
  /** Read the platformHash from a treasury contract. */
  getPlatformHash(treasuryAddress: Address): Promise<Hex | null>;

  // ── PaymentTreasury reads ────────────────────────────────────────────
  getPaymentData(treasuryAddress: Address, paymentId: Hex): Promise<{
    buyerAddress: Address;
    isConfirmed: boolean;
    expiration: bigint;
    amount: bigint;
  } | null>;

  // ── Treasury common reads ─────────────────────────────────────────
  /** Check if a treasury contract is cancelled. Works for AON, KWR, and PaymentTreasury. */
  getCancelled(treasuryAddress: Address): Promise<boolean | null>;
  /** Check if a treasury contract is paused. Works for AON and KWR (not PaymentTreasury). */
  getPaused(treasuryAddress: Address): Promise<boolean | null>;
  /** Read the raised amount from a treasury contract. */
  getRaisedAmount(treasuryAddress: Address): Promise<bigint | null>;

  // ── KWR-specific reads ──────────────────────────────────────────
  /** Check if withdrawal has been approved for a KWR treasury. */
  getWithdrawalApprovalStatus(treasuryAddress: Address): Promise<boolean | null>;
  /** Read the goal amount from a KWR treasury. */
  getGoalAmount(treasuryAddress: Address): Promise<bigint | null>;

  // ── ERC20 reads ──────────────────────────────────────────────────────
  erc20BalanceOf(token: Address, owner: Address): Promise<bigint | null>;
  erc20Allowance(token: Address, owner: Address, spender: Address): Promise<bigint | null>;
}
