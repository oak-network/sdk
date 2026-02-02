import type { OakClient, TokenResponse } from "../types";

export interface AuthService {
  grantToken(): Promise<TokenResponse>;
  getAccessToken(): Promise<string>;
}

export const createAuthService = (client: OakClient): AuthService => ({
  grantToken: () => client.grantToken(),
  getAccessToken: () => client.getAccessToken(),
});
