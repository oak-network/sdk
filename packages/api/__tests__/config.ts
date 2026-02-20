import type { OakClientConfig, OakEnvironment } from "../src";
import type { RetryOptions } from "../src/utils";
import dotenv from "dotenv";
import path from "path";

// Always load env vars from the API package's .env,
// regardless of the current working directory.
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});


export interface TestClientConfig extends OakClientConfig {
  retryOptions?: RetryOptions;
}

export function getConfigFromEnv(): OakClientConfig {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    throw new Error(
      "Missing required environment variables: CLIENT_ID, CLIENT_SECRET"
    );
  }

  const environment: OakEnvironment =
    (process.env.OAK_ENVIRONMENT as OakEnvironment) || "sandbox";

  if (environment !== "sandbox" && environment !== "production") {
    throw new Error(
      `Invalid OAK_ENVIRONMENT: ${environment}. Must be 'sandbox' or 'production'.`
    );
  }

  return {
    environment,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  };
}
