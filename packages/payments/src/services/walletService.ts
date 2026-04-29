import type { Wallet, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { withAuth } from "../utils/withAuth";
import { buildUrl } from "../utils/buildUrl";

export interface WalletService {
  getBalance(customerId: string): Promise<Result<Wallet.BalanceResponse>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns WalletService instance
 */
export const createWalletService = (client: OakClient): WalletService => ({
  async getBalance(
    customerId: string,
  ): Promise<Result<Wallet.BalanceResponse>> {
    return withAuth(client, (token) =>
      httpClient.get<Wallet.BalanceResponse>(
        buildUrl(client.config.baseUrl, "api/v1/wallets", customerId, "balance"),
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },
});
