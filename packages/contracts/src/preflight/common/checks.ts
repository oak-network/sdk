import type { Address, Hex } from "viem";
import { getAddress, isAddress } from "viem";
import { BYTES32_ZERO } from "../../constants/index.js";
import type { TieredReward } from "../../types/index.js";
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
 * Checks if address fields have valid EIP-55 checksums.
 * Emits a warning for each field that is a valid address but has incorrect casing.
 *
 * @param input - The input object to check
 * @param addressFields - Array of field names to validate
 * @param isNormalizeMode - When true, marks issues with `normalized: true`
 * @returns Array of issues (empty if all valid)
 */
export function checkAddressChecksum(
  input: object,
  addressFields: readonly string[],
  isNormalizeMode: boolean = false,
): PreflightIssue[] {
  const issues: PreflightIssue[] = [];
  for (const field of addressFields) {
    const value = (input as Record<string, unknown>)[field];
    if (typeof value === "string" && isAddress(value)) {
      const checksummed = getAddress(value);
      if (value !== checksummed) {
        issues.push(
          createIssue(
            codes.COMMON_ADDRESS_NOT_CHECKSUMMED,
            "warn",
            `${field} is not EIP-55 checksummed. Expected: ${checksummed}`,
            {
              fieldPath: field,
              suggestion: `Use the checksummed form: ${checksummed}`,
              ...(isNormalizeMode && { normalized: true }),
            },
          ),
        );
      }
    }
  }
  return issues;
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
 * Checks that each line item's typeId exists for the given platform on-chain.
 *
 * @param stateReader - State reader instance
 * @param infoAddress - CampaignInfo contract address
 * @param platformHash - Platform hash for the line item type lookup
 * @param lineItems - Array of line items to validate
 * @param code - Issue code for unknown line item types
 * @param fieldPrefix - Field prefix for issue paths
 * @returns Array of issues (empty if all valid or state unavailable)
 */
export async function checkLineItemTypes(
  stateReader: StateReader,
  infoAddress: Address,
  platformHash: Hex,
  lineItems: readonly { typeId: Hex; amount: bigint }[],
  code: string,
  fieldPrefix: string,
): Promise<PreflightIssue[]> {
  const issues: PreflightIssue[] = [];
  for (let i = 0; i < lineItems.length; i++) {
    const result = await stateReader.getLineItemType(infoAddress, platformHash, lineItems[i].typeId);
    if (result === null) {
      issues.push(
        createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", `Could not verify line item type at ${fieldPrefix}[${i}].`, {
          fieldPath: `${fieldPrefix}[${i}].typeId`,
        }),
      );
    } else if (!result.exists) {
      issues.push(
        createIssue(code, "error", `Unknown line item type at ${fieldPrefix}[${i}]: ${lineItems[i].typeId}.`, {
          fieldPath: `${fieldPrefix}[${i}].typeId`,
          suggestion: "Use a valid line item type registered for this platform.",
        }),
      );
    }
  }
  return issues;
}

/**
 * Checks that each reward name exists on-chain and the first is a reward tier.
 *
 * @param stateReader - State reader instance
 * @param treasuryAddress - Treasury contract address (AON or KWR)
 * @param rewardNames - Array of reward name hashes
 * @param unknownCode - Issue code for unknown reward
 * @param invalidFirstTierCode - Issue code for invalid first reward tier
 * @param fieldPath - Field path for issue paths
 * @returns Array of issues
 */
