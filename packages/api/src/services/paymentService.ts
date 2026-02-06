import type { Payment, OakClient } from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";

export interface PaymentService {
  create(payment: Payment.Request): Promise<Payment.Response>;
  confirm(paymentId: string): Promise<Payment.Response>;
  cancel(paymentId: string): Promise<Payment.Response>;
}

export const createPaymentService = (client: OakClient): PaymentService => ({
  async create(payment: Payment.Request): Promise<Payment.Response> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.post<Payment.Response>(
        `${client.config.baseUrl}/api/v1/payments/`,
        payment,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      );

      return response;
    } catch (error) {
      throw new SDKError("Failed to create payment", error);
    }
  },

  async confirm(paymentId: string): Promise<Payment.Response> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.post<Payment.Response>(
        `${client.config.baseUrl}/api/v1/payments/${paymentId}/confirm`,
        {},
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
        `Failed to confirm payment with id ${paymentId}`,
        error,
      );
    }
  },

  async cancel(paymentId: string): Promise<Payment.Response> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.post<Payment.Response>(
        `${client.config.baseUrl}/api/v1/payments/${paymentId}/cancel`,
        {},
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
        `Failed to cancel payment with id ${paymentId}`,
        error,
      );
    }
  },
});
