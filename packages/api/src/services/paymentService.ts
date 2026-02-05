import type {
  CancelPaymentResponse,
  ConfirmPaymentResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  OakClient,
  Result,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { err, ok } from "../types";

export interface PaymentService {
  create(payment: CreatePaymentRequest): Promise<Result<CreatePaymentResponse>>;
  confirm(paymentId: string): Promise<Result<ConfirmPaymentResponse>>;
  cancel(paymentId: string): Promise<Result<CancelPaymentResponse>>;
}

export const createPaymentService = (client: OakClient): PaymentService => ({
  async create(
    payment: CreatePaymentRequest,
  ): Promise<Result<CreatePaymentResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.post<CreatePaymentResponse>(
        `${client.config.baseUrl}/api/v1/payments/`,
        payment,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: client.retryOptions,
        },
      );

      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to create payment", error));
    }
  },

  async confirm(
    paymentId: string,
  ): Promise<Result<ConfirmPaymentResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.post<ConfirmPaymentResponse>(
        `${client.config.baseUrl}/api/v1/payments/${paymentId}/confirm`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: client.retryOptions,
        },
      );

      return ok(response);
    } catch (error) {
      return err(
        new SDKError(`Failed to confirm payment with id ${paymentId}`, error),
      );
    }
  },

  async cancel(
    paymentId: string,
  ): Promise<Result<CancelPaymentResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.post<CancelPaymentResponse>(
        `${client.config.baseUrl}/api/v1/payments/${paymentId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: client.retryOptions,
        },
      );

      return ok(response);
    } catch (error) {
      return err(
        new SDKError(`Failed to cancel payment with id ${paymentId}`, error),
      );
    }
  },
});
