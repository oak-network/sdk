import {
  createAuthService,
  createBuyService,
  createCustomerService,
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

const baseUrl = "https://api.test";
const retryOptions = { maxNumberOfRetries: 0, delay: 0 };

const makeClient = (): OakClient => ({
  config: { baseUrl, clientId: "id", clientSecret: "secret" },
  retryOptions,
  getAccessToken: jest.fn().mockResolvedValue("token"),
  grantToken: jest.fn(),
});

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

  expect(result).toBe(response);
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

  await expect(options.call()).rejects.toThrow(SDKError);
  await expect(options.call()).rejects.toThrow(options.errorMessage);
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
      call: () => service.createCustomer({ email: "test@example.com" }),
      httpMethod: "post",
      expectedArgs: [
        `${baseUrl}/api/v1/customers`,
        { email: "test@example.com" },
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.createCustomer({ email: "test@example.com" }),
      httpMethod: "post",
      errorMessage: "Failed to create customer",
    });

    await expectSuccess({
      client,
      call: () => service.getCustomer("cust-1"),
      httpMethod: "get",
      expectedArgs: [`${baseUrl}/api/v1/customers/cust-1`, authConfig],
    });
    await expectFailure({
      call: () => service.getCustomer("cust-1"),
      httpMethod: "get",
      errorMessage: "Failed to retrieve customer",
    });

    await expectSuccess({
      client,
      call: () => service.getAllCustomers({ limit: 10, offset: undefined }),
      httpMethod: "get",
      expectedArgs: [`${baseUrl}/api/v1/customers?limit=10`, authConfig],
    });
    await expectSuccess({
      client,
      call: () => service.getAllCustomers({ limit: undefined }),
      httpMethod: "get",
      expectedArgs: [`${baseUrl}/api/v1/customers`, authConfig],
    });
    await expectFailure({
      call: () => service.getAllCustomers({ limit: 10 }),
      httpMethod: "get",
      errorMessage: "Failed to list customers",
    });

    await expectSuccess({
      client,
      call: () => service.updateCustomer("cust-1", { email: "new@example.com" }),
      httpMethod: "put",
      expectedArgs: [
        `${baseUrl}/api/v1/customers/cust-1`,
        { email: "new@example.com" },
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.updateCustomer("cust-1", { email: "new@example.com" }),
      httpMethod: "put",
      errorMessage: "Failed to update customer",
    });
  });

  it("payment service methods", async () => {
    const client = makeClient();
    const service = createPaymentService(client);
    const authConfig = getAuthConfig(client);
    const payment = { provider: "stripe" } as any;

    await expectSuccess({
      client,
      call: () => service.createPayment(payment),
      httpMethod: "post",
      expectedArgs: [`${baseUrl}/api/v1/payments/`, payment, authConfig],
    });
    await expectFailure({
      call: () => service.createPayment(payment),
      httpMethod: "post",
      errorMessage: "Failed to create payment",
    });

    await expectSuccess({
      client,
      call: () => service.confirmPayment("pay-1"),
      httpMethod: "post",
      expectedArgs: [
        `${baseUrl}/api/v1/payments/pay-1/confirm`,
        {},
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.confirmPayment("pay-1"),
      httpMethod: "post",
      errorMessage: "Failed to confirm payment with id pay-1",
    });

    await expectSuccess({
      client,
      call: () => service.cancelPayment("pay-1"),
      httpMethod: "post",
      expectedArgs: [
        `${baseUrl}/api/v1/payments/pay-1/cancel`,
        {},
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.cancelPayment("pay-1"),
      httpMethod: "post",
      errorMessage: "Failed to cancel payment with id pay-1",
    });

    const paymentMethod = { type: "bank" } as any;
    await expectSuccess({
      client,
      call: () => service.addCustomerPaymentMethod("cust-1", paymentMethod),
      httpMethod: "post",
      expectedArgs: [
        `${baseUrl}/api/v1/customers/cust-1/payment_methods`,
        paymentMethod,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.addCustomerPaymentMethod("cust-1", paymentMethod),
      httpMethod: "post",
      errorMessage: "Failed to add payment method for customer cust-1",
    });

    await expectSuccess({
      client,
      call: () => service.getCustomerPaymentMethod("cust-1", "pay-1"),
      httpMethod: "get",
      expectedArgs: [
        `${baseUrl}/api/v1/customers/cust-1/payment_methods/pay-1`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.getCustomerPaymentMethod("cust-1", "pay-1"),
      httpMethod: "get",
      errorMessage: "Failed to get payment method for customer cust-1",
    });

    await expectSuccess({
      client,
      call: () =>
        service.getAllCustomerPaymentMethods("cust-1", {
          type: "pix",
          status: undefined,
        }),
      httpMethod: "get",
      expectedArgs: [
        `${baseUrl}/api/v1/customers/cust-1/payment_methods?type=pix`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.getAllCustomerPaymentMethods("cust-1"),
      httpMethod: "get",
      errorMessage: "Failed to get payment method for customer cust-1",
    });

    await expectSuccess({
      client,
      call: () => service.deleteCustomerPaymentMethod("cust-1", "pm-1"),
      httpMethod: "delete",
      expectedArgs: [
        `${baseUrl}/api/v1/customers/cust-1/payment_methods/pm-1`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.deleteCustomerPaymentMethod("cust-1", "pm-1"),
      httpMethod: "delete",
      errorMessage: "Failed to delete payment method pm-1 for customer cust-1",
    });
  });

  it("provider service methods", async () => {
    const client = makeClient();
    const service = createProviderService(client);
    const authConfig = getAuthConfig(client);
    const request = { provider: "stripe" } as any;

    await expectSuccess({
      client,
      call: () => service.getProviderSchema(request),
      httpMethod: "get",
      expectedArgs: [
        `${baseUrl}/api/v1/provider-registration/schema?provider=stripe`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.getProviderSchema(request),
      httpMethod: "get",
      errorMessage: "Failed to retrieve provider schema for stripe",
    });

    await expectSuccess({
      client,
      call: () => service.getProviderRegistrationStatus("cust-1"),
      httpMethod: "get",
      expectedArgs: [
        `${baseUrl}/api/v1/provider-registration/cust-1/status`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.getProviderRegistrationStatus("cust-1"),
      httpMethod: "get",
      errorMessage:
        "Failed to retrieve provider registration status for customer cust-1",
    });

    const registration = { provider: "stripe", target_role: "customer" } as any;
    await expectSuccess({
      client,
      call: () => service.submitProviderRegistration("cust-1", registration),
      httpMethod: "post",
      expectedArgs: [
        `${baseUrl}/api/v1/provider-registration/cust-1/submit`,
        registration,
        authConfig,
      ],
    });

    mockedHttpClient.post.mockRejectedValueOnce({ body: { msg: "Bad" } });
    await expect(
      service.submitProviderRegistration("cust-1", registration)
    ).rejects.toThrow(
      "Failed to submit provider registration for customer cust-1: Bad"
    );

    mockedHttpClient.post.mockRejectedValueOnce("boom");
    await expect(
      service.submitProviderRegistration("cust-1", registration)
    ).rejects.toThrow(
      "Failed to submit provider registration for customer cust-1: Unknown error"
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
        service.getAllTransactions({ type_list: "refund", status: undefined }),
      httpMethod: "get",
      expectedArgs: [
        `${baseUrl}/api/v1/transactions?type_list=refund`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.getAllTransactions({ type_list: "refund" }),
      httpMethod: "get",
      errorMessage: "Failed to get all transaction",
    });

    await expectSuccess({
      client,
      call: () => service.getTransaction("txn-1"),
      httpMethod: "get",
      expectedArgs: [`${baseUrl}/api/v1/transactions/txn-1`, authConfig],
    });
    await expectFailure({
      call: () => service.getTransaction("txn-1"),
      httpMethod: "get",
      errorMessage: "Failed to get transaction",
    });

    await expectSuccess({
      client,
      call: () => service.settleIndividualTransaction("txn-1", settlement),
      httpMethod: "patch",
      expectedArgs: [
        `${baseUrl}/api/v1/transactions/txn-1/settle`,
        settlement,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.settleIndividualTransaction("txn-1", settlement),
      httpMethod: "patch",
      errorMessage: "Failed to settle transaction",
    });
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
      call: () => transferService.createTransfer(transfer),
      httpMethod: "post",
      expectedArgs: [`${baseUrl}/api/v1/transfer`, transfer, authConfig],
    });
    await expectFailure({
      call: () => transferService.createTransfer(transfer),
      httpMethod: "post",
      errorMessage: "Failed to create transfer",
    });

    const sell = { amount: 1 } as any;
    await expectSuccess({
      client,
      call: () => sellService.createSell(sell),
      httpMethod: "post",
      expectedArgs: [`${baseUrl}/api/v1/sell`, sell, authConfig],
    });
    await expectFailure({
      call: () => sellService.createSell(sell),
      httpMethod: "post",
      errorMessage: "Failed to create sell",
    });

    const buy = { amount: 1 } as any;
    await expectSuccess({
      client,
      call: () => buyService.createBuy(buy),
      httpMethod: "post",
      expectedArgs: [`${baseUrl}/api/v1/buy`, buy, authConfig],
    });
    await expectFailure({
      call: () => buyService.createBuy(buy),
      httpMethod: "post",
      errorMessage: "Failed to create buy",
    });
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
      call: () => service.createPlan(planRequest),
      httpMethod: "post",
      expectedArgs: [
        `${baseUrl}/api/v1/subscription/plans`,
        planRequest,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.createPlan(planRequest),
      httpMethod: "post",
      errorMessage: "Failed to create plan",
    });

    await expectSuccess({
      client,
      call: () => service.publishPlan("plan-1"),
      httpMethod: "patch",
      expectedArgs: [
        `${baseUrl}/api/v1/subscription/plans/plan-1/publish`,
        undefined,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.publishPlan("plan-1"),
      httpMethod: "patch",
      errorMessage: "Failed to publish plan",
    });

    await expectSuccess({
      client,
      call: () => service.planDetails("plan-1"),
      httpMethod: "get",
      expectedArgs: [
        `${baseUrl}/api/v1/subscription/plans/plan-1`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.planDetails("plan-1"),
      httpMethod: "get",
      errorMessage: "Failed to get plan details",
    });

    await expectSuccess({
      client,
      call: () => service.listAvailablePlans({ page_no: 1, per_page: undefined }),
      httpMethod: "get",
      expectedArgs: [
        `${baseUrl}/api/v1/subscription/plans?page_no=1`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.listAvailablePlans({ page_no: 1 }),
      httpMethod: "get",
      errorMessage: "Failed to get available plans",
    });

    await expectSuccess({
      client,
      call: () => service.updatePlan("plan-1", planRequest),
      httpMethod: "patch",
      expectedArgs: [
        `${baseUrl}/api/v1/subscription/plans/plan-1`,
        planRequest,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.updatePlan("plan-1", planRequest),
      httpMethod: "patch",
      errorMessage: "Failed to update plan",
    });

    await expectSuccess({
      client,
      call: () => service.deletePlan("plan-1"),
      httpMethod: "delete",
      expectedArgs: [
        `${baseUrl}/api/v1/subscription/plans/plan-1`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.deletePlan("plan-1"),
      httpMethod: "delete",
      errorMessage: "Failed to delete plan",
    });
  });

  it("webhook service methods", async () => {
    const client = makeClient();
    const service = createWebhookService(client);
    const authConfig = getAuthConfig(client);
    const webhook = { url: "https://example.com" } as any;

    await expectSuccess({
      client,
      call: () => service.registerWebhook(webhook),
      httpMethod: "post",
      expectedArgs: [
        `${baseUrl}/api/v1/merchant/webhooks`,
        webhook,
        authConfig,
      ],
    });

    mockedHttpClient.post.mockRejectedValueOnce({
      body: { msg: "This URL is Already Registered!" },
    });
    await expect(service.registerWebhook(webhook)).rejects.toThrow(
      "Webhook URL is already registered."
    );

    mockedHttpClient.post.mockRejectedValueOnce(new Error("fail"));
    await expect(service.registerWebhook(webhook)).rejects.toThrow(
      "Failed to create webhook"
    );

    await expectSuccess({
      client,
      call: () => service.getAllWebhooks(),
      httpMethod: "get",
      expectedArgs: [`${baseUrl}/api/v1/merchant/webhooks`, authConfig],
    });
    await expectFailure({
      call: () => service.getAllWebhooks(),
      httpMethod: "get",
      errorMessage: "Failed to get webhook list",
    });

    await expectSuccess({
      client,
      call: () => service.getWebhook("wh-1"),
      httpMethod: "get",
      expectedArgs: [`${baseUrl}/api/v1/merchant/webhooks/wh-1`, authConfig],
    });
    await expectFailure({
      call: () => service.getWebhook("wh-1"),
      httpMethod: "get",
      errorMessage: "Failed to get webhook list",
    });

    await expectSuccess({
      client,
      call: () => service.updateWebhook("wh-1", webhook),
      httpMethod: "put",
      expectedArgs: [
        `${baseUrl}/api/v1/merchant/webhooks/wh-1`,
        webhook,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.updateWebhook("wh-1", webhook),
      httpMethod: "put",
      errorMessage: "Failed updating webhook ",
    });

    await expectSuccess({
      client,
      call: () => service.toggleWebhook("wh-1"),
      httpMethod: "patch",
      expectedArgs: [
        `${baseUrl}/api/v1/merchant/webhooks/wh-1/toggle`,
        undefined,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.toggleWebhook("wh-1"),
      httpMethod: "patch",
      errorMessage: "Failed updating webhook ",
    });

    await expectSuccess({
      client,
      call: () => service.deleteWebhook("wh-1"),
      httpMethod: "delete",
      expectedArgs: [
        `${baseUrl}/api/v1/merchant/webhooks/wh-1`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.deleteWebhook("wh-1"),
      httpMethod: "delete",
      errorMessage: "Failed deleting webhook ",
    });

    await expectSuccess({
      client,
      call: () =>
        service.getAllWebhookNotifications({ limit: 1, offset: undefined }),
      httpMethod: "get",
      expectedArgs: [
        `${baseUrl}/api/v1/merchant/webhooks/notifications?limit=1`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.getAllWebhookNotifications({ limit: 1 }),
      httpMethod: "get",
      errorMessage: "Failed getting webhook notificaiton list ",
    });

    await expectSuccess({
      client,
      call: () => service.getWebhookNotifications("wh-1"),
      httpMethod: "get",
      expectedArgs: [
        `${baseUrl}/api/v1/merchant/webhooks/notifications/wh-1`,
        authConfig,
      ],
    });
    await expectFailure({
      call: () => service.getWebhookNotifications("wh-1"),
      httpMethod: "get",
      errorMessage: "Failed getting webhook notificaiton ",
    });
  });
});
