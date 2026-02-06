import type { Transaction, OakClient } from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { buildQueryString } from "./helpers";

export interface TransactionService {
  list(query?: Transaction.ListQuery): Promise<Transaction.ListResponse>;
  get(id: string): Promise<Transaction.GetResponse>;
  settle(
    id: string,
    settlementRequest: Transaction.SettlementRequest,
  ): Promise<Transaction.SettlementResponse>;
}

export const createTransactionService = (
  client: OakClient,
): TransactionService => ({
  async list(query?: Transaction.ListQuery): Promise<Transaction.ListResponse> {
    try {
      const token = await client.getAccessToken();
      const queryString = buildQueryString(query);

      const response = await httpClient.get<Transaction.ListResponse>(
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

  async get(id: string): Promise<Transaction.GetResponse> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.get<Transaction.GetResponse>(
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
    settlementRequest: Transaction.SettlementRequest,
  ): Promise<Transaction.SettlementResponse> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.patch<Transaction.SettlementResponse>(
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
