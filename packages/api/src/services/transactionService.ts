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
import { buildQueryString } from "./helpers";
import { err } from "../types";

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
  ): Promise<Result<GetAllTransactionsResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    const queryString = buildQueryString(query);

    return httpClient.get<GetAllTransactionsResponse>(
      `${client.config.baseUrl}/api/v1/transactions${queryString}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async get(id: string): Promise<Result<GetTransactionResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.get<GetTransactionResponse>(
      `${client.config.baseUrl}/api/v1/transactions/${id}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async settle(
    id: string,
    settlementRequest: SettlementRequest,
  ): Promise<Result<SettlementResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.patch<SettlementResponse>(
      `${client.config.baseUrl}/api/v1/transactions/${id}/settle`,
      settlementRequest,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },
});
