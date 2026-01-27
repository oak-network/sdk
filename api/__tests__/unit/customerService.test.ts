import { CustomerService } from "../../src/services/customerService";
import { AuthService } from "../../src/services/authService";
import { httpClient } from "../../src/utils/httpClient";
import { SDKError } from "../../src/utils/errorHandler";
import { RetryOptions } from "../../src/utils/defaultRetryConfig";
import {
  SDKConfig,
  CreateCustomerRequest,
  CustomerListQueryParams,
} from "../../src/types";

jest.mock("../../src/utils/httpClient", () => ({
  httpClient: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
  },
}));

describe("CustomerService - Unit", () => {
  let customerService: CustomerService;
  let mockAuthService: jest.Mocked<AuthService>;
  let config: SDKConfig;
  let retryOptions: RetryOptions;

  beforeEach(() => {
    config = {
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      baseUrl: process.env.BASE_URL!, // staging URL
    };
    retryOptions = { maxNumberOfRetries: 1, delay: 100, backoffFactor: 2 };
    mockAuthService = {
      getAccessToken: jest.fn().mockResolvedValue("fake-token"),
    } as any;

    customerService = new CustomerService(
      config,
      mockAuthService,
      retryOptions
    );
    jest.clearAllMocks();
  });

  describe("createCustomer", () => {
    it("should call POST /api/v1/customers with correct payload", async () => {
      const request: CreateCustomerRequest = { email: "test@example.com" };
      const mockResponse = { data: { email: "test@example.com" } };
      (httpClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await customerService.createCustomer(request);

      expect(mockAuthService.getAccessToken).toHaveBeenCalled();
      expect(httpClient.post).toHaveBeenCalledWith(
        `${process.env.BASE_URL}/api/v1/customers`,
        request,
        expect.objectContaining({
          headers: { Authorization: "Bearer fake-token" },
          retryOptions,
        })
      );
      expect(result).toBe(mockResponse);
    });

    it("should throw SDKError on failure", async () => {
      (httpClient.post as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await expect(
        customerService.createCustomer({ email: "fail@example.com" })
      ).rejects.toThrow(SDKError);
    });
  });

  describe("getCustomer", () => {
    it("should call GET /api/v1/customers/:id", async () => {
      const mockResponse = { data: { email: "test@example.com" } };
      (httpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await customerService.getCustomer("123");

      expect(httpClient.get).toHaveBeenCalledWith(
        `${process.env.BASE_URL}/api/v1/customers/123`,
        expect.objectContaining({
          headers: { Authorization: "Bearer fake-token" },
          retryOptions,
        })
      );
      expect(result).toBe(mockResponse);
    });
  });

  describe("getAllCustomers", () => {
    it("should call GET /api/v1/customers with query params", async () => {
      const params: CustomerListQueryParams = { limit: 10, offset: 5 };
      const mockResponse = { data: { count: 1, customer_list: [] } };
      (httpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await customerService.getAllCustomers(params);

      expect(httpClient.get).toHaveBeenCalledWith(
        `${process.env.BASE_URL}/api/v1/customers?limit=10&offset=5`,
        expect.objectContaining({
          headers: { Authorization: "Bearer fake-token" },
          retryOptions,
        })
      );
      expect(result).toBe(mockResponse);
    });
  });

  describe("updateCustomer", () => {
    it("should call PUT /api/v1/customers/:id", async () => {
      const updateData = { email: "updated@example.com" };
      const mockResponse = { data: { email: "updated@example.com" } };
      (httpClient.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await customerService.updateCustomer("123", updateData);

      expect(httpClient.put).toHaveBeenCalledWith(
        `${process.env.BASE_URL}/api/v1/customers/123`,
        updateData,
        expect.objectContaining({
          headers: { Authorization: "Bearer fake-token" },
          retryOptions,
        })
      );
      expect(result).toBe(mockResponse);
    });
  });
});
