import type { PaymentMethod, OakClient } from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { buildQueryString } from "./helpers";

export interface PaymentMethodService {
  add(
    customerId: string,
    paymentMethod: PaymentMethod.Request,
  ): Promise<PaymentMethod.Response>;
  get(customerId: string, paymentId: string): Promise<PaymentMethod.Response>;
  list(
    customerId: string,
    query?: PaymentMethod.ListQuery,
  ): Promise<PaymentMethod.ListResponse>;
  delete(
    customerId: string,
    paymentMethodId: string,
  ): Promise<PaymentMethod.DeleteResponse>;
}

export const createPaymentMethodService = (
  client: OakClient,
): PaymentMethodService => ({
  async add(
    customerId: string,
    paymentMethod: PaymentMethod.Request,
  ): Promise<PaymentMethod.Response> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.post<PaymentMethod.Response>(
        `${client.config.baseUrl}/api/v1/customers/${customerId}/payment_methods`,
        paymentMethod,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      );

      return response;
    } catch (error) {
      throw new SDKError(
        `Failed to add payment method for customer ${customerId}`,
        error,
      );
    }
  },

  async get(
    customerId: string,
    paymentId: string,
  ): Promise<PaymentMethod.Response> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.get<PaymentMethod.Response>(
        `${client.config.baseUrl}/api/v1/customers/${customerId}/payment_methods/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      );

      return response;
    } catch (error) {
      throw new SDKError(
        `Failed to get payment method for customer ${customerId}`,
        error,
      );
    }
  },

  async list(
    customerId: string,
    query?: PaymentMethod.ListQuery,
  ): Promise<PaymentMethod.ListResponse> {
    try {
      const token = await client.getAccessToken();
      const queryString = buildQueryString(query);

      const response = await httpClient.get<PaymentMethod.ListResponse>(
        `${client.config.baseUrl}/api/v1/customers/${customerId}/payment_methods${queryString}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      );
      return response;
    } catch (error) {
      throw new SDKError(
        `Failed to get payment method for customer ${customerId}`,
        error,
      );
    }
  },

  async delete(
    customerId: string,
    paymentMethodId: string,
  ): Promise<PaymentMethod.DeleteResponse> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.delete<PaymentMethod.DeleteResponse>(
        `${client.config.baseUrl}/api/v1/customers/${customerId}/payment_methods/${paymentMethodId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      );

      return response;
    } catch (error) {
      throw new SDKError(
        `Failed to delete payment method ${paymentMethodId} for customer ${customerId}`,
        error,
      );
    }
  },
});
