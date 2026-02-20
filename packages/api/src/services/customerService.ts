import type { Customer, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { buildQueryString } from "./helpers";
import { withAuth } from "../utils/withAuth";
import { buildUrl } from "../utils/buildUrl";

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
    return withAuth(client, (token) =>
      httpClient.post<Customer.Response>(
        buildUrl(client.config.baseUrl, "api/v1/customers"),
        customer,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async get(id: string): Promise<Result<Customer.Response>> {
    return withAuth(client, (token) =>
      httpClient.get<Customer.Response>(
        buildUrl(client.config.baseUrl, "api/v1/customers", id),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async list(
    params?: Customer.ListQueryParams,
  ): Promise<Result<Customer.ListResponse>> {
    const queryString = buildQueryString(params);

    return withAuth(client, (token) =>
      httpClient.get<Customer.ListResponse>(
        `${buildUrl(client.config.baseUrl, "api/v1/customers")}${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async update(
    id: string,
    customer: Customer.Request,
  ): Promise<Result<Customer.Response>> {
    return withAuth(client, (token) =>
      httpClient.put<Customer.Response>(
        buildUrl(client.config.baseUrl, "api/v1/customers", id),
        customer,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },
});
