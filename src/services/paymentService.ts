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
  Result,
  ok,
  err,
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
  ): Promise<Result<CreatePaymentResponse, SDKError>> {
    try {
      // Proactively ensure a valid token before making the request
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.post<CreatePaymentResponse>(
        `${this.config.baseUrl}/api/v1/payments/`,
        payment,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to create payment", error));
    }
  }

  async confirmPayment(
    paymentId: string
  ): Promise<Result<ConfirmPaymentResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.post<ConfirmPaymentResponse>(
        `${this.config.baseUrl}/api/v1/payments/${paymentId}/confirm`,
        {}, // usually confirm endpoint has empty body
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return ok(response);
    } catch (error) {
      return err(
        new SDKError(
        `Failed to confirm payment with id ${paymentId}`,
        error
        )
      );
    }
  }

  async cancelPayment(
    paymentId: string
  ): Promise<Result<CancelPaymentResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.post<CancelPaymentResponse>(
        `${this.config.baseUrl}/api/v1/payments/${paymentId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return ok(response);
    } catch (error) {
      return err(
        new SDKError(
        `Failed to cancel payment with id ${paymentId}`,
        error
        )
      );
    }
  }

  async addCustomerPaymentMethod(
    customerId: string,
    paymentMethod: AddCustomerPaymentMethodRequest
  ): Promise<Result<AddCustomerPaymentMethodResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.post<AddCustomerPaymentMethodResponse>(
        `${this.config.baseUrl}/api/v1/customers/${customerId}/payment_methods`,
        paymentMethod,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return ok(response);
    } catch (error) {
      return err(
        new SDKError(
        `Failed to add payment method for customer ${customerId}`,
        error
        )
      );
    }
  }

  async getCustomerPaymentMethod(
    customerId: string,
    paymentId: string
  ): Promise<Result<GetCustomerPaymentMethodResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.get<GetCustomerPaymentMethodResponse>(
        `${this.config.baseUrl}/api/v1/customers/${customerId}/payment_methods/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return ok(response);
    } catch (error) {
      return err(
        new SDKError(
        `Failed to get payment method for customer ${customerId}`,
        error
        )
      );
    }
  }

  async getAllCustomerPaymentMethods(
    customerId: string,
    query?: GetAllCustomerPaymentMethodsQuery
  ): Promise<Result<GetAllCustomerPaymentMethodsResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

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
            headers: { Authorization: `Bearer ${token.value}` },
            retryOptions: this.retryOptions,
          }
        );
      return ok(response);
    } catch (error) {
      return err(
        new SDKError(
        `Failed to get payment method for customer ${customerId}`,
        error
        )
      );
    }
  }

  async deleteCustomerPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<Result<DeletePaymentMethodResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.delete<DeletePaymentMethodResponse>(
        `${this.config.baseUrl}/api/v1/customers/${customerId}/payment_methods/${paymentMethodId}`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return ok(response);
    } catch (error) {
      return err(
        new SDKError(
        `Failed to delete payment method ${paymentMethodId} for customer ${customerId}`,
        error
        )
      );
    }
  }
}
