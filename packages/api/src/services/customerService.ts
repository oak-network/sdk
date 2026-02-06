import type { Customer, OakClient } from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { buildQueryString } from "./helpers";

export interface CustomerService {
  create(customer: Customer.Request): Promise<Customer.Response>;
  get(id: string): Promise<Customer.Response>;
  list(params?: Customer.ListQueryParams): Promise<Customer.ListResponse>;
  update(id: string, customer: Customer.Request): Promise<Customer.Response>;
}

export const createCustomerService = (client: OakClient): CustomerService => ({
  async create(customer: Customer.Request): Promise<Customer.Response> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.post<Customer.Response>(
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

  async get(id: string): Promise<Customer.Response> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.get<Customer.Response>(
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
    params?: Customer.ListQueryParams,
  ): Promise<Customer.ListResponse> {
    try {
      const token = await client.getAccessToken();
      const queryString = buildQueryString(params);

      const response = await httpClient.get<Customer.ListResponse>(
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
    customer: Customer.Request,
  ): Promise<Customer.Response> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.put<Customer.Response>(
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
