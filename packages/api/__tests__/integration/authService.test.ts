import { createOakClient } from "../../src";
import { getConfigFromEnv } from "../config";

describe("Auth (Integration)", () => {
  const client = createOakClient({
    ...getConfigFromEnv(),
    retryOptions: {
      maxNumberOfRetries: 1,
      delay: 100,
      backoffFactor: 1,
    },
  });

  it("should get a real access token", async () => {
    const response = await client.grantToken();
    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.value.access_token).toBeDefined();
      expect(response.value.expires_in).toBeGreaterThan(0);
    }
  });

  it("should return the same token if not expired", async () => {
    const firstResult = await client.getAccessToken();
    const secondResult = await client.getAccessToken();
    expect(firstResult.ok).toBe(true);
    expect(secondResult.ok).toBe(true);
    if (firstResult.ok && secondResult.ok) {
      expect(secondResult.value).toBe(firstResult.value);
    }
  });

  it("should refresh token if expired", async () => {
    const originalNow = Date.now;
    await client.getAccessToken();
    const nowSpy = jest
      .spyOn(Date, "now")
      .mockImplementation(() => originalNow() + 86400000);

    const newTokenResult = await client.getAccessToken();

    nowSpy.mockRestore();
    expect(newTokenResult.ok).toBe(true);
    if (newTokenResult.ok) {
      expect(newTokenResult.value).toBeDefined();
      expect(newTokenResult.value).not.toBeNull();
    }
  });

  it("should return error on invalid credentials", async () => {
    const badClient = createOakClient({
      environment: "sandbox",
      clientId: "invalid",
      clientSecret: "invalid",
      retryOptions: {
        maxNumberOfRetries: 1,
        delay: 100,
        backoffFactor: 1,
      },
    });

    const result = await badClient.grantToken();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("Failed to grant token");
    }
  });
});
