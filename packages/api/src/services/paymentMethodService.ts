import type { PaymentMethod, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { buildQueryString } from "./helpers";
import { withAuth } from "../utils/withAuth";
import { buildUrl } from "../utils/buildUrl";

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
    return withAuth(client, (token) =>
      httpClient.post<PaymentMethod.Response>(
        buildUrl(client.config.baseUrl, "api/v1/customers", customerId, "payment_methods"),
        paymentMethod,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async get(
    customerId: string,
    paymentId: string,
  ): Promise<Result<PaymentMethod.Response>> {
    return withAuth(client, (token) =>
      httpClient.get<PaymentMethod.Response>(
        buildUrl(client.config.baseUrl, "api/v1/customers", customerId, "payment_methods", paymentId),
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
    customerId: string,
    query?: PaymentMethod.ListQuery,
  ): Promise<Result<PaymentMethod.ListResponse>> {
    const queryString = buildQueryString(query);

    return withAuth(client, (token) =>
      httpClient.get<PaymentMethod.ListResponse>(
        `${buildUrl(client.config.baseUrl, "api/v1/customers", customerId, "payment_methods")}${queryString}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async delete(
    customerId: string,
    paymentMethodId: string,
  ): Promise<Result<PaymentMethod.DeleteResponse>> {
    return withAuth(client, (token) =>
      httpClient.delete<PaymentMethod.DeleteResponse>(
        buildUrl(client.config.baseUrl, "api/v1/customers", customerId, "payment_methods", paymentMethodId),
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
