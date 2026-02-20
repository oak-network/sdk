import type { Payment, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { err } from "../types";

export interface PaymentService {
  create(payment: Payment.Request): Promise<Result<Payment.Response>>;
  confirm(paymentId: string): Promise<Result<Payment.Response>>;
  cancel(paymentId: string): Promise<Result<Payment.Response>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns PaymentService instance
 */
export const createPaymentService = (client: OakClient): PaymentService => ({
  async create(payment: Payment.Request): Promise<Result<Payment.Response>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.post<Payment.Response>(
      `${client.config.baseUrl}/api/v1/payments/`,
      payment,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        retryOptions: client.retryOptions,
      },
    );
  },

  async confirm(paymentId: string): Promise<Result<Payment.Response>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.post<Payment.Response>(
      `${client.config.baseUrl}/api/v1/payments/${paymentId}/confirm`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        retryOptions: client.retryOptions,
      },
    );
  },

  async cancel(paymentId: string): Promise<Result<Payment.Response>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.post<Payment.Response>(
      `${client.config.baseUrl}/api/v1/payments/${paymentId}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        retryOptions: client.retryOptions,
      },
    );
  },
});
