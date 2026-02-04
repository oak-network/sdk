import type {
  CancelPaymentResponse,
  ConfirmPaymentResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  OakClient,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";

export interface PaymentService {
  create(payment: CreatePaymentRequest): Promise<CreatePaymentResponse>;
  confirm(paymentId: string): Promise<ConfirmPaymentResponse>;
  cancel(paymentId: string): Promise<CancelPaymentResponse>;
}

export const createPaymentService = (client: OakClient): PaymentService => ({
  async create(payment: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.post<CreatePaymentResponse>(
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

  async confirm(paymentId: string): Promise<ConfirmPaymentResponse> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.post<ConfirmPaymentResponse>(
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

  async cancel(paymentId: string): Promise<CancelPaymentResponse> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.post<CancelPaymentResponse>(
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
