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
    expect(response.access_token).toBeDefined();
    expect(response.expires_in).toBeGreaterThan(0);
  });

  it("should return the same token if not expired", async () => {
    const firstToken = await client.getAccessToken();
    const secondToken = await client.getAccessToken();
    expect(secondToken).toBe(firstToken); // token cached and reused
  });

  it("should refresh token if expired", async () => {
    const originalNow = Date.now;
    await client.getAccessToken();
    const nowSpy = jest
      .spyOn(Date, "now")
      .mockImplementation(() => originalNow() + 86400000);

    const newToken = await client.getAccessToken();

    nowSpy.mockRestore();
    expect(newToken).toBeDefined();
    expect(newToken).not.toBeNull();
  });

  it("should throw SDKError on invalid credentials", async () => {
    const badConfig = {
      clientId: "invalid",
      clientSecret: "invalid",
      baseUrl: getConfigFromEnv().baseUrl,
    };
    const badClient = createOakClient({
      ...badConfig,
      retryOptions: {
        maxNumberOfRetries: 1,
        delay: 100,
        backoffFactor: 1,
      },
    });

    await expect(badClient.grantToken()).rejects.toThrow(
      "Failed to grant token"
    );
  });
});
