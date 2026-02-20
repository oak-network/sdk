import type { OakClient, Result, TokenResponse } from "../types";

export interface AuthService {
  grantToken(): Promise<Result<TokenResponse>>;
  getAccessToken(): Promise<Result<string>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns AuthService instance
 */
export const createAuthService = (client: OakClient): AuthService => ({
  grantToken: () => client.grantToken(),
  getAccessToken: () => client.getAccessToken(),
});
