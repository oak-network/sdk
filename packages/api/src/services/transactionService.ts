import type {
  GetAllTransactionsQuery,
  GetAllTransactionsResponse,
  GetTransactionResponse,
  OakClient,
  Result,
  SettlementRequest,
  SettlementResponse,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { buildQueryString } from "./helpers";
import { err, ok } from "../types";

export interface TransactionService {
  list(query?: GetAllTransactionsQuery): Promise<Result<GetAllTransactionsResponse>>;
  get(id: string): Promise<Result<GetTransactionResponse>>;
  settle(
    id: string,
    settlementRequest: SettlementRequest,
  ): Promise<Result<SettlementResponse>>;
}

export const createTransactionService = (
  client: OakClient,
): TransactionService => ({
  async list(
    query?: GetAllTransactionsQuery,
  ): Promise<Result<GetAllTransactionsResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const queryString = buildQueryString(query);

      const response = await httpClient.get<GetAllTransactionsResponse>(
        `${client.config.baseUrl}/api/v1/transactions${queryString}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: client.retryOptions,
        },
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to get all transaction", error));
    }
  },

  async get(id: string): Promise<Result<GetTransactionResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.get<GetTransactionResponse>(
        `${client.config.baseUrl}/api/v1/transactions/${id}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: client.retryOptions,
        },
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to get transaction", error));
    }
  },

  async settle(
    id: string,
    settlementRequest: SettlementRequest,
  ): Promise<Result<SettlementResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.patch<SettlementResponse>(
        `${client.config.baseUrl}/api/v1/transactions/${id}/settle`,
        settlementRequest,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: client.retryOptions,
        },
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to settle transaction", error));
    }
  },
});
