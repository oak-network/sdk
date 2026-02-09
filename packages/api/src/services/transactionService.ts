import type { Transaction, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { buildQueryString } from "./helpers";
import { err } from "../types";

export interface TransactionService {
  list(
    query?: Transaction.ListQuery,
  ): Promise<Result<Transaction.ListResponse>>;
  get(id: string): Promise<Result<Transaction.GetResponse>>;
  settle(
    id: string,
    settlementRequest: Transaction.SettlementRequest,
  ): Promise<Result<Transaction.SettlementResponse>>;
}

export const createTransactionService = (
  client: OakClient,
): TransactionService => ({
  async list(
    query?: Transaction.ListQuery,
  ): Promise<Result<Transaction.ListResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    const queryString = buildQueryString(query);

    return httpClient.get<Transaction.ListResponse>(
      `${client.config.baseUrl}/api/v1/transactions${queryString}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async get(id: string): Promise<Result<Transaction.GetResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.get<Transaction.GetResponse>(
      `${client.config.baseUrl}/api/v1/transactions/${id}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async settle(
    id: string,
    settlementRequest: Transaction.SettlementRequest,
  ): Promise<Result<Transaction.SettlementResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.patch<Transaction.SettlementResponse>(
      `${client.config.baseUrl}/api/v1/transactions/${id}/settle`,
      settlementRequest,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },
});
