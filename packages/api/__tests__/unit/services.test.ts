import {
  createAuthService,
  createBuyService,
  createCustomerService,
  createPaymentMethodService,
  createPaymentService,
  createPlanService,
  createProviderService,
  createSellService,
  createTransactionService,
  createTransferService,
  createWebhookService,
} from "../../src/services";
import { httpClient } from "../../src/utils/httpClient";
import { SDKError } from "../../src/utils/errorHandler";
import type { OakClient } from "../../src/types";
import { err, ok } from "../../src/types";

const SANDBOX_URL = "https://api.usecrowdpay.xyz";

jest.mock("../../src/utils/httpClient", () => ({
  httpClient: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedHttpClient = httpClient as jest.Mocked<typeof httpClient>;

const retryOptions = { maxNumberOfRetries: 0, delay: 0, backoffFactor: 2 };

const makeClient = (): OakClient => ({
  config: {
    environment: "sandbox",
    clientId: "id",
    clientSecret: "secret",
    baseUrl: SANDBOX_URL,
  },
  retryOptions,
  getAccessToken: jest.fn().mockResolvedValue(ok("token")),
  grantToken: jest.fn(),
});

const makeClientWithTokenError = (): OakClient => {
  const tokenError = new SDKError("Token error");
  return {
    config: {
      environment: "sandbox",
      clientId: "id",
      clientSecret: "secret",
      baseUrl: SANDBOX_URL,
    },
    retryOptions,
    getAccessToken: jest.fn().mockResolvedValue(err(tokenError)),
    grantToken: jest.fn(),
  };
};

const getAuthConfig = (client: OakClient) =>
  expect.objectContaining({
    headers: { Authorization: "Bearer token" },
    retryOptions: client.retryOptions,
  });

const expectSuccess = async (options: {
  client: OakClient;
  call: () => Promise<unknown>;
  httpMethod: keyof typeof mockedHttpClient;
  expectedArgs: unknown[];
}) => {
  const response = { ok: true };
  mockedHttpClient[options.httpMethod].mockResolvedValue(response as never);

  const result = await options.call();

  expect(result).toEqual(ok(response));
  expect(mockedHttpClient[options.httpMethod]).toHaveBeenCalledWith(
    ...options.expectedArgs
  );
  expect(options.client.getAccessToken).toHaveBeenCalled();
};

const expectFailure = async (options: {
  call: () => Promise<unknown>;
  httpMethod: keyof typeof mockedHttpClient;
  errorMessage: string;
  error?: unknown;
}) => {
  mockedHttpClient[options.httpMethod].mockRejectedValue(
    options.error ?? new Error("fail")
  );

  const result = await options.call();
  expect(result).toEqual(err(expect.any(SDKError)));
  if (result && typeof result === "object" && "ok" in result) {
    const typedResult = result as { ok: boolean; error?: SDKError };
    if (!typedResult.ok && typedResult.error) {
      expect(typedResult.error).toBeInstanceOf(SDKError);
      expect(typedResult.error.message).toContain(options.errorMessage);
    }
  }
};

const expectTokenFailure = async (call: () => Promise<unknown>) => {
  const result = await call();
  expect(result).toEqual(err(expect.any(SDKError)));
  if (result && typeof result === "object" && "ok" in result) {
    const typedResult = result as { ok: boolean; error?: SDKError };
    if (!typedResult.ok && typedResult.error) {
      expect(typedResult.error.message).toContain("Token error");
    }
  }
};

describe("Crowdsplit services (Unit)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("auth service delegates to client", async () => {
    const client = makeClient();
    const service = createAuthService(client);
    await service.getAccessToken();
    await service.grantToken();

    expect(client.getAccessToken).toHaveBeenCalled();
    expect(client.grantToken).toHaveBeenCalled();
  });

  it("customer service methods", async () => {
    const client = makeClient();
    const service = createCustomerService(client);
    const authConfig = getAuthConfig(client);

    await expectSuccess({
      client,
      call: () => service.create({ email: "test@example.com" }),
      httpMethod: "post",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/customers`,
        { email: "test@example.com" },
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.create({ email: "test@example.com" }),
      httpMethod: "post",
      errorMessage: "Failed to create customer",
    });

    await expectSuccess({
      client,
      call: () => service.get("cust-1"),
      httpMethod: "get",
      expectedArgs: [`${SANDBOX_URL}/api/v1/customers/cust-1`, authConfig],
    });
    await expectFailure({
      call: () => service.get("cust-1"),
      httpMethod: "get",
      errorMessage: "Failed to retrieve customer",
    });

    await expectSuccess({
      client,
      call: () => service.list({ limit: 10, offset: undefined }),
      httpMethod: "get",
      expectedArgs: [`${SANDBOX_URL}/api/v1/customers?limit=10`, authConfig],
    });
    await expectSuccess({
      client,
      call: () => service.list({ limit: undefined }),
      httpMethod: "get",
      expectedArgs: [`${SANDBOX_URL}/api/v1/customers`, authConfig],
    });
    await expectFailure({
      call: () => service.list({ limit: 10 }),
      httpMethod: "get",
      errorMessage: "Failed to list customers",
    });

    await expectSuccess({
      client,
      call: () => service.update("cust-1", { email: "new@example.com" }),
      httpMethod: "put",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/customers/cust-1`,
        { email: "new@example.com" },
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.update("cust-1", { email: "new@example.com" }),
      httpMethod: "put",
      errorMessage: "Failed to update customer",
    });

    const tokenErrorClient = makeClientWithTokenError();
    const tokenErrorService = createCustomerService(tokenErrorClient);
    await expectTokenFailure(() => tokenErrorService.create({ email: "t@t.com" }));
    await expectTokenFailure(() => tokenErrorService.get("cust-1"));
    await expectTokenFailure(() => tokenErrorService.list({ limit: 1 }));
    await expectTokenFailure(() =>
      tokenErrorService.update("cust-1", { email: "t@t.com" })
    );
  });

  it("payment service methods", async () => {
    const client = makeClient();
    const service = createPaymentService(client);
    const authConfig = getAuthConfig(client);
    const payment = { provider: "stripe" } as any;

    await expectSuccess({
      client,
      call: () => service.create(payment),
      httpMethod: "post",
      expectedArgs: [`${SANDBOX_URL}/api/v1/payments/`, payment, authConfig],
    });
    await expectFailure({
      call: () => service.create(payment),
      httpMethod: "post",
      errorMessage: "Failed to create payment",
    });

    await expectSuccess({
      client,
      call: () => service.confirm("pay-1"),
      httpMethod: "post",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/payments/pay-1/confirm`,
        {},
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.confirm("pay-1"),
      httpMethod: "post",
      errorMessage: "Failed to confirm payment with id pay-1",
    });

    await expectSuccess({
      client,
      call: () => service.cancel("pay-1"),
      httpMethod: "post",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/payments/pay-1/cancel`,
        {},
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.cancel("pay-1"),
      httpMethod: "post",
      errorMessage: "Failed to cancel payment with id pay-1",
    });

    const paymentMethodService = createPaymentMethodService(client);
    const paymentMethod = { type: "bank" } as any;
    await expectSuccess({
      client,
      call: () => paymentMethodService.add("cust-1", paymentMethod),
      httpMethod: "post",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/customers/cust-1/payment_methods`,
        paymentMethod,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => paymentMethodService.add("cust-1", paymentMethod),
      httpMethod: "post",
      errorMessage: "Failed to add payment method for customer cust-1",
    });

    await expectSuccess({
      client,
      call: () => paymentMethodService.get("cust-1", "pay-1"),
      httpMethod: "get",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/customers/cust-1/payment_methods/pay-1`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => paymentMethodService.get("cust-1", "pay-1"),
      httpMethod: "get",
      errorMessage: "Failed to get payment method for customer cust-1",
    });

    await expectSuccess({
      client,
      call: () =>
        paymentMethodService.list("cust-1", {
          type: "pix",
          status: undefined,
        }),
      httpMethod: "get",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/customers/cust-1/payment_methods?type=pix`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => paymentMethodService.list("cust-1"),
      httpMethod: "get",
      errorMessage: "Failed to get payment method for customer cust-1",
    });

    await expectSuccess({
      client,
      call: () => paymentMethodService.delete("cust-1", "pm-1"),
      httpMethod: "delete",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/customers/cust-1/payment_methods/pm-1`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => paymentMethodService.delete("cust-1", "pm-1"),
      httpMethod: "delete",
      errorMessage: "Failed to delete payment method pm-1 for customer cust-1",
    });

    const tokenErrorClient = makeClientWithTokenError();
    const tokenPaymentService = createPaymentService(tokenErrorClient);
    const tokenPaymentMethodService = createPaymentMethodService(tokenErrorClient);
    await expectTokenFailure(() => tokenPaymentService.create(payment));
    await expectTokenFailure(() => tokenPaymentService.confirm("pay-1"));
    await expectTokenFailure(() => tokenPaymentService.cancel("pay-1"));
    await expectTokenFailure(() =>
      tokenPaymentMethodService.add("cust-1", paymentMethod)
    );
    await expectTokenFailure(() =>
      tokenPaymentMethodService.get("cust-1", "pay-1")
    );
    await expectTokenFailure(() =>
      tokenPaymentMethodService.list("cust-1", { type: "pix" })
    );
    await expectTokenFailure(() =>
      tokenPaymentMethodService.delete("cust-1", "pm-1")
    );
  });

  it("provider service methods", async () => {
    const client = makeClient();
    const service = createProviderService(client);
    const authConfig = getAuthConfig(client);
    const request = { provider: "stripe" } as any;

    await expectSuccess({
      client,
      call: () => service.getSchema(request),
      httpMethod: "get",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/provider-registration/schema?provider=stripe`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.getSchema(request),
      httpMethod: "get",
      errorMessage: "Failed to retrieve provider schema for stripe",
    });

    await expectSuccess({
      client,
      call: () => service.getRegistrationStatus("cust-1"),
      httpMethod: "get",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/provider-registration/cust-1/status`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.getRegistrationStatus("cust-1"),
      httpMethod: "get",
      errorMessage:
        "Failed to retrieve provider registration status for customer cust-1",
    });

    const registration = { provider: "stripe", target_role: "customer" } as any;
    await expectSuccess({
      client,
      call: () => service.submitRegistration("cust-1", registration),
      httpMethod: "post",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/provider-registration/cust-1/submit`,
        registration,
        authConfig,
      ],
    });

    mockedHttpClient.post.mockRejectedValueOnce({ body: { msg: "Bad" } });
    const badResult = await service.submitRegistration("cust-1", registration);
    expect(badResult).toEqual(err(expect.any(SDKError)));
    if ("ok" in badResult && !badResult.ok) {
      const error = (badResult as { error: SDKError }).error;
      expect(error.message).toContain(
        "Failed to submit provider registration for customer cust-1: Bad"
      );
    }

    mockedHttpClient.post.mockRejectedValueOnce("boom");
    const boomResult = await service.submitRegistration("cust-1", registration);
    expect(boomResult).toEqual(err(expect.any(SDKError)));
    if ("ok" in boomResult && !boomResult.ok) {
      const error = (boomResult as { error: SDKError }).error;
      expect(error.message).toContain(
        "Failed to submit provider registration for customer cust-1: Unknown error"
      );
    }

    const tokenErrorClient = makeClientWithTokenError();
    const tokenErrorService = createProviderService(tokenErrorClient);
    await expectTokenFailure(() => tokenErrorService.getSchema(request));
    await expectTokenFailure(() =>
      tokenErrorService.getRegistrationStatus("cust-1")
    );
    await expectTokenFailure(() =>
      tokenErrorService.submitRegistration("cust-1", registration)
    );
  });

  it("transaction service methods", async () => {
    const client = makeClient();
    const service = createTransactionService(client);
    const authConfig = getAuthConfig(client);
    const settlement = { charge_id: "ch_1", amount: 10, status: "SETTLED" } as any;

    await expectSuccess({
      client,
      call: () =>
        service.list({ type_list: "refund", status: undefined }),
      httpMethod: "get",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/transactions?type_list=refund`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.list({ type_list: "refund" }),
      httpMethod: "get",
      errorMessage: "Failed to get all transaction",
    });

    await expectSuccess({
      client,
      call: () => service.get("txn-1"),
      httpMethod: "get",
      expectedArgs: [`${SANDBOX_URL}/api/v1/transactions/txn-1`, authConfig],
    });
    await expectFailure({
      call: () => service.get("txn-1"),
      httpMethod: "get",
      errorMessage: "Failed to get transaction",
    });

    await expectSuccess({
      client,
      call: () => service.settle("txn-1", settlement),
      httpMethod: "patch",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/transactions/txn-1/settle`,
        settlement,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.settle("txn-1", settlement),
      httpMethod: "patch",
      errorMessage: "Failed to settle transaction",
    });

    const tokenErrorClient = makeClientWithTokenError();
    const tokenErrorService = createTransactionService(tokenErrorClient);
    await expectTokenFailure(() =>
      tokenErrorService.list({ type_list: "refund" })
    );
    await expectTokenFailure(() => tokenErrorService.get("txn-1"));
    await expectTokenFailure(() =>
      tokenErrorService.settle("txn-1", settlement)
    );
  });

  it("transfer, sell, buy services", async () => {
    const client = makeClient();
    const authConfig = getAuthConfig(client);
    const transferService = createTransferService(client);
    const sellService = createSellService(client);
    const buyService = createBuyService(client);

    const transfer = { amount: 1 } as any;
    await expectSuccess({
      client,
      call: () => transferService.create(transfer),
      httpMethod: "post",
      expectedArgs: [`${SANDBOX_URL}/api/v1/transfer`, transfer, authConfig],
    });
    await expectFailure({
      call: () => transferService.create(transfer),
      httpMethod: "post",
      errorMessage: "Failed to create transfer",
    });

    const sell = { amount: 1 } as any;
    await expectSuccess({
      client,
      call: () => sellService.create(sell),
      httpMethod: "post",
      expectedArgs: [`${SANDBOX_URL}/api/v1/sell`, sell, authConfig],
    });
    await expectFailure({
      call: () => sellService.create(sell),
      httpMethod: "post",
      errorMessage: "Failed to create sell",
    });

    const buy = { amount: 1 } as any;
    await expectSuccess({
      client,
      call: () => buyService.create(buy),
      httpMethod: "post",
      expectedArgs: [`${SANDBOX_URL}/api/v1/buy`, buy, authConfig],
    });
    await expectFailure({
      call: () => buyService.create(buy),
      httpMethod: "post",
      errorMessage: "Failed to create buy",
    });

    const tokenErrorClient = makeClientWithTokenError();
    const tokenTransferService = createTransferService(tokenErrorClient);
    const tokenSellService = createSellService(tokenErrorClient);
    const tokenBuyService = createBuyService(tokenErrorClient);
    await expectTokenFailure(() => tokenTransferService.create(transfer));
    await expectTokenFailure(() => tokenSellService.create(sell));
    await expectTokenFailure(() => tokenBuyService.create(buy));
  });

  it("plan service methods", async () => {
    const client = makeClient();
    const service = createPlanService(client);
    const authConfig = getAuthConfig(client);
    const planRequest = {
      name: "Plan",
      description: "Desc",
      frequency: 1,
      price: 10,
      start_date: "2020-01-01",
      is_auto_renewable: false,
      currency: "BRL",
      allow_amount_override: false,
      created_by: "user",
    } as any;

    await expectSuccess({
      client,
      call: () => service.create(planRequest),
      httpMethod: "post",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/subscription/plans`,
        planRequest,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.create(planRequest),
      httpMethod: "post",
      errorMessage: "Failed to create plan",
    });

    await expectSuccess({
      client,
      call: () => service.publish("plan-1"),
      httpMethod: "patch",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/subscription/plans/plan-1/publish`,
        undefined,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.publish("plan-1"),
      httpMethod: "patch",
      errorMessage: "Failed to publish plan",
    });

    await expectSuccess({
      client,
      call: () => service.details("plan-1"),
      httpMethod: "get",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/subscription/plans/plan-1`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.details("plan-1"),
      httpMethod: "get",
      errorMessage: "Failed to get plan details",
    });

    await expectSuccess({
      client,
      call: () => service.list({ page_no: 1, per_page: undefined }),
      httpMethod: "get",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/subscription/plans?page_no=1`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.list({ page_no: 1 }),
      httpMethod: "get",
      errorMessage: "Failed to get available plans",
    });

    await expectSuccess({
      client,
      call: () => service.update("plan-1", planRequest),
      httpMethod: "patch",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/subscription/plans/plan-1`,
        planRequest,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.update("plan-1", planRequest),
      httpMethod: "patch",
      errorMessage: "Failed to update plan",
    });

    await expectSuccess({
      client,
      call: () => service.delete("plan-1"),
      httpMethod: "delete",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/subscription/plans/plan-1`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.delete("plan-1"),
      httpMethod: "delete",
      errorMessage: "Failed to delete plan",
    });

    const tokenErrorClient = makeClientWithTokenError();
    const tokenErrorService = createPlanService(tokenErrorClient);
    await expectTokenFailure(() => tokenErrorService.create(planRequest));
    await expectTokenFailure(() => tokenErrorService.publish("plan-1"));
    await expectTokenFailure(() => tokenErrorService.details("plan-1"));
    await expectTokenFailure(() => tokenErrorService.list({ page_no: 1 }));
    await expectTokenFailure(() => tokenErrorService.update("plan-1", planRequest));
    await expectTokenFailure(() => tokenErrorService.delete("plan-1"));
  });

  it("webhook service methods", async () => {
    const client = makeClient();
    const service = createWebhookService(client);
    const authConfig = getAuthConfig(client);
    const webhook = { url: "https://example.com" } as any;

    await expectSuccess({
      client,
      call: () => service.register(webhook),
      httpMethod: "post",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/merchant/webhooks`,
        webhook,
        authConfig,
      ],
    });

    mockedHttpClient.post.mockRejectedValueOnce({
      body: { msg: "This URL is Already Registered!" },
    });
    const duplicateResult = await service.register(webhook);
    expect(duplicateResult).toEqual(err(expect.any(SDKError)));
    if ("ok" in duplicateResult && !duplicateResult.ok) {
      const error = (duplicateResult as { error: SDKError }).error;
      expect(error.message).toContain(
        "Webhook URL is already registered."
      );
    }

    mockedHttpClient.post.mockRejectedValueOnce(new Error("fail"));
    const failResult = await service.register(webhook);
    expect(failResult).toEqual(err(expect.any(SDKError)));
    if ("ok" in failResult && !failResult.ok) {
      const error = (failResult as { error: SDKError }).error;
      expect(error.message).toContain("Failed to create webhook");
    }

    await expectSuccess({
      client,
      call: () => service.list(),
      httpMethod: "get",
      expectedArgs: [`${SANDBOX_URL}/api/v1/merchant/webhooks`, authConfig],
    });
    await expectFailure({
      call: () => service.list(),
      httpMethod: "get",
      errorMessage: "Failed to get webhook list",
    });

    await expectSuccess({
      client,
      call: () => service.get("wh-1"),
      httpMethod: "get",
      expectedArgs: [`${SANDBOX_URL}/api/v1/merchant/webhooks/wh-1`, authConfig],
    });
    await expectFailure({
      call: () => service.get("wh-1"),
      httpMethod: "get",
      errorMessage: "Failed to get webhook list",
    });

    await expectSuccess({
      client,
      call: () => service.update("wh-1", webhook),
      httpMethod: "put",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/merchant/webhooks/wh-1`,
        webhook,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.update("wh-1", webhook),
      httpMethod: "put",
      errorMessage: "Failed updating webhook ",
    });

    await expectSuccess({
      client,
      call: () => service.toggle("wh-1"),
      httpMethod: "patch",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/merchant/webhooks/wh-1/toggle`,
        undefined,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.toggle("wh-1"),
      httpMethod: "patch",
      errorMessage: "Failed updating webhook ",
    });

    await expectSuccess({
      client,
      call: () => service.delete("wh-1"),
      httpMethod: "delete",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/merchant/webhooks/wh-1`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.delete("wh-1"),
      httpMethod: "delete",
      errorMessage: "Failed deleting webhook ",
    });

    await expectSuccess({
      client,
      call: () =>
        service.listNotifications({ limit: 1, offset: undefined }),
      httpMethod: "get",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/merchant/webhooks/notifications?limit=1`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.listNotifications({ limit: 1 }),
      httpMethod: "get",
      errorMessage: "Failed getting webhook notificaiton list ",
    });

    await expectSuccess({
      client,
      call: () => service.getNotification("wh-1"),
      httpMethod: "get",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/merchant/webhooks/notifications/wh-1`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.getNotification("wh-1"),
      httpMethod: "get",
      errorMessage: "Failed getting webhook notificaiton ",
    });

    const tokenErrorClient = makeClientWithTokenError();
    const tokenErrorService = createWebhookService(tokenErrorClient);
    await expectTokenFailure(() => tokenErrorService.register(webhook));
    await expectTokenFailure(() => tokenErrorService.list());
    await expectTokenFailure(() => tokenErrorService.get("wh-1"));
    await expectTokenFailure(() => tokenErrorService.update("wh-1", webhook));
    await expectTokenFailure(() => tokenErrorService.toggle("wh-1"));
    await expectTokenFailure(() => tokenErrorService.delete("wh-1"));
    await expectTokenFailure(() =>
      tokenErrorService.listNotifications({ limit: 1 })
    );
    await expectTokenFailure(() => tokenErrorService.getNotification("wh-1"));
  });
});
