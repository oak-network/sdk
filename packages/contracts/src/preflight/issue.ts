import type { PreflightIssue } from "./types.js";

/**
 * Creates a PreflightIssue with the given parameters.
 *
 * @param code - Stable issue code (e.g., `OAK-PF-COMMON-ZERO_ADDRESS`)
 * @param severity - `error` or `warn`
 * @param message - Human-readable description
 * @param opts - Optional fieldPath, suggestion, and normalized flag
 * @returns A PreflightIssue object
 */
export function createIssue(
  code: string,
  severity: "error" | "warn",
  message: string,
  opts?: { fieldPath?: string; suggestion?: string; normalized?: boolean },
): PreflightIssue {
  const issue: PreflightIssue = { code, severity, message };
  if (opts?.fieldPath !== undefined) issue.fieldPath = opts.fieldPath;
  if (opts?.suggestion !== undefined) issue.suggestion = opts.suggestion;
  if (opts?.normalized !== undefined) issue.normalized = opts.normalized;
  return issue;
}
