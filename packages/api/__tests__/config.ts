import type { OakClientConfig, RetryOptions } from "../src";
import dotenv from "dotenv";
dotenv.config();

export interface TestClientConfig extends OakClientConfig {
  retryOptions?: RetryOptions;
}

export function getConfigFromEnv(): TestClientConfig {
  return {
    clientId: process.env.CLIENT_ID ?? "test-client-id",
    clientSecret: process.env.CLIENT_SECRET ?? "test-client-secret",
    baseUrl: process.env.BASE_URL ?? "https://api.test",
  };
}
