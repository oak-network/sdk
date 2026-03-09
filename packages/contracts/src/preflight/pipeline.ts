import type {
  MethodValidator,
  PreflightContext,
  PreflightIssue,
  PreflightResult,
  ResolvedPreflightOptions,
} from "./types.js";
import { createIssue } from "./issue.js";
import { COMMON_STATE_UNAVAILABLE } from "./issue-codes.js";

/**
 * Determines if an issue is blocking for the given mode.
 */
function isBlocking(issue: PreflightIssue, mode: ResolvedPreflightOptions["mode"]): boolean {
  if (mode === "strict") return true;
  return issue.severity === "error";
}

/**
 * Checks if any issue in the list is blocking.
 */
function hasBlockingIssue(issues: PreflightIssue[], mode: ResolvedPreflightOptions["mode"]): boolean {
  return issues.some((i) => isBlocking(i, mode));
}

/**
 * Runs the preflight validation pipeline: structural -> semantic -> stateful -> normalize.
 *
 * @param input - The method input to validate
 * @param validator - The method validator definition
 * @param ctx - The preflight context
 * @returns PreflightResult with ok/issues/normalized
 */
export async function runPreflight<T>(
  input: T,
  validator: MethodValidator<T>,
  ctx: PreflightContext,
): Promise<PreflightResult<T>> {
  const allIssues: PreflightIssue[] = [];
  const { mode, collect, stateful } = ctx.options;

  // 1. Structural validation
  for (const rule of validator.structural) {
    const issues = await rule(input, ctx);
    allIssues.push(...issues);
    if (!collect && hasBlockingIssue(allIssues, mode)) {
      return buildResult(input, allIssues, mode);
    }
  }

  // 2. Semantic validation
  for (const rule of validator.semantic) {
    const issues = await rule(input, ctx);
    allIssues.push(...issues);
    if (!collect && hasBlockingIssue(allIssues, mode)) {
      return buildResult(input, allIssues, mode);
    }
  }

  // 3. Stateful validation (if enabled)
  if (stateful !== "local-only") {
    for (const rule of validator.stateful) {
      try {
        const issues = await rule(input, ctx);
        allIssues.push(...issues);
        if (!collect && hasBlockingIssue(allIssues, mode)) {
          return buildResult(input, allIssues, mode);
        }
      } catch (error: unknown) {
        const detail = error instanceof Error ? error.message : String(error);
        allIssues.push(
          createIssue(
            COMMON_STATE_UNAVAILABLE,
            "error",
            `Stateful validation failed unexpectedly: ${detail}. Aborting remaining stateful checks.`,
          ),
        );
        break;
      }
    }
  }

  // 4. Normalization (if mode is 'normalize' and normalizer exists)
  let normalized = input;
  if (mode === "normalize" && validator.normalize) {
    normalized = validator.normalize(input);
  }

  return buildResult(normalized, allIssues, mode);
}

/**
 * Builds the final PreflightResult from collected issues.
 */
function buildResult<T>(
  normalized: T,
  issues: PreflightIssue[],
  mode: ResolvedPreflightOptions["mode"],
): PreflightResult<T> {
  const ok = !hasBlockingIssue(issues, mode);

  if (ok) {
    return {
      ok: true,
      normalized,
      warnings: issues,
    };
  }

  return {
    ok: false,
    issues,
    normalized,
  };
}
