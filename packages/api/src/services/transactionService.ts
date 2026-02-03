import type {
  GetAllTransactionsQuery,
  GetAllTransactionsResponse,
  GetTransactionResponse,
  OakClient,
  SettlementRequest,
  SettlementResponse,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { buildQueryString } from "./helpers";

export interface TransactionService {
  list(query?: GetAllTransactionsQuery): Promise<GetAllTransactionsResponse>;
  get(id: string): Promise<GetTransactionResponse>;
  settle(
    id: string,
    settlementRequest: SettlementRequest,
  ): Promise<SettlementResponse>;
}

export const createTransactionService = (
  client: OakClient,
): TransactionService => ({
  async list(
    query?: GetAllTransactionsQuery,
  ): Promise<GetAllTransactionsResponse> {
    try {
      const token = await client.getAccessToken();
      const queryString = buildQueryString(query);

      const response = await httpClient.get<GetAllTransactionsResponse>(
        `${client.config.baseUrl}/api/v1/transactions${queryString}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to get all transaction", error);
    }
  },

  async get(id: string): Promise<GetTransactionResponse> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.get<GetTransactionResponse>(
        `${client.config.baseUrl}/api/v1/transactions/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to get transaction", error);
    }
  },

  async settle(
    id: string,
    settlementRequest: SettlementRequest,
  ): Promise<SettlementResponse> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.patch<SettlementResponse>(
        `${client.config.baseUrl}/api/v1/transactions/${id}/settle`,
        settlementRequest,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to settle transaction", error);
    }
  },
});
