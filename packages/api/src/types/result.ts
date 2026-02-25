import { OakError } from "../utils/errorHandler";

/**
 * Discriminated union representing success or failure.
 * @typeParam T - Success value type
 * @typeParam E - Error type (defaults to OakError)
 */
export type Result<T, E = OakError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * @param value - The success value to wrap
 * @returns A Result with ok: true
 */
export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

/**
 * @param error - The error to wrap
 * @returns A Result with ok: false
 */
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
