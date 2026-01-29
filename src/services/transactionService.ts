import {
  GetAllTransactionsQuery,
  GetAllTransactionsResponse,
  GetTransactionResponse,
  SDKConfig,
  SettlementRequest,
  SettlementResponse,
  Result,
  ok,
  err,
} from "../types";
import { httpClient, SDKError } from "../utils";
import { RetryOptions } from "../utils/defaultRetryConfig";
import { AuthService } from "./authService";

export class TransactionService {
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

  async getAllTransactions(
    query?: GetAllTransactionsQuery
  ): Promise<Result<GetAllTransactionsResponse, SDKError>> {
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

      const response = await httpClient.get<GetAllTransactionsResponse>(
        `${this.config.baseUrl}/api/v1/transactions?${queryString}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: this.retryOptions,
        }
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to get all transaction", error));
    }
  }

  async getTransaction(
    id: string
  ): Promise<Result<GetTransactionResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.get<GetTransactionResponse>(
        `${this.config.baseUrl}/api/v1/transactions/${id}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: this.retryOptions,
        }
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to get transaction", error));
    }
  }

  async settleIndividualTransaction(
    id: string,
    settlementRequest: SettlementRequest
  ): Promise<Result<SettlementResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.patch<SettlementResponse>(
        `${this.config.baseUrl}/api/v1/transactions/${id}/settle`,
        settlementRequest,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: this.retryOptions,
        }
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to settle transaction", error));
    }
  }
}
