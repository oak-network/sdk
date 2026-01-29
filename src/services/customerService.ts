import {
  SDKConfig,
  CreateCustomerRequest,
  CreateCustomerResponse,
  CustomerListQueryParams,
  GetAllCustomerResponse,
  GetCustomerResponse,
  UpdateCustomerRequest,
  UpdateCustomerResponse,
  Result,
  ok,
  err,
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
  ): Promise<Result<CreateCustomerResponse, SDKError>> {
    try {
      // Proactively ensure a valid token before making the request
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.post<CreateCustomerResponse>(
        `${this.config.baseUrl}/api/v1/customers`,
        customer,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to create customer", error));
    }
  }

  async getCustomer(id: string): Promise<Result<GetCustomerResponse, SDKError>> {
    try {
      // Proactively ensure a valid token before making the request
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.get<GetCustomerResponse>(
        `${this.config.baseUrl}/api/v1/customers/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to retrieve customer", error));
    }
  }

  async getAllCustomers(
    params?: CustomerListQueryParams
  ): Promise<Result<GetAllCustomerResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

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
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to list customers", error));
    }
  }

  async updateCustomer(
    id: string,
    customer: UpdateCustomerRequest
  ): Promise<Result<UpdateCustomerResponse, SDKError>> {
    try {
      // Proactively ensure a valid token before making the request
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.put<UpdateCustomerResponse>(
        `${this.config.baseUrl}/api/v1/customers/${id}`,
        customer,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to update customer", error));
    }
  }
}
