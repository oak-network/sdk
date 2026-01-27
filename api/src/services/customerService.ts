import {
  SDKConfig,
  CreateCustomerRequest,
  CreateCustomerResponse,
  CustomerListQueryParams,
  GetAllCustomerResponse,
  GetCustomerResponse,
  UpdateCustomerRequest,
  UpdateCustomerResponse,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { AuthService } from "./authService";
import { RetryOptions } from "../utils/defaultRetryConfig";

export class CustomerService {
  private config: SDKConfig;
  private authService: AuthService;
  private retryOptions: RetryOptions;

  constructor(
    config: SDKConfig,
    authService: AuthService,
    retryOptions: RetryOptions
  ) {
    this.config = config;
    this.authService = authService;
    this.retryOptions = retryOptions;
  }

  async createCustomer(
    customer: CreateCustomerRequest
  ): Promise<CreateCustomerResponse> {
    try {
      // Proactively ensure a valid token before making the request
      const token = await this.authService.getAccessToken();

      const response = await httpClient.post<CreateCustomerResponse>(
        `${this.config.baseUrl}/api/v1/customers`,
        customer,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return response;
    } catch (error) {
      throw new SDKError("Failed to create customer", error);
    }
  }

  async getCustomer(id: string): Promise<GetCustomerResponse> {
    try {
      // Proactively ensure a valid token before making the request
      const token = await this.authService.getAccessToken();

      const response = await httpClient.get<GetCustomerResponse>(
        `${this.config.baseUrl}/api/v1/customers/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return response;
    } catch (error) {
      throw new SDKError("Failed to retrieve customer", error);
    }
  }

  async getAllCustomers(
    params?: CustomerListQueryParams
  ): Promise<GetAllCustomerResponse> {
    try {
      const token = await this.authService.getAccessToken();

      const queryString = params
        ? `?${Object.entries(params)
            .filter(([_, value]) => value !== undefined)
            .map(
              ([key, value]) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
            )
            .join("&")}`
        : "";

      const response = await httpClient.get<GetAllCustomerResponse>(
        `${this.config.baseUrl}/api/v1/customers${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return response;
    } catch (error) {
      throw new SDKError("Failed to list customers", error);
    }
  }

  async updateCustomer(
    id: string,
    customer: UpdateCustomerRequest
  ): Promise<UpdateCustomerResponse> {
    try {
      // Proactively ensure a valid token before making the request
      const token = await this.authService.getAccessToken();

      const response = await httpClient.put<UpdateCustomerResponse>(
        `${this.config.baseUrl}/api/v1/customers/${id}`,
        customer,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return response;
    } catch (error) {
      throw new SDKError("Failed to update customer", error);
    }
  }
}
