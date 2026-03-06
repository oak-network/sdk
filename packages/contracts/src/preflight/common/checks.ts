import type { Address, Hex } from "viem";
import { getAddress, isAddress } from "viem";
import { BYTES32_ZERO } from "../../constants/index.js";
import { createIssue } from "../issue.js";
import * as codes from "../issue-codes.js";
import type { PreflightIssue, StateReader } from "../types.js";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Checks if an address field is the zero address.
 *
 * @param value - The address value to check
 * @param fieldPath - Dot-notation path to the field
 * @param code - Issue code to use (allows per-scope codes)
 * @returns Array of issues (empty if valid)
 */
export function checkZeroAddress(
  value: Address,
  fieldPath: string,
  code: string = codes.COMMON_ZERO_ADDRESS,
): PreflightIssue[] {
  if (value.toLowerCase() === ZERO_ADDRESS) {
    return [
      createIssue(code, "error", `${fieldPath} must not be the zero address.`, {
        fieldPath,
        suggestion: "Provide a valid non-zero address.",
      }),
    ];
  }
  return [];
}

/**
 * Checks if a bytes32 field is all zeros.
 *
 * @param value - The bytes32 value to check
 * @param fieldPath - Dot-notation path to the field
 * @param code - Issue code to use
 * @returns Array of issues (empty if valid)
 */
export function checkZeroBytes32(
  value: Hex,
  fieldPath: string,
  code: string = codes.COMMON_ZERO_BYTES32,
): PreflightIssue[] {
  if (value === BYTES32_ZERO) {
    return [
      createIssue(code, "error", `${fieldPath} must not be zero bytes32.`, {
        fieldPath,
        suggestion: "Provide a valid non-zero bytes32 value.",
      }),
    ];
  }
  return [];
}

/**
 * Checks that two parallel arrays have the same length.
 *
 * @param a - First array
 * @param b - Second array
 * @param fieldPathA - Field path of first array
 * @param fieldPathB - Field path of second array
 * @param code - Issue code to use
 * @returns Array of issues (empty if valid)
 */
export function checkArrayLengthParity(
  a: readonly unknown[],
  b: readonly unknown[],
  fieldPathA: string,
  fieldPathB: string,
  code: string = codes.COMMON_ARRAY_LENGTH_MISMATCH,
): PreflightIssue[] {
  if (a.length !== b.length) {
    return [
      createIssue(
        code,
        "error",
        `${fieldPathA} (length ${a.length}) and ${fieldPathB} (length ${b.length}) must have the same length.`,
        { fieldPath: fieldPathA, suggestion: "Ensure both arrays have equal length." },
      ),
    ];
  }
  return [];
}

/**
 * Detects duplicate values in a hex array.
 *
 * @param values - Array of hex values
 * @param fieldPath - Field path of the array
 * @param code - Issue code to use
 * @param severity - Issue severity (default: warn)
 * @returns Array of issues (empty if no duplicates)
 */
export function checkDuplicates(
  values: readonly Hex[],
  fieldPath: string,
  code: string,
  severity: "error" | "warn" = "warn",
): PreflightIssue[] {
  const seen = new Set<string>();
  const issues: PreflightIssue[] = [];
  for (let i = 0; i < values.length; i++) {
    const lower = values[i].toLowerCase();
    if (seen.has(lower)) {
      issues.push(
        createIssue(code, severity, `Duplicate value at ${fieldPath}[${i}]: ${values[i]}`, {
          fieldPath: `${fieldPath}[${i}]`,
          suggestion: "Remove the duplicate entry.",
        }),
      );
    }
    seen.add(lower);
  }
  return issues;
}

/**
 * Checks if the current time is within the campaign window (launchTime..deadline).
 *
 * @param launchTime - Campaign launch time (unix seconds)
 * @param deadline - Campaign deadline (unix seconds)
 * @param now - Current block timestamp (unix seconds)
 * @param notStartedCode - Issue code for campaign not started
 * @param endedCode - Issue code for campaign ended
 * @returns Array of issues (empty if within window)
 */
