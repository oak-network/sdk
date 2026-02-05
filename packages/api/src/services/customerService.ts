import type {
  CreateCustomerRequest,
  CreateCustomerResponse,
  CustomerListQueryParams,
  GetAllCustomerResponse,
  GetCustomerResponse,
  OakClient,
  Result,
  UpdateCustomerRequest,
  UpdateCustomerResponse,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { buildQueryString } from "./helpers";
import { err, ok } from "../types";

export interface CustomerService {
  create(
    customer: CreateCustomerRequest,
  ): Promise<Result<CreateCustomerResponse>>;
  get(id: string): Promise<Result<GetCustomerResponse>>;
  list(
    params?: CustomerListQueryParams,
  ): Promise<Result<GetAllCustomerResponse>>;
  update(
    id: string,
    customer: UpdateCustomerRequest,
  ): Promise<Result<UpdateCustomerResponse>>;
}

export const createCustomerService = (client: OakClient): CustomerService => ({
  async create(
    customer: CreateCustomerRequest,
  ): Promise<Result<CreateCustomerResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.post<CreateCustomerResponse>(
        `${client.config.baseUrl}/api/v1/customers`,
        customer,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: client.retryOptions,
        },
      );

      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to create customer", error));
    }
  },

  async get(id: string): Promise<Result<GetCustomerResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.get<GetCustomerResponse>(
        `${client.config.baseUrl}/api/v1/customers/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: client.retryOptions,
        },
      );

      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to retrieve customer", error));
    }
  },

  async list(
    params?: CustomerListQueryParams,
  ): Promise<Result<GetAllCustomerResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const queryString = buildQueryString(params);

      const response = await httpClient.get<GetAllCustomerResponse>(
        `${client.config.baseUrl}/api/v1/customers${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: client.retryOptions,
        },
      );

      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to list customers", error));
    }
  },

  async update(
    id: string,
    customer: UpdateCustomerRequest,
  ): Promise<Result<UpdateCustomerResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.put<UpdateCustomerResponse>(
        `${client.config.baseUrl}/api/v1/customers/${id}`,
        customer,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: client.retryOptions,
        },
      );

      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to update customer", error));
    }
  },
});
