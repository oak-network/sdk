import { createHmac, timingSafeEqual } from "crypto";
import { err, ok, Result } from "../types";
import { OakError } from "./errorHandler";

/**
 * Verifies a webhook signature using HMAC-SHA256.
 * Uses timing-safe comparison to prevent timing attacks.
 *
 * @param payload - Raw webhook payload string (usually req.body as string)
 * @param signature - Signature from webhook headers (e.g., x-oak-signature)
 * @param secret - Your webhook secret from Oak dashboard
 * @returns True if signature is valid, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = verifyWebhookSignature(
 *   JSON.stringify(req.body),
 *   req.headers["x-oak-signature"],
 *   process.env.WEBHOOK_SECRET
 * );
 * if (!isValid) {
 *   return res.status(401).send("Invalid signature");
 * }
 * ```
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  try {
    // Generate expected signature
    const hmac = createHmac("sha256", secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest("hex");

    // Convert both signatures to buffers for timing-safe comparison
    const signatureBuffer = Buffer.from(signature, "utf-8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");

    // Ensure buffers are same length to prevent timing attacks
    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    // Use timing-safe comparison
    return timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Parses and verifies a webhook payload in one step.
 * Combines signature verification with JSON parsing.
 *
 * @param payload - Raw webhook payload string
 * @param signature - Signature from webhook headers
 * @param secret - Your webhook secret
 * @returns Result containing parsed payload or error
 *
 * @example
 * ```typescript
 * const result = parseWebhookPayload<PaymentEvent>(
 *   JSON.stringify(req.body),
 *   req.headers["x-oak-signature"],
 *   process.env.WEBHOOK_SECRET
 * );
 *
 * if (!result.ok) {
 *   return res.status(401).send(result.error.message);
 * }
 *
 * const event = result.value;
 * // Handle event...
 * ```
 */
export function parseWebhookPayload<T>(
  payload: string,
  signature: string,
  secret: string,
): Result<T> {
  // Verify signature first
  if (!verifyWebhookSignature(payload, signature, secret)) {
    return err(
      new OakError(
        "Invalid webhook signature",
        "WEBHOOK_VERIFICATION_FAILED",
        401,
      ),
    );
  }

  // Parse JSON
  try {
    const parsed = JSON.parse(payload) as T;
    return ok(parsed);
  } catch (error) {
    return err(
      new OakError(
        `Failed to parse webhook payload: ${error instanceof Error ? error.message : String(error)}`,
        "WEBHOOK_PARSE_ERROR",
        400,
      ),
    );
  }
}
