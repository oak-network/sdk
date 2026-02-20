import type { Customer, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { buildQueryString } from "./helpers";
import { err } from "../types";

export interface CustomerService {
  create(customer: Customer.Request): Promise<Result<Customer.Response>>;
  get(id: string): Promise<Result<Customer.Response>>;
  list(
    params?: Customer.ListQueryParams,
  ): Promise<Result<Customer.ListResponse>>;
  update(
    id: string,
    customer: Customer.Request,
  ): Promise<Result<Customer.Response>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns CustomerService instance
 */
export const createCustomerService = (client: OakClient): CustomerService => ({
  async create(customer: Customer.Request): Promise<Result<Customer.Response>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.post<Customer.Response>(
      `${client.config.baseUrl}/api/v1/customers`,
      customer,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        retryOptions: client.retryOptions,
      },
    );
  },

  async get(id: string): Promise<Result<Customer.Response>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.get<Customer.Response>(
      `${client.config.baseUrl}/api/v1/customers/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        retryOptions: client.retryOptions,
      },
    );
  },

  async list(
    params?: Customer.ListQueryParams,
  ): Promise<Result<Customer.ListResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    const queryString = buildQueryString(params);

    return httpClient.get<Customer.ListResponse>(
      `${client.config.baseUrl}/api/v1/customers${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        retryOptions: client.retryOptions,
      },
    );
  },

  async update(
    id: string,
    customer: Customer.Request,
  ): Promise<Result<Customer.Response>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.put<Customer.Response>(
      `${client.config.baseUrl}/api/v1/customers/${id}`,
      customer,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        retryOptions: client.retryOptions,
      },
    );
  },
});
