import type {
  AddCustomerPaymentMethodRequest,
  AddCustomerPaymentMethodResponse,
  DeletePaymentMethodResponse,
  GetAllCustomerPaymentMethodsQuery,
  GetAllCustomerPaymentMethodsResponse,
  GetCustomerPaymentMethodResponse,
  OakClient,
  Result,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { buildQueryString } from "./helpers";
import { err } from "../types";

export interface PaymentMethodService {
  add(
    customerId: string,
    paymentMethod: AddCustomerPaymentMethodRequest,
  ): Promise<Result<AddCustomerPaymentMethodResponse>>;
  get(
    customerId: string,
    paymentId: string,
  ): Promise<Result<GetCustomerPaymentMethodResponse>>;
  list(
    customerId: string,
    query?: GetAllCustomerPaymentMethodsQuery,
  ): Promise<Result<GetAllCustomerPaymentMethodsResponse>>;
  delete(
    customerId: string,
    paymentMethodId: string,
  ): Promise<Result<DeletePaymentMethodResponse>>;
}

export const createPaymentMethodService = (
  client: OakClient,
): PaymentMethodService => ({
  async add(
    customerId: string,
    paymentMethod: AddCustomerPaymentMethodRequest,
  ): Promise<Result<AddCustomerPaymentMethodResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.post<AddCustomerPaymentMethodResponse>(
      `${client.config.baseUrl}/api/v1/customers/${customerId}/payment_methods`,
      paymentMethod,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        retryOptions: client.retryOptions,
      },
    );
  },

  async get(
    customerId: string,
    paymentId: string,
  ): Promise<Result<GetCustomerPaymentMethodResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.get<GetCustomerPaymentMethodResponse>(
      `${client.config.baseUrl}/api/v1/customers/${customerId}/payment_methods/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        retryOptions: client.retryOptions,
      },
    );
  },

  async list(
    customerId: string,
    query?: GetAllCustomerPaymentMethodsQuery,
  ): Promise<Result<GetAllCustomerPaymentMethodsResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    const queryString = buildQueryString(query);

    return httpClient.get<GetAllCustomerPaymentMethodsResponse>(
      `${client.config.baseUrl}/api/v1/customers/${customerId}/payment_methods${queryString}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async delete(
    customerId: string,
    paymentMethodId: string,
  ): Promise<Result<DeletePaymentMethodResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.delete<DeletePaymentMethodResponse>(
      `${client.config.baseUrl}/api/v1/customers/${customerId}/payment_methods/${paymentMethodId}`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        retryOptions: client.retryOptions,
      },
    );
  },
});