export async function checkRewardValidity(
  stateReader: StateReader,
  treasuryAddress: Address,
  rewardNames: readonly Hex[],
  unknownCode: string,
  invalidFirstTierCode: string,
  fieldPath: string,
): Promise<PreflightIssue[]> {
  const issues: PreflightIssue[] = [];
  for (let i = 0; i < rewardNames.length; i++) {
    const reward = await stateReader.getReward(treasuryAddress, rewardNames[i]);
    if (reward === null) {
      issues.push(
        createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", `Could not verify reward at ${fieldPath}[${i}].`, {
          fieldPath: `${fieldPath}[${i}]`,
        }),
      );
      continue;
    }
    if (reward.rewardValue === 0n) {
      issues.push(
        createIssue(unknownCode, "error", `Reward ${rewardNames[i]} at ${fieldPath}[${i}] does not exist.`, {
          fieldPath: `${fieldPath}[${i}]`,
          suggestion: "Use a reward name that has been added to the treasury.",
        }),
      );
    } else if (i === 0 && !reward.isRewardTier) {
      issues.push(
        createIssue(
          invalidFirstTierCode,
          "error",
          `First reward at ${fieldPath}[0] must be a reward tier.`,
          {
            fieldPath: `${fieldPath}[0]`,
            suggestion: "The first reward in the array must have isRewardTier = true.",
          },
        ),
      );
    }
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

/**
 * Validates that each TieredReward's itemId, itemValue, and itemQuantity arrays have matching lengths.
 *
 * @param rewards - Array of tiered rewards to validate
 * @param fieldPrefix - Field prefix for issue paths
 * @returns Array of issues (empty if all valid)
 */
export function checkRewardItemArrayParity(
  rewards: readonly TieredReward[],
  fieldPrefix: string,
): PreflightIssue[] {
  const issues: PreflightIssue[] = [];
  for (let i = 0; i < rewards.length; i++) {
    const r = rewards[i];
    const idLen = r.itemId.length;
    if (r.itemValue.length !== idLen || r.itemQuantity.length !== idLen) {
      issues.push(
        createIssue(
          codes.REWARD_ITEM_ARRAY_MISMATCH,
          "error",
          `Reward at ${fieldPrefix}[${i}] has mismatched item arrays: itemId(${idLen}), itemValue(${r.itemValue.length}), itemQuantity(${r.itemQuantity.length}).`,
          {
            fieldPath: `${fieldPrefix}[${i}]`,
            suggestion: "Ensure itemId, itemValue, and itemQuantity arrays have the same length.",
          },
        ),
      );
    }
  }
  return issues;
}

/**
 * Checks if the campaign deadline has passed (for settlement methods).
 *
 * @param stateReader - State reader instance
 * @param infoAddress - CampaignInfo contract address
 * @param code - Issue code for campaign still active
 * @returns Array of issues (warn if deadline not yet passed)
 */
export async function checkCampaignEnded(
  stateReader: StateReader,
  infoAddress: Address,
  code: string,
): Promise<PreflightIssue[]> {
  const [deadline, now] = await Promise.all([
    stateReader.getDeadline(infoAddress),
    stateReader.getBlockTimestamp(),
  ]);

  if (deadline === null || now === null) {
    return [
      createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read campaign deadline from on-chain state."),
    ];
  }

  if (now <= deadline) {
    return [
      createIssue(code, "error", `Campaign deadline has not passed yet. Deadline: ${deadline}, current time: ${now}.`, {
        suggestion: "Wait until the campaign deadline has passed before performing this operation.",
      }),
    ];
  }

  return [];
}

/**
 * Checks if a treasury is paused.
 *
 * @param stateReader - State reader instance
 * @param treasuryAddress - Treasury contract address
 * @param code - Issue code for treasury paused
 * @returns Array of issues (warn if paused)
 */
export async function checkTreasuryPaused(
  stateReader: StateReader,
  treasuryAddress: Address,
  code: string,
): Promise<PreflightIssue[]> {
  const paused = await stateReader.getPaused(treasuryAddress);
  if (paused === null) {
    return [
      createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read treasury paused state."),
    ];
  }
  if (paused) {
    return [
      createIssue(code, "error", "Treasury is currently paused.", {
        suggestion: "Unpause the treasury before performing this operation.",
      }),
    ];
  }
  return [];
}
