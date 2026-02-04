import type {
  AddCustomerPaymentMethodRequest,
  AddCustomerPaymentMethodResponse,
  DeletePaymentMethodResponse,
  GetAllCustomerPaymentMethodsQuery,
  GetAllCustomerPaymentMethodsResponse,
  GetCustomerPaymentMethodResponse,
  OakClient,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { buildQueryString } from "./helpers";

export interface PaymentMethodService {
  add(
    customerId: string,
    paymentMethod: AddCustomerPaymentMethodRequest,
  ): Promise<AddCustomerPaymentMethodResponse>;
  get(
    customerId: string,
    paymentId: string,
  ): Promise<GetCustomerPaymentMethodResponse>;
  list(
    customerId: string,
    query?: GetAllCustomerPaymentMethodsQuery,
  ): Promise<GetAllCustomerPaymentMethodsResponse>;
  delete(
    customerId: string,
    paymentMethodId: string,
  ): Promise<DeletePaymentMethodResponse>;
}

export const createPaymentMethodService = (
  client: OakClient,
): PaymentMethodService => ({
  async add(
    customerId: string,
    paymentMethod: AddCustomerPaymentMethodRequest,
  ): Promise<AddCustomerPaymentMethodResponse> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.post<AddCustomerPaymentMethodResponse>(
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
  ): Promise<GetCustomerPaymentMethodResponse> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.get<GetCustomerPaymentMethodResponse>(
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
    query?: GetAllCustomerPaymentMethodsQuery,
  ): Promise<GetAllCustomerPaymentMethodsResponse> {
    try {
      const token = await client.getAccessToken();
      const queryString = buildQueryString(query);

      const response =
        await httpClient.get<GetAllCustomerPaymentMethodsResponse>(
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
  ): Promise<DeletePaymentMethodResponse> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.delete<DeletePaymentMethodResponse>(
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
