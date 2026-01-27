// __tests__/unit/authService.test.ts
import { AuthService } from "../../src/services/authService";
import { SDKConfig } from "../../src/types";
import { getConfigFromEnv } from "../config";

describe("AuthService (Integration)", () => {
  const authService = new AuthService(getConfigFromEnv(), {
    maxNumberOfRetries: 1,
    delay: 100,
    backoffFactor: 1,
  });

  it("should get a real access token", async () => {
    const response = await authService.grantToken();
    expect(response.access_token).toBeDefined();
    expect(response.expires_in).toBeGreaterThan(0);
  });

  it("should return the same token if not expired", async () => {
    const firstToken = await authService.getAccessToken();
    const secondToken = await authService.getAccessToken();
    expect(secondToken).toBe(firstToken); // token cached and reused
  });

  it("should refresh token if expired", async () => {
    // Force token expiration by setting internal expiration time in the past
    (authService as any).tokenExpiration = Date.now() - 1000;

    const newToken = await authService.getAccessToken();
    expect(newToken).toBeDefined();
    expect(newToken).not.toBeNull();
  });

  it("should throw SDKError on invalid credentials", async () => {
    const badConfig: SDKConfig = {
      clientId: "invalid",
      clientSecret: "invalid",
      baseUrl: getConfigFromEnv().baseUrl,
    };
    const badAuthService = new AuthService(badConfig, {
      maxNumberOfRetries: 1,
      delay: 100,
      backoffFactor: 1,
    });

    await expect(badAuthService.grantToken()).rejects.toThrow(
      "Failed to grant token"
    );
  });
});
