import type { OakClientConfig, OakEnvironment } from "../src";
import type { RetryOptions } from "../src/utils";
import dotenv from "dotenv";
dotenv.config();

export interface TestClientConfig extends OakClientConfig {
  retryOptions?: RetryOptions;
}

export interface TestEnvironment {
  paymentCustomerId?: string;
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

export function getTestEnvironment(): TestEnvironment {
  return {
    paymentCustomerId: process.env.PAYMENT_CUSTOMER_ID,
  };
}
