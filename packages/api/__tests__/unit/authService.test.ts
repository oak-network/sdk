import { createOakClient } from "../../src";
import { httpClient } from "../../src/utils/httpClient";
import { ApiError } from "../../src/utils/errorHandler";
import { RetryOptions } from "../../src/utils";
import type { OakClientConfig } from "../../src/types";
import { err, ok } from "../../src/types";

const SANDBOX_URL = "https://api.usecrowdpay.xyz";

jest.mock("../../src/utils/httpClient");
const mockedHttpClient = httpClient as jest.Mocked<typeof httpClient>;

describe("Auth (Unit)", () => {
  const config: OakClientConfig = {
    environment: "sandbox",
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
  };
  const retryOptions: RetryOptions = {
    maxNumberOfRetries: 1,
    delay: 100,
    backoffFactor: 1,
  };

  let client: ReturnType<typeof createOakClient>;

  beforeEach(() => {
    client = createOakClient({
      ...config,
      retryOptions,
    });
    jest.clearAllMocks();
  });

  it("should successfully grant a token", async () => {
    const mockResponse = {
      access_token: "abc123",
      expires_in: 3300000,
      token_type: "bearer",
    };
    mockedHttpClient.post.mockResolvedValue(ok(mockResponse) as never);

    const result = await client.grantToken();

    expect(mockedHttpClient.post).toHaveBeenCalledWith(
      `${SANDBOX_URL}/api/v1/merchant/token/grant`,
      {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: "client_credentials",
      },
      expect.objectContaining({
        retryOptions: expect.objectContaining(retryOptions),
      })
    );

    expect(result).toEqual(ok(mockResponse));
  });

  it("should return cached token if valid", async () => {
    const mockResponse = {
      access_token: "cachedToken",
      expires_in: 3300000,
      token_type: "bearer",
    };
    mockedHttpClient.post.mockResolvedValue(ok(mockResponse) as never);

    const token1 = await client.getAccessToken();
    const token2 = await client.getAccessToken();

    expect(token1).toEqual(ok("cachedToken"));
    expect(token2).toEqual(ok("cachedToken"));
    expect(mockedHttpClient.post).toHaveBeenCalledTimes(1);
  });

  it("should return error result when grantToken fails in getAccessToken", async () => {
    mockedHttpClient.post.mockResolvedValue(
      err(new ApiError("HTTP error", 500, null)) as never
    );

    const result = await client.getAccessToken();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ApiError);
    }
  });

  it("should fetch a new token if expired", async () => {
    const mockResponse1 = {
      access_token: "token1",
      expires_in: 1,
      token_type: "bearer",
    };
    const mockResponse2 = {
      access_token: "token2",
      expires_in: 3600,
      token_type: "bearer",
    };
    mockedHttpClient.post
      .mockResolvedValueOnce(ok(mockResponse1) as never)
      .mockResolvedValueOnce(ok(mockResponse2) as never);

    const token1 = await client.getAccessToken();
    await new Promise((r) => setTimeout(r, 10));
    const token2 = await client.getAccessToken();

    expect(token1).toEqual(ok("token1"));
    expect(token2).toEqual(ok("token2"));
    expect(mockedHttpClient.post).toHaveBeenCalledTimes(2);
  });

  it("should return ApiError if grantToken fails", async () => {
    mockedHttpClient.post.mockResolvedValue(
      err(new ApiError("HTTP error", 500, null)) as never
    );

    const result = await client.grantToken();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ApiError);
    }
  });
});
