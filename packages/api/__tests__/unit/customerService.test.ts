import { createOakClient } from "../../src";
import { Crowdsplit } from "../../src/products/crowdsplit";
import { httpClient } from "../../src/utils/httpClient";
import { ApiError } from "../../src/utils/errorHandler";
import { RetryOptions } from "../../src/utils/defaultRetryConfig";
import {
  OakClientConfig,
  CreateCustomerRequest,
  CustomerListQueryParams,
  ok,
  err,
} from "../../src/types";

const SANDBOX_URL = "https://api.usecrowdpay.xyz";

jest.mock("../../src/utils/httpClient", () => ({
  httpClient: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
  },
}));

describe("CustomerService - Unit", () => {
  let customers: ReturnType<typeof Crowdsplit>["customers"];
  let client: ReturnType<typeof createOakClient>;
  let config: OakClientConfig;
  let retryOptions: RetryOptions;

  beforeEach(() => {
    config = {
      environment: "sandbox",
      clientId: process.env.CLIENT_ID || "test-client-id",
      clientSecret: process.env.CLIENT_SECRET || "test-client-secret",
    };
    retryOptions = { maxNumberOfRetries: 1, delay: 100, backoffFactor: 2 };
    client = createOakClient({
      ...config,
      retryOptions,
    });
    jest
      .spyOn(client, "getAccessToken")
      .mockResolvedValue(ok("fake-token"));
    customers = Crowdsplit(client).customers;
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should call POST /api/v1/customers with correct payload", async () => {
      const request: CreateCustomerRequest = { email: "test@example.com" };
      const mockResponse = { data: { email: "test@example.com" } };
      (httpClient.post as jest.Mock).mockResolvedValue(ok(mockResponse));

      const result = await customers.create(request);

      expect(client.getAccessToken).toHaveBeenCalled();
      expect(httpClient.post).toHaveBeenCalledWith(
        `${SANDBOX_URL}/api/v1/customers`,
        request,
        expect.objectContaining({
          headers: { Authorization: "Bearer fake-token" },
          retryOptions: expect.objectContaining(retryOptions),
        })
      );
      expect(result).toEqual(ok(mockResponse));
    });

    it("should return ApiError on failure", async () => {
      const apiError = new ApiError("HTTP error", 500, { msg: "fail" });
      (httpClient.post as jest.Mock).mockResolvedValue(err(apiError));

      const result = await customers.create({ email: "fail@example.com" });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(ApiError);
      }
    });
  });

  describe("get", () => {
    it("should call GET /api/v1/customers/:id", async () => {
      const mockResponse = { data: { email: "test@example.com" } };
      (httpClient.get as jest.Mock).mockResolvedValue(ok(mockResponse));

      const result = await customers.get("123");

      expect(httpClient.get).toHaveBeenCalledWith(
        `${SANDBOX_URL}/api/v1/customers/123`,
        expect.objectContaining({
          headers: { Authorization: "Bearer fake-token" },
          retryOptions: expect.objectContaining(retryOptions),
        })
      );
      expect(result).toEqual(ok(mockResponse));
    });
  });

  describe("list", () => {
    it("should call GET /api/v1/customers with query params", async () => {
      const params: CustomerListQueryParams = { limit: 10, offset: 5 };
      const mockResponse = { data: { count: 1, customer_list: [] } };
      (httpClient.get as jest.Mock).mockResolvedValue(ok(mockResponse));

      const result = await customers.list(params);

      expect(httpClient.get).toHaveBeenCalledWith(
        `${SANDBOX_URL}/api/v1/customers?limit=10&offset=5`,
        expect.objectContaining({
          headers: { Authorization: "Bearer fake-token" },
          retryOptions: expect.objectContaining(retryOptions),
        })
      );
      expect(result).toEqual(ok(mockResponse));
    });
  });

  describe("update", () => {
    it("should call PUT /api/v1/customers/:id", async () => {
      const updateData = { email: "updated@example.com" };
      const mockResponse = { data: { email: "updated@example.com" } };
      (httpClient.put as jest.Mock).mockResolvedValue(ok(mockResponse));

      const result = await customers.update("123", updateData);

      expect(httpClient.put).toHaveBeenCalledWith(
        `${SANDBOX_URL}/api/v1/customers/123`,
        updateData,
        expect.objectContaining({
          headers: { Authorization: "Bearer fake-token" },
          retryOptions: expect.objectContaining(retryOptions),
        })
      );
      expect(result).toEqual(ok(mockResponse));
    });
  });
});
