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

  sync(id: string, sync: Customer.Sync): Promise<Result<Customer.SyncResponse>>;

  balance(
    customer_id: string,
    filter: Customer.BalanceFilter,
  ): Promise<Result<Customer.BalanceResponse>>;

  uploadFiles(
    customerId: string,
    files: unknown,
  ): Promise<Result<Customer.FilesResponse>>;

  getFiles(customerId: string): Promise<Result<Customer.FilesResponse>>;

  populatePlatform(
    customerId: string,
    data: Customer.PlatformRequest,
  ): Promise<Result<Customer.PlatformResponse>>;
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

  async sync(
    id: string,
    sync: Customer.Sync,
  ): Promise<Result<Customer.SyncResponse>> {
    return withAuth(client, (token) =>
      httpClient.post<Customer.SyncResponse>(
        buildUrl(client.config.baseUrl, "api/v1/customers", id, "sync"),
        sync,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async uploadFiles(
    customerId: string,
    files: unknown,
  ): Promise<Result<Customer.FilesResponse>> {
    return withAuth(client, (token) =>
      httpClient.postMultipart<Customer.FilesResponse>(
        buildUrl(client.config.baseUrl, "api/v1/customers", customerId, "files"),
        files,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async getFiles(customerId: string): Promise<Result<Customer.FilesResponse>> {
    return withAuth(client, (token) =>
      httpClient.get<Customer.FilesResponse>(
        buildUrl(client.config.baseUrl, "api/v1/customers", customerId, "files"),
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async populatePlatform(
    customerId: string,
    data: Customer.PlatformRequest,
  ): Promise<Result<Customer.PlatformResponse>> {
    return withAuth(client, (token) =>
      httpClient.post<Customer.PlatformResponse>(
        buildUrl(client.config.baseUrl, "api/v1/customers", customerId, "platforms"),
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async balance(
    customer_id: string,
    filter: Customer.BalanceFilter,
  ): Promise<Result<Customer.BalanceResponse>> {
    const queryString = buildQueryString(filter);

    return withAuth(client, (token) =>
      httpClient.get<Customer.BalanceResponse>(
        `${buildUrl(client.config.baseUrl, "api/v1/customers", customer_id, "balances")}${queryString}`,
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
