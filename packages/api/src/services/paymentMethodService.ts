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
import { SDKError } from "../utils/errorHandler";
import { buildQueryString } from "./helpers";
import { err, ok } from "../types";

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
  ): Promise<Result<AddCustomerPaymentMethodResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.post<AddCustomerPaymentMethodResponse>(
        `${client.config.baseUrl}/api/v1/customers/${customerId}/payment_methods`,
        paymentMethod,
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
        new SDKError(
          `Failed to add payment method for customer ${customerId}`,
          error,
        ),
      );
    }
  },

  async get(
    customerId: string,
    paymentId: string,
  ): Promise<Result<GetCustomerPaymentMethodResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.get<GetCustomerPaymentMethodResponse>(
        `${client.config.baseUrl}/api/v1/customers/${customerId}/payment_methods/${paymentId}`,
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
        new SDKError(
          `Failed to get payment method for customer ${customerId}`,
          error,
        ),
      );
    }
  },

  async list(
    customerId: string,
    query?: GetAllCustomerPaymentMethodsQuery,
  ): Promise<Result<GetAllCustomerPaymentMethodsResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const queryString = buildQueryString(query);

      const response =
        await httpClient.get<GetAllCustomerPaymentMethodsResponse>(
          `${client.config.baseUrl}/api/v1/customers/${customerId}/payment_methods${queryString}`,
          {
            headers: { Authorization: `Bearer ${token.value}` },
            retryOptions: client.retryOptions,
          },
        );
      return ok(response);
    } catch (error) {
      return err(
        new SDKError(
          `Failed to get payment method for customer ${customerId}`,
          error,
        ),
      );
    }
  },

  async delete(
    customerId: string,
    paymentMethodId: string,
  ): Promise<Result<DeletePaymentMethodResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.delete<DeletePaymentMethodResponse>(
        `${client.config.baseUrl}/api/v1/customers/${customerId}/payment_methods/${paymentMethodId}`,
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
        new SDKError(
          `Failed to delete payment method ${paymentMethodId} for customer ${customerId}`,
          error,
        ),
      );
    }
  },
});
