import type { PaymentMethod, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { buildQueryString } from "./helpers";
import { err } from "../types";

export interface PaymentMethodService {
  add(
    customerId: string,
    paymentMethod: PaymentMethod.Request,
  ): Promise<Result<PaymentMethod.Response>>;
  get(
    customerId: string,
    paymentId: string,
  ): Promise<Result<PaymentMethod.Response>>;
  list(
    customerId: string,
    query?: PaymentMethod.ListQuery,
  ): Promise<Result<PaymentMethod.ListResponse>>;
  delete(
    customerId: string,
    paymentMethodId: string,
  ): Promise<Result<PaymentMethod.DeleteResponse>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns PaymentMethodService instance
 */
export const createPaymentMethodService = (
  client: OakClient,
): PaymentMethodService => ({
  async add(
    customerId: string,
    paymentMethod: PaymentMethod.Request,
  ): Promise<Result<PaymentMethod.Response>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.post<PaymentMethod.Response>(
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
  ): Promise<Result<PaymentMethod.Response>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.get<PaymentMethod.Response>(
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
    query?: PaymentMethod.ListQuery,
  ): Promise<Result<PaymentMethod.ListResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    const queryString = buildQueryString(query);

    return httpClient.get<PaymentMethod.ListResponse>(
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
  ): Promise<Result<PaymentMethod.DeleteResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.delete<PaymentMethod.DeleteResponse>(
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
