// __tests__/unit/authService.test.ts
import { AuthService } from "../../src/services/authService";
import { httpClient } from "../../src/utils/httpClient";
import { SDKConfig, ok } from "../../src/types";
import { SDKError } from "../../src/utils/errorHandler";
import { RetryOptions } from "../../src/utils";
import { getConfigFromEnv } from "../config";

jest.mock("../../src/utils/httpClient");
const mockedHttpClient = httpClient as jest.Mocked<typeof httpClient>;

describe("AuthService (Unit)", () => {
  const config: SDKConfig = getConfigFromEnv();
  const retryOptions: RetryOptions = {
    maxNumberOfRetries: 1,
    delay: 100,
    backoffFactor: 1,
  };

  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService(config, retryOptions);
    jest.clearAllMocks();
  });

  it("should successfully grant a token", async () => {
    const mockResponse = { access_token: "abc123", expires_in: 3300000 };
    mockedHttpClient.post.mockResolvedValue(mockResponse);

    const result = await authService.grantToken();

    expect(mockedHttpClient.post).toHaveBeenCalledWith(
      `${config.baseUrl}/api/v1/merchant/token/grant`,
      {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: "client_credentials",
      },
      { retryOptions }
    );

    expect(result).toEqual(ok(mockResponse));
  });

  it("should return cached token if valid", async () => {
    const mockResponse = { access_token: "cachedToken", expires_in: 3300000 };
    mockedHttpClient.post.mockResolvedValue(mockResponse);

    // First call to fetch token
    const token1 = await authService.getAccessToken();
    // Second call should return cached token
    const token2 = await authService.getAccessToken();

    expect(token1).toEqual(ok("cachedToken"));
    expect(token2).toEqual(ok("cachedToken"));
    // httpClient.post should have been called only once
    expect(mockedHttpClient.post).toHaveBeenCalledTimes(1);
  });

  it("should fetch a new token if expired", async () => {
    const mockResponse1 = { access_token: "token1", expires_in: 1 }; // expires in 1ms
    const mockResponse2 = { access_token: "token2", expires_in: 3600 };
    mockedHttpClient.post
      .mockResolvedValueOnce(mockResponse1)
      .mockResolvedValueOnce(mockResponse2);

    // First call
    const token1 = await authService.getAccessToken();
    // wait to expire token
    await new Promise((r) => setTimeout(r, 10));
    // Second call triggers new token request
    const token2 = await authService.getAccessToken();

    expect(token1).toEqual(ok("token1"));
    expect(token2).toEqual(ok("token2"));
    expect(mockedHttpClient.post).toHaveBeenCalledTimes(2);
  });

  it("should return SDKError if grantToken fails", async () => {
    mockedHttpClient.post.mockRejectedValue(new Error("Network Error"));

    const result = await authService.grantToken();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(SDKError);
    }
  });
});
