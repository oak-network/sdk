import type {
  CreateCustomerRequest,
  CreateCustomerResponse,
  CustomerListQueryParams,
  GetAllCustomerResponse,
  GetCustomerResponse,
  OakClient,
  UpdateCustomerRequest,
  UpdateCustomerResponse,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { buildQueryString } from "./helpers";

export interface CustomerService {
  create(customer: CreateCustomerRequest): Promise<CreateCustomerResponse>;
  get(id: string): Promise<GetCustomerResponse>;
  list(params?: CustomerListQueryParams): Promise<GetAllCustomerResponse>;
  update(
    id: string,
    customer: UpdateCustomerRequest,
  ): Promise<UpdateCustomerResponse>;
}

export const createCustomerService = (client: OakClient): CustomerService => ({
  async create(
    customer: CreateCustomerRequest,
  ): Promise<CreateCustomerResponse> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.post<CreateCustomerResponse>(
        `${client.config.baseUrl}/api/v1/customers`,
        customer,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      );

      return response;
    } catch (error) {
      throw new SDKError("Failed to create customer", error);
    }
  },

  async get(id: string): Promise<GetCustomerResponse> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.get<GetCustomerResponse>(
        `${client.config.baseUrl}/api/v1/customers/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      );

      return response;
    } catch (error) {
      throw new SDKError("Failed to retrieve customer", error);
    }
  },

  async list(
    params?: CustomerListQueryParams,
  ): Promise<GetAllCustomerResponse> {
    try {
      const token = await client.getAccessToken();
      const queryString = buildQueryString(params);

      const response = await httpClient.get<GetAllCustomerResponse>(
        `${client.config.baseUrl}/api/v1/customers${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      );

      return response;
    } catch (error) {
      throw new SDKError("Failed to list customers", error);
    }
  },

  async update(
    id: string,
    customer: UpdateCustomerRequest,
  ): Promise<UpdateCustomerResponse> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.put<UpdateCustomerResponse>(
        `${client.config.baseUrl}/api/v1/customers/${id}`,
        customer,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      );

      return response;
    } catch (error) {
      throw new SDKError("Failed to update customer", error);
    }
  },
});
