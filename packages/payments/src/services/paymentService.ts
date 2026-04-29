import type { Payment, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { withAuth } from "../utils/withAuth";
import { buildUrl } from "../utils/buildUrl";

export interface PaymentService {
  create(payment: Payment.Request): Promise<Result<Payment.Response>>;
  confirm(paymentId: string): Promise<Result<Payment.Response>>;
  cancel(paymentId: string): Promise<Result<Payment.Response>>;
  /** Capture an authorized payment (manual capture flow). */
  capture(paymentId: string): Promise<Result<Payment.Response>>;
  /** Mark a payment as paid in sandbox environment. */
  sandboxPaid(paymentId: string): Promise<Result<Payment.Response>>;
  /** Simulate settlement for a payment in sandbox environment. */
  sandboxSettle(paymentId: string): Promise<Result<Payment.Response>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns PaymentService instance
 */
export const createPaymentService = (client: OakClient): PaymentService => ({
  async create(payment: Payment.Request): Promise<Result<Payment.Response>> {
    return withAuth(client, (token) =>
      httpClient.post<Payment.Response>(
        buildUrl(client.config.baseUrl, "api/v1/payments"),
        payment,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async confirm(paymentId: string): Promise<Result<Payment.Response>> {
    return withAuth(client, (token) =>
      httpClient.post<Payment.Response>(
        buildUrl(client.config.baseUrl, "api/v1/payments", paymentId, "confirm"),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async cancel(paymentId: string): Promise<Result<Payment.Response>> {
    return withAuth(client, (token) =>
      httpClient.post<Payment.Response>(
        buildUrl(client.config.baseUrl, "api/v1/payments", paymentId, "cancel"),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async capture(paymentId: string): Promise<Result<Payment.Response>> {
    return withAuth(client, (token) =>
      httpClient.post<Payment.Response>(
        buildUrl(client.config.baseUrl, "api/v1/payments", paymentId, "capture"),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async sandboxPaid(paymentId: string): Promise<Result<Payment.Response>> {
    return withAuth(client, (token) =>
      httpClient.post<Payment.Response>(
        buildUrl(client.config.baseUrl, "api/v1/payments", paymentId, "sandbox", "paid"),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async sandboxSettle(paymentId: string): Promise<Result<Payment.Response>> {
    return withAuth(client, (token) =>
      httpClient.post<Payment.Response>(
        buildUrl(client.config.baseUrl, "api/v1/payments", paymentId, "sandbox", "settle"),
        {},
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
