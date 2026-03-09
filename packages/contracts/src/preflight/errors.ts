/**
 * Thrown when safe() is called without a signer configured on the wallet client.
 * This is a configuration error, not a runtime validation result.
 *
 * @example
 * ```typescript
 * try {
 *   await method.safe(input);
 * } catch (err) {
 *   if (err instanceof MissingSignerError) {
 *     console.error("Configure a signer before calling safe()");
 *   }
 * }
 * ```
 */
export class MissingSignerError extends Error {
  readonly name = "MissingSignerError" as const;

  constructor() {
    super(
      "safe() requires a signer (walletClient.account). Configure a signer before calling safe().",
    );
  }
}
