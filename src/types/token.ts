export interface TokenRequest {
  client_id: string;
  client_secret: string;
  grant_type: "client_credentials";
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
