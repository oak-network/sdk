import type { OakClientConfig, RetryOptions } from "../src";
import dotenv from "dotenv";
dotenv.config();

export interface TestClientConfig extends OakClientConfig {
  retryOptions?: RetryOptions;
}

export function getConfigFromEnv(): TestClientConfig {
  if (
    !process.env.CLIENT_ID ||
    !process.env.CLIENT_SECRET ||
    !process.env.BASE_URL
  ) {
    throw new Error(
      "Missing required environment variables: CLIENT_ID, CLIENT_SECRET, BASE_URL"
    );
  }

  return {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    baseUrl: process.env.BASE_URL,
  };
}
