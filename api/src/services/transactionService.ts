import {
  GetAllTransactionsQuery,
  GetAllTransactionsResponse,
  GetTransactionResponse,
  SDKConfig,
  SettlementRequest,
  SettlementResponse,
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
  ): Promise<GetAllTransactionsResponse> {
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

      const response = await httpClient.get<GetAllTransactionsResponse>(
        `${this.config.baseUrl}/api/v1/transactions?${queryString}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: this.retryOptions,
        }
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to get all transaction", error);
    }
  }

  async getTransaction(id: string): Promise<GetTransactionResponse> {
    try {
      const token = await this.authService.getAccessToken();

      const response = await httpClient.get<GetTransactionResponse>(
        `${this.config.baseUrl}/api/v1/transactions/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: this.retryOptions,
        }
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to get transaction", error);
    }
  }

  async settleIndividualTransaction(
    id: string,
    settlementRequest: SettlementRequest
  ): Promise<SettlementResponse> {
    try {
      const token = await this.authService.getAccessToken();
      const response = await httpClient.patch<SettlementResponse>(
        `${this.config.baseUrl}/api/v1/transactions/${id}/settle`,
        settlementRequest,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: this.retryOptions,
        }
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to settle transaction", error);
    }
  }
}
