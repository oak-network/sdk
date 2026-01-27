import {
  SDKConfig,
  CreatePaymentRequest,
  CreatePaymentResponse,
  ConfirmPaymentResponse,
  CancelPaymentResponse,
  AddCustomerPaymentMethodResponse,
  AddCustomerPaymentMethodRequest,
  GetAllCustomerPaymentMethodsQuery,
  GetAllCustomerPaymentMethodsResponse,
  DeletePaymentMethodResponse,
  GetCustomerPaymentMethodResponse,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { AuthService } from "./authService";
import { RetryOptions } from "../utils/defaultRetryConfig";

export class PaymentService {
  private config: SDKConfig;
  private authService: AuthService;
  private retryOptions: RetryOptions;

  constructor(
    config: SDKConfig,
    authService: AuthService,
    retryOptions: RetryOptions
  ) {
    this.config = config;
    this.authService = authService;
    this.retryOptions = retryOptions;
  }

  async createPayment(
    payment: CreatePaymentRequest
  ): Promise<CreatePaymentResponse> {
    try {
      // Proactively ensure a valid token before making the request
      const token = await this.authService.getAccessToken();

      const response = await httpClient.post<CreatePaymentResponse>(
        `${this.config.baseUrl}/api/v1/payments/`,
        payment,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return response;
    } catch (error) {
      throw new SDKError("Failed to create payment", error);
    }
  }

  async confirmPayment(paymentId: string): Promise<ConfirmPaymentResponse> {
    try {
      const token = await this.authService.getAccessToken();

      const response = await httpClient.post<ConfirmPaymentResponse>(
        `${this.config.baseUrl}/api/v1/payments/${paymentId}/confirm`,
        {}, // usually confirm endpoint has empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return response;
    } catch (error) {
      throw new SDKError(
        `Failed to confirm payment with id ${paymentId}`,
        error
      );
    }
  }

  async cancelPayment(paymentId: string): Promise<CancelPaymentResponse> {
    try {
      const token = await this.authService.getAccessToken();

      const response = await httpClient.post<CancelPaymentResponse>(
        `${this.config.baseUrl}/api/v1/payments/${paymentId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return response;
    } catch (error) {
      throw new SDKError(
        `Failed to cancel payment with id ${paymentId}`,
        error
      );
    }
  }

  async addCustomerPaymentMethod(
    customerId: string,
    paymentMethod: AddCustomerPaymentMethodRequest
  ): Promise<AddCustomerPaymentMethodResponse> {
    try {
      const token = await this.authService.getAccessToken();

      const response = await httpClient.post<AddCustomerPaymentMethodResponse>(
        `${this.config.baseUrl}/api/v1/customers/${customerId}/payment_methods`,
        paymentMethod,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return response;
    } catch (error) {
      throw new SDKError(
        `Failed to add payment method for customer ${customerId}`,
        error
      );
    }
  }

  async getCustomerPaymentMethod(
    customerId: string,
    paymentId: string
  ): Promise<GetCustomerPaymentMethodResponse> {
    try {
      const token = await this.authService.getAccessToken();

      const response = await httpClient.get<GetCustomerPaymentMethodResponse>(
        `${this.config.baseUrl}/api/v1/customers/${customerId}/payment_methods/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return response;
    } catch (error) {
      throw new SDKError(
        `Failed to get payment method for customer ${customerId}`,
        error
      );
    }
  }

  async getAllCustomerPaymentMethods(
    customerId: string,
    query?: GetAllCustomerPaymentMethodsQuery
  ): Promise<GetAllCustomerPaymentMethodsResponse> {
    try {
      const token = await this.authService.getAccessToken();

      const queryString = query
        ? `?${Object.entries(query)
            .filter(([_, value]) => value !== undefined)
            .map(
              ([key, value]) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
            )
            .join("&")}`
        : "";

      const response =
        await httpClient.get<GetAllCustomerPaymentMethodsResponse>(
          `${this.config.baseUrl}/api/v1/customers/${customerId}/payment_methods?${queryString}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            retryOptions: this.retryOptions,
          }
        );
      return response;
    } catch (error) {
      throw new SDKError(
        `Failed to get payment method for customer ${customerId}`,
        error
      );
    }
  }

  async deleteCustomerPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<DeletePaymentMethodResponse> {
    try {
      const token = await this.authService.getAccessToken();

      const response = await httpClient.delete<DeletePaymentMethodResponse>(
        `${this.config.baseUrl}/api/v1/customers/${customerId}/payment_methods/${paymentMethodId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return response;
    } catch (error) {
      throw new SDKError(
        `Failed to delete payment method ${paymentMethodId} for customer ${customerId}`,
        error
      );
    }
  }
}
