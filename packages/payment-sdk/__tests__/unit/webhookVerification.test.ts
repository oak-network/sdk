import { createHmac } from "crypto";
import {
  verifyWebhookSignature,
  parseWebhookPayload,
} from "../../src/utils/webhookVerification";

describe("webhookVerification", () => {
  const secret = "test-webhook-secret";
  const payload = JSON.stringify({ event: "payment.created", id: "pay_123" });

  // Helper to generate valid signature
  const generateSignature = (data: string, webhookSecret: string): string => {
    const hmac = createHmac("sha256", webhookSecret);
    hmac.update(data);
    return hmac.digest("hex");
  };

  describe("verifyWebhookSignature", () => {
    it("should verify valid signature", () => {
      const signature = generateSignature(payload, secret);
      const result = verifyWebhookSignature(payload, signature, secret);
      expect(result).toBe(true);
    });

    it("should reject invalid signature", () => {
      const invalidSignature = "invalid-signature-12345";
      const result = verifyWebhookSignature(payload, invalidSignature, secret);
      expect(result).toBe(false);
    });

    it("should reject signature with wrong secret", () => {
      const signature = generateSignature(payload, "wrong-secret");
      const result = verifyWebhookSignature(payload, signature, secret);
      expect(result).toBe(false);
    });

    it("should reject signature with tampered payload", () => {
      const signature = generateSignature(payload, secret);
      const tamperedPayload = JSON.stringify({
        event: "payment.created",
        id: "pay_999",
      });
      const result = verifyWebhookSignature(
        tamperedPayload,
        signature,
        secret,
      );
      expect(result).toBe(false);
    });

    it("should handle empty payload", () => {
      const emptyPayload = "";
      const signature = generateSignature(emptyPayload, secret);
      const result = verifyWebhookSignature(emptyPayload, signature, secret);
      expect(result).toBe(true);
    });

    it("should return false for signatures of different lengths", () => {
      const shortSignature = "abc";
      const result = verifyWebhookSignature(payload, shortSignature, secret);
      expect(result).toBe(false);
    });
  });

  describe("parseWebhookPayload", () => {
    interface TestEvent {
      event: string;
      id: string;
    }

    it("should parse and verify valid webhook", () => {
      const signature = generateSignature(payload, secret);
      const result = parseWebhookPayload<TestEvent>(payload, signature, secret);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.event).toBe("payment.created");
        expect(result.value.id).toBe("pay_123");
      }
    });

    it("should reject invalid signature", () => {
      const invalidSignature = "invalid-signature";
      const result = parseWebhookPayload<TestEvent>(
        payload,
        invalidSignature,
        secret,
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe("Invalid webhook signature");
        expect(result.error.status).toBe(401);
      }
    });

    it("should reject invalid JSON", () => {
      const invalidPayload = "{ invalid json }";
      const signature = generateSignature(invalidPayload, secret);
      const result = parseWebhookPayload<TestEvent>(
        invalidPayload,
        signature,
        secret,
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("Failed to parse webhook payload");
        expect(result.error.status).toBe(400);
      }
    });

    it("should handle complex nested objects", () => {
      const complexPayload = JSON.stringify({
        event: "payment.created",
        data: {
          payment: {
            id: "pay_123",
            amount: 1000,
            metadata: { userId: "user_456" },
          },
        },
      });
      const signature = generateSignature(complexPayload, secret);
      const result = parseWebhookPayload(complexPayload, signature, secret);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveProperty("data.payment.metadata.userId");
      }
    });
  });
});
