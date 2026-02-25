import type { Transaction, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { buildQueryString } from "./helpers";
import { withAuth } from "../utils/withAuth";
import { buildUrl } from "../utils/buildUrl";

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

/**
 * @param client - Configured OakClient instance
 * @returns TransactionService instance
 */
export const createTransactionService = (
  client: OakClient,
): TransactionService => ({
  async list(
    query?: Transaction.ListQuery,
  ): Promise<Result<Transaction.ListResponse>> {
    const queryString = buildQueryString(query);

    return withAuth(client, (token) =>
      httpClient.get<Transaction.ListResponse>(
        `${buildUrl(client.config.baseUrl, "api/v1/transactions")}${queryString}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async get(id: string): Promise<Result<Transaction.GetResponse>> {
    return withAuth(client, (token) =>
      httpClient.get<Transaction.GetResponse>(
        buildUrl(client.config.baseUrl, "api/v1/transactions", id),
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async settle(
    id: string,
    settlementRequest: Transaction.SettlementRequest,
  ): Promise<Result<Transaction.SettlementResponse>> {
    return withAuth(client, (token) =>
      httpClient.patch<Transaction.SettlementResponse>(
        buildUrl(client.config.baseUrl, "api/v1/transactions", id, "settle"),
        settlementRequest,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },
});
