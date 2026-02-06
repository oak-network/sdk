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
import { buildQueryString } from "./helpers";
import { err } from "../types";

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
  ): Promise<Result<CreateCustomerResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.post<CreateCustomerResponse>(
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

  async get(id: string): Promise<Result<GetCustomerResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.get<GetCustomerResponse>(
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
    params?: CustomerListQueryParams,
  ): Promise<Result<GetAllCustomerResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    const queryString = buildQueryString(params);

    return httpClient.get<GetAllCustomerResponse>(
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
    customer: UpdateCustomerRequest,
  ): Promise<Result<UpdateCustomerResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.put<UpdateCustomerResponse>(
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
