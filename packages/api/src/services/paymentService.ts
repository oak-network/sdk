import type {
  AddCustomerPaymentMethodRequest,
  AddCustomerPaymentMethodResponse,
  CancelPaymentResponse,
  ConfirmPaymentResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  DeletePaymentMethodResponse,
  GetAllCustomerPaymentMethodsQuery,
  GetAllCustomerPaymentMethodsResponse,
  GetCustomerPaymentMethodResponse,
  OakClient,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { buildQueryString } from "./helpers";

export interface PaymentService {
  createPayment(payment: CreatePaymentRequest): Promise<CreatePaymentResponse>;
  confirmPayment(paymentId: string): Promise<ConfirmPaymentResponse>;
  cancelPayment(paymentId: string): Promise<CancelPaymentResponse>;
  addCustomerPaymentMethod(
    customerId: string,
    paymentMethod: AddCustomerPaymentMethodRequest
  ): Promise<AddCustomerPaymentMethodResponse>;
  getCustomerPaymentMethod(
    customerId: string,
    paymentId: string
  ): Promise<GetCustomerPaymentMethodResponse>;
  getAllCustomerPaymentMethods(
    customerId: string,
    query?: GetAllCustomerPaymentMethodsQuery
  ): Promise<GetAllCustomerPaymentMethodsResponse>;
  deleteCustomerPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<DeletePaymentMethodResponse>;
}

export const createPaymentService = (client: OakClient): PaymentService => ({
  async createPayment(
    payment: CreatePaymentRequest
  ): Promise<CreatePaymentResponse> {
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
        }
      );

      return response;
    } catch (error) {
      throw new SDKError("Failed to create payment", error);
    }
  },

  async confirmPayment(paymentId: string): Promise<ConfirmPaymentResponse> {
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
        }
      );

      return response;
    } catch (error) {
      throw new SDKError(
        `Failed to confirm payment with id ${paymentId}`,
        error
      );
    }
  },

  async cancelPayment(paymentId: string): Promise<CancelPaymentResponse> {
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
        }
      );

      return response;
    } catch (error) {
      throw new SDKError(
        `Failed to cancel payment with id ${paymentId}`,
        error
      );
    }
  },

  async addCustomerPaymentMethod(
    customerId: string,
    paymentMethod: AddCustomerPaymentMethodRequest
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
        }
      );

      return response;
    } catch (error) {
      throw new SDKError(
        `Failed to add payment method for customer ${customerId}`,
        error
      );
    }
  },

  async getCustomerPaymentMethod(
    customerId: string,
    paymentId: string
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
        }
      );

      return response;
    } catch (error) {
      throw new SDKError(
        `Failed to get payment method for customer ${customerId}`,
        error
      );
    }
  },

  async getAllCustomerPaymentMethods(
    customerId: string,
    query?: GetAllCustomerPaymentMethodsQuery
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
          }
        );
      return response;
    } catch (error) {
      throw new SDKError(
        `Failed to get payment method for customer ${customerId}`,
        error
      );
    }
  },

  async deleteCustomerPaymentMethod(
    customerId: string,
    paymentMethodId: string
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
        }
      );

      return response;
    } catch (error) {
      throw new SDKError(
        `Failed to delete payment method ${paymentMethodId} for customer ${customerId}`,
        error
      );
    }
  },
});
