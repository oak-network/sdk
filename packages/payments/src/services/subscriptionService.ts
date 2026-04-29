import type { Subscription, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { buildQueryString } from "./helpers";
import { withAuth } from "../utils/withAuth";
import { buildUrl } from "../utils/buildUrl";

export interface SubscriptionService {
  subscribe(
    request: Subscription.SubscribeRequest,
  ): Promise<Result<Subscription.SubscribeResponse>>;
  cancel(subscriptionId: string): Promise<Result<Subscription.CancelResponse>>;
  list(
    params: Subscription.ListQuery,
  ): Promise<Result<Subscription.ListResponse>>;
  get(subscriptionId: string): Promise<Result<Subscription.DetailsResponse>>;
  pay(
    subscriptionId: string,
    request: Subscription.PaymentRequest,
  ): Promise<Result<Subscription.PaymentResponse>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns SubscriptionService instance
 */
export const createSubscriptionService = (
  client: OakClient,
): SubscriptionService => ({
  async subscribe(
    request: Subscription.SubscribeRequest,
  ): Promise<Result<Subscription.SubscribeResponse>> {
    return withAuth(client, (token) =>
      httpClient.post<Subscription.SubscribeResponse>(
        buildUrl(client.config.baseUrl, "api/v1/subscription/subscribe"),
        request,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async cancel(
    subscriptionId: string,
  ): Promise<Result<Subscription.CancelResponse>> {
    return withAuth(client, (token) =>
      httpClient.patch<Subscription.CancelResponse>(
        buildUrl(
          client.config.baseUrl,
          "api/v1/subscription/subscriptions",
          subscriptionId,
          "cancel",
        ),
        undefined,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async list(
    params: Subscription.ListQuery,
  ): Promise<Result<Subscription.ListResponse>> {
    const queryString = buildQueryString(params);
    return withAuth(client, (token) =>
      httpClient.get<Subscription.ListResponse>(
        `${buildUrl(client.config.baseUrl, "api/v1/subscription/list")}${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async get(
    subscriptionId: string,
  ): Promise<Result<Subscription.DetailsResponse>> {
    return withAuth(client, (token) =>
      httpClient.get<Subscription.DetailsResponse>(
        buildUrl(
          client.config.baseUrl,
          "api/v1/subscription",
          subscriptionId,
        ),
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async pay(
    subscriptionId: string,
    request: Subscription.PaymentRequest,
  ): Promise<Result<Subscription.PaymentResponse>> {
    return withAuth(client, (token) =>
      httpClient.post<Subscription.PaymentResponse>(
        buildUrl(
          client.config.baseUrl,
          "api/v1/subscription",
          subscriptionId,
          "payment",
        ),
        request,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },
});