export function checkCampaignWindow(
  launchTime: bigint,
  deadline: bigint,
  now: bigint,
  notStartedCode: string,
  endedCode: string,
): PreflightIssue[] {
  const issues: PreflightIssue[] = [];
  if (now < launchTime) {
    issues.push(
      createIssue(notStartedCode, "error", `Campaign has not started yet. Launch time: ${launchTime}, current time: ${now}.`, {
        suggestion: "Wait until the campaign launch time has passed.",
      }),
    );
  }
  if (now > deadline) {
    issues.push(
      createIssue(endedCode, "error", `Campaign deadline has passed. Deadline: ${deadline}, current time: ${now}.`, {
        suggestion: "This campaign is no longer accepting contributions.",
      }),
    );
  }
  return issues;
}

/**
 * Checks if the token is accepted by the campaign.
 *
 * @param stateReader - State reader instance
 * @param infoAddress - CampaignInfo contract address
 * @param token - Token address to check
 * @param fieldPath - Field path for the token
 * @param code - Issue code to use
 * @returns Array of issues (empty if accepted or state unavailable)
 */
export async function checkTokenAccepted(
  stateReader: StateReader,
  infoAddress: Address,
  token: Address,
  fieldPath: string,
  code: string,
): Promise<PreflightIssue[]> {
  const accepted = await stateReader.isTokenAccepted(infoAddress, token);
  if (accepted === null) {
    return [
      createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not verify token acceptance on-chain.", {
        fieldPath,
      }),
    ];
  }
  if (!accepted) {
    return [
      createIssue(code, "error", `Token ${token} is not accepted by the campaign.`, {
        fieldPath,
        suggestion: "Use a token from the campaign's accepted token list.",
      }),
    ];
  }
  return [];
}

/**
 * Checks ERC20 balance and allowance for a given owner against required amount.
 *
 * @param stateReader - State reader instance
 * @param token - ERC20 token address
 * @param owner - Token holder address
 * @param spender - Contract address that needs the allowance
 * @param requiredAmount - Minimum required amount
 * @param fieldPrefix - Field prefix for issue paths
 * @returns Array of issues (empty if sufficient or state unavailable)
 */
export async function checkErc20BalanceAndAllowance(
  stateReader: StateReader,
  token: Address,
  owner: Address,
  spender: Address,
  requiredAmount: bigint,
  fieldPrefix: string,
): Promise<PreflightIssue[]> {
  if (requiredAmount === 0n) return [];

  const issues: PreflightIssue[] = [];

  const balance = await stateReader.erc20BalanceOf(token, owner);
  if (balance === null) {
    issues.push(
      createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read ERC20 balance on-chain.", {
        fieldPath: fieldPrefix,
      }),
    );
  } else if (balance < requiredAmount) {
    issues.push(
      createIssue(
        codes.COMMON_ERC20_INSUFFICIENT_BALANCE,
        "error",
        `Insufficient token balance. Required: ${requiredAmount}, available: ${balance}.`,
        { fieldPath: fieldPrefix, suggestion: "Ensure the account has enough tokens." },
      ),
    );
  }

  const allowance = await stateReader.erc20Allowance(token, owner, spender);
  if (allowance === null) {
    issues.push(
      createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read ERC20 allowance on-chain.", {
        fieldPath: fieldPrefix,
      }),
    );
  } else if (allowance < requiredAmount) {
    issues.push(
      createIssue(
        codes.COMMON_ERC20_INSUFFICIENT_ALLOWANCE,
        "error",
        `Insufficient token allowance. Required: ${requiredAmount}, approved: ${allowance}.`,
        {
          fieldPath: fieldPrefix,
          suggestion: `Approve at least ${requiredAmount} tokens for the contract.`,
        },
      ),
    );
  }

  return issues;
}

/**
 * Reads the campaign window (launchTime, deadline) from on-chain state and validates it.
 *
 * @param stateReader - State reader instance
 * @param infoAddress - CampaignInfo contract address
 * @param notStartedCode - Issue code for campaign not started
 * @param endedCode - Issue code for campaign ended
 * @returns Array of issues (empty if within window or state unavailable)
 */
export async function checkCampaignWindowStateful(
  stateReader: StateReader,
  infoAddress: Address,
  notStartedCode: string,
  endedCode: string,
): Promise<PreflightIssue[]> {
  const [launchTime, deadline, now] = await Promise.all([
    stateReader.getLaunchTime(infoAddress),
    stateReader.getDeadline(infoAddress),
    stateReader.getBlockTimestamp(),
  ]);

  if (launchTime === null || deadline === null || now === null) {
    return [
      createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read campaign window from on-chain state."),
    ];
  }

  return checkCampaignWindow(launchTime, deadline, now, notStartedCode, endedCode);
}
