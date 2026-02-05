import type { OakClient, Result, TokenResponse } from "../types";

export interface AuthService {
  grantToken(): Promise<Result<TokenResponse>>;
  getAccessToken(): Promise<Result<string>>;
}

export const createAuthService = (client: OakClient): AuthService => ({
  grantToken: () => client.grantToken(),
  getAccessToken: () => client.getAccessToken(),
});
