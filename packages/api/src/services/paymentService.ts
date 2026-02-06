import type {
  CancelPaymentResponse,
  ConfirmPaymentResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  OakClient,
  Result,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { err } from "../types";

export interface PaymentService {
  create(payment: CreatePaymentRequest): Promise<Result<CreatePaymentResponse>>;
  confirm(paymentId: string): Promise<Result<ConfirmPaymentResponse>>;
  cancel(paymentId: string): Promise<Result<CancelPaymentResponse>>;
}

export const createPaymentService = (client: OakClient): PaymentService => ({
  async create(
    payment: CreatePaymentRequest,
  ): Promise<Result<CreatePaymentResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.post<CreatePaymentResponse>(
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

  async confirm(
    paymentId: string,
  ): Promise<Result<ConfirmPaymentResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.post<ConfirmPaymentResponse>(
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

  async cancel(
    paymentId: string,
  ): Promise<Result<CancelPaymentResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.post<CancelPaymentResponse>(
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
