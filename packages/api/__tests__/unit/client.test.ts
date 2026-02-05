import { createOakClient } from "../../src/client";
import type { OakClientConfig } from "../../src/types/client";

jest.mock("../../src/authManager", () => ({
  AuthManager: jest.fn().mockImplementation(() => ({
    getAccessToken: jest.fn().mockResolvedValue({ ok: true, value: "mock-token" }),
    grantToken: jest.fn().mockResolvedValue({
      ok: true,
      value: { access_token: "mock-token", expires_in: 3600 },
    }),
  })),
}));

describe("createOakClient", () => {
  const baseConfig: Omit<OakClientConfig, "environment"> = {
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
  };

  describe("environment URL resolution", () => {
    it("should resolve sandbox URL for sandbox environment", () => {
      const client = createOakClient({
        ...baseConfig,
        environment: "sandbox",
      });

      expect(client.config.baseUrl).toBe(process.env.CROWDSPLIT_SANDBOX_URL);
      expect(client.config.environment).toBe("sandbox");
    });

    it("should resolve production URL for production environment", () => {
      const originalProd = process.env.CROWDSPLIT_PRODUCTION_URL;
      const testProdUrl = originalProd || "https://api.production.example.com";

      if (!originalProd) {
        process.env.CROWDSPLIT_PRODUCTION_URL = testProdUrl;
      }

      const client = createOakClient({
        ...baseConfig,
        environment: "production",
      });

      expect(client.config.baseUrl).toBe(testProdUrl);
      expect(client.config.environment).toBe("production");

      if (!originalProd) {
        delete process.env.CROWDSPLIT_PRODUCTION_URL;
      }
    });

    it("should use customUrl when provided", () => {
      const customUrl = "http://localhost:3000";
      const client = createOakClient({
        ...baseConfig,
        environment: "sandbox",
        customUrl,
      });

      expect(client.config.baseUrl).toBe(customUrl);
      expect(client.config.environment).toBe("sandbox");
    });

    it("should preserve customUrl with production environment", () => {
      const customUrl = "http://localhost:3000";
      const client = createOakClient({
        ...baseConfig,
        environment: "production",
        customUrl,
      });

      expect(client.config.baseUrl).toBe(customUrl);
      expect(client.config.environment).toBe("production");
    });
  });

  describe("config preservation", () => {
    it("should preserve clientId and clientSecret", () => {
      const client = createOakClient({
        ...baseConfig,
        environment: "sandbox",
      });

      expect(client.config.clientId).toBe(baseConfig.clientId);
      expect(client.config.clientSecret).toBe(baseConfig.clientSecret);
    });

    it("should preserve custom retry options", () => {
      const customRetryOptions = {
        maxNumberOfRetries: 5,
        delay: 500,
      };

      const client = createOakClient({
        ...baseConfig,
        environment: "sandbox",
        retryOptions: customRetryOptions,
      });

      expect(client.retryOptions.maxNumberOfRetries).toBe(5);
      expect(client.retryOptions.delay).toBe(500);
    });
  });

  describe("client methods", () => {
    it("should provide getAccessToken method", async () => {
      const client = createOakClient({
        ...baseConfig,
        environment: "sandbox",
      });

      const result = await client.getAccessToken();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("mock-token");
      }
    });

    it("should provide grantToken method", async () => {
      const client = createOakClient({
        ...baseConfig,
        environment: "sandbox",
      });

      const result = await client.grantToken();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.access_token).toBe("mock-token");
      }
    });
  });
});
