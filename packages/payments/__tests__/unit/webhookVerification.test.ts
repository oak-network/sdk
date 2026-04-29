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

  // Helper to generate CrowdSplit-Signature header format
  const generateCrowdSplitSignature = (
    data: string,
    webhookSecret: string,
    timestamp: string,
  ): string => {
    const base = `${timestamp}.${data}`;
    const hmac = createHmac("sha256", webhookSecret);
    hmac.update(base, "utf8");
    const sig = hmac.digest("hex");
    return `t=${timestamp},v1=${sig}`;
  };

  describe("verifyWebhookSignature", () => {
    it("should verify valid CrowdSplit-Signature format (t=,v1=)", () => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = generateCrowdSplitSignature(payload, secret, timestamp);
      const result = verifyWebhookSignature(payload, signature, secret);
      expect(result).toBe(true);
    });

    it("should reject invalid CrowdSplit-Signature", () => {
      const signature = "t=12345,v1=invalidsignature";
      const result = verifyWebhookSignature(payload, signature, secret);
      expect(result).toBe(false);
    });

    it("should reject CrowdSplit-Signature with wrong secret", () => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = generateCrowdSplitSignature(payload, "wrong-secret", timestamp);
      const result = verifyWebhookSignature(payload, signature, secret);
      expect(result).toBe(false);
    });

    it("should reject CrowdSplit-Signature with tampered payload", () => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = generateCrowdSplitSignature(payload, secret, timestamp);
      const tamperedPayload = JSON.stringify({
        event: "payment.created",
        id: "pay_999",
      });
      const result = verifyWebhookSignature(tamperedPayload, signature, secret);
      expect(result).toBe(false);
    });

    it("should verify legacy raw signature format (fallback)", () => {
      const signature = generateSignature(payload, secret);
      const result = verifyWebhookSignature(payload, signature, secret);
      expect(result).toBe(true);
    });

    it("should reject invalid legacy signature", () => {
      const invalidSignature = "invalid-signature-12345";
      const result = verifyWebhookSignature(payload, invalidSignature, secret);
      expect(result).toBe(false);
    });

    it("should handle empty payload with CrowdSplit-Signature", () => {
      const emptyPayload = "";
      const timestamp = "1234567890";
      const signature = generateCrowdSplitSignature(emptyPayload, secret, timestamp);
      const result = verifyWebhookSignature(emptyPayload, signature, secret);
      expect(result).toBe(true);
    });

    it("should return false for signatures of different lengths", () => {
      const shortSignature = "abc";
      const result = verifyWebhookSignature(payload, shortSignature, secret);
      expect(result).toBe(false);
    });

    it("should handle CrowdSplit-Signature with empty timestamp", () => {
      const signature = "t=,v1=somesig";
      const result = verifyWebhookSignature(payload, signature, secret);
      expect(result).toBe(false);
    });
  });

  describe("parseWebhookPayload", () => {
    interface TestEvent {
      event: string;
      id: string;
    }

    it("should parse and verify valid webhook with CrowdSplit-Signature", () => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = generateCrowdSplitSignature(payload, secret, timestamp);
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
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = generateCrowdSplitSignature(invalidPayload, secret, timestamp);
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
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = generateCrowdSplitSignature(complexPayload, secret, timestamp);
      const result = parseWebhookPayload(complexPayload, signature, secret);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveProperty("data.payment.metadata.userId");
      }
    });
  });
});
