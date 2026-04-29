import {
  createSubscriptionService,
  createDisputeService,
  createPayoutService,
  createWalletService,
  createMerchantService,
  createFileService,
  createTaxService,
  createProviderProxyService,
  createPixService,
  createSandboxService,
  createPaymentService,
  createCustomerService,
  createTransferService,
} from "../../src/services";
import { httpClient } from "../../src/utils/httpClient";
import { ApiError, SDKError } from "../../src/utils/errorHandler";
import type { OakClient } from "../../src/types";
import { err, ok } from "../../src/types";
import { ENVIRONMENT_URLS } from "../../src/types/environment";

const SANDBOX_URL = ENVIRONMENT_URLS.sandbox;

jest.mock("../../src/utils/httpClient", () => ({
  httpClient: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    postMultipart: jest.fn(),
  },
}));

const mockedHttpClient = httpClient as jest.Mocked<typeof httpClient>;

const retryOptions = { maxNumberOfRetries: 0, delay: 0, backoffFactor: 2 };

const makeClient = (): OakClient => ({
  config: {
    environment: "sandbox",
    clientId: "id",
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
  mockedHttpClient[options.httpMethod].mockResolvedValue(ok(response) as never);

  const result = await options.call();

  expect(result).toEqual(ok(response));
  expect(mockedHttpClient[options.httpMethod]).toHaveBeenCalledWith(
    ...options.expectedArgs,
  );
  expect(options.client.getAccessToken).toHaveBeenCalled();
};

const expectFailure = async (options: {
  call: () => Promise<unknown>;
  httpMethod: keyof typeof mockedHttpClient;
  errorMessage: string;
}) => {
  const apiError = new ApiError(options.errorMessage, 400, {
    msg: options.errorMessage,
  });
  mockedHttpClient[options.httpMethod].mockResolvedValue(
    err(apiError) as never,
  );

  const result = await options.call();
  expect(result).toEqual(err(expect.any(ApiError)));
};

const expectTokenFailure = async (call: () => Promise<unknown>) => {
  const result = await call();
  expect(result).toEqual(err(expect.any(SDKError)));
};

describe("New services (Unit)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------
  // PaymentService - capture, sandboxPaid, sandboxSettle
  // ---------------------------------------------------------------
  it("paymentService.capture success", async () => {
    const client = makeClient();
    const service = createPaymentService(client);
    await expectSuccess({
      client,
      call: () => service.capture("pay-1"),
      httpMethod: "post",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/payments/pay-1/capture`,
        {},
        getAuthConfig(client),
      ],
    });
  });

  it("paymentService.capture failure", async () => {
    const client = makeClient();
    const service = createPaymentService(client);
    await expectFailure({
      call: () => service.capture("pay-1"),
      httpMethod: "post",
      errorMessage: "Failed to capture payment",
    });
  });

  it("paymentService.capture token error", async () => {
    const client = makeClientWithTokenError();
    const service = createPaymentService(client);
    await expectTokenFailure(() => service.capture("pay-1"));
  });

  it("paymentService.sandboxPaid success", async () => {
    const client = makeClient();
    const service = createPaymentService(client);
    await expectSuccess({
      client,
      call: () => service.sandboxPaid("pay-1"),
      httpMethod: "post",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/payments/pay-1/sandbox/paid`,
        {},
        getAuthConfig(client),
      ],
    });
  });

  it("paymentService.sandboxPaid token error", async () => {
    const client = makeClientWithTokenError();
    const service = createPaymentService(client);
    await expectTokenFailure(() => service.sandboxPaid("pay-1"));
  });

  it("paymentService.sandboxSettle success", async () => {
    const client = makeClient();
    const service = createPaymentService(client);
    await expectSuccess({
      client,
      call: () => service.sandboxSettle("pay-1"),
      httpMethod: "post",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/payments/pay-1/sandbox/settle`,
        {},
        getAuthConfig(client),
      ],
    });
  });

  it("paymentService.sandboxSettle token error", async () => {
    const client = makeClientWithTokenError();
    const service = createPaymentService(client);
    await expectTokenFailure(() => service.sandboxSettle("pay-1"));
  });

  // ---------------------------------------------------------------
  // CustomerService - uploadFiles, getFiles, populatePlatform
  // ---------------------------------------------------------------
  it("customerService.uploadFiles success", async () => {
    const client = makeClient();
    const service = createCustomerService(client);
    await expectSuccess({
      client,
      call: () => service.uploadFiles("cust-1", {}),
      httpMethod: "postMultipart",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/customers/cust-1/files`,
        {},
        getAuthConfig(client),
      ],
    });
  });

  it("customerService.uploadFiles token error", async () => {
    const client = makeClientWithTokenError();
    const service = createCustomerService(client);
    await expectTokenFailure(() => service.uploadFiles("cust-1", {}));
  });

  it("customerService.getFiles success", async () => {
    const client = makeClient();
    const service = createCustomerService(client);
    await expectSuccess({
      client,
      call: () => service.getFiles("cust-1"),
      httpMethod: "get",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/customers/cust-1/files`,
        getAuthConfig(client),
      ],
    });
  });

  it("customerService.getFiles failure", async () => {
    const client = makeClient();
    const service = createCustomerService(client);
    await expectFailure({
      call: () => service.getFiles("cust-1"),
      httpMethod: "get",
      errorMessage: "Failed to get files",
    });
  });

  it("customerService.populatePlatform success", async () => {
    const client = makeClient();
    const service = createCustomerService(client);
    await expectSuccess({
      client,
      call: () =>
        service.populatePlatform("cust-1", { provider: "stripe" }),
      httpMethod: "post",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/customers/cust-1/platforms`,
        { provider: "stripe" },
        getAuthConfig(client),
      ],
    });
  });

  it("customerService.populatePlatform token error", async () => {
    const client = makeClientWithTokenError();
    const service = createCustomerService(client);
    await expectTokenFailure(() =>
      service.populatePlatform("cust-1", { provider: "stripe" }),
    );
  });

  // ---------------------------------------------------------------
  // TransferService - sendWebhook
  // ---------------------------------------------------------------
  it("transferService.sendWebhook success", async () => {
    const client = makeClient();
    const service = createTransferService(client);
    await expectSuccess({
      client,
      call: () => service.sendWebhook({ test: true }),
      httpMethod: "post",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/transfer/webhook`,
        { test: true },
        getAuthConfig(client),
      ],
    });
  });

  it("transferService.sendWebhook failure", async () => {
    const client = makeClient();
    const service = createTransferService(client);
    await expectFailure({
      call: () => service.sendWebhook({}),
      httpMethod: "post",
      errorMessage: "Failed to send webhook",
    });
  });

  it("transferService.sendWebhook token error", async () => {
    const client = makeClientWithTokenError();
    const service = createTransferService(client);
    await expectTokenFailure(() => service.sendWebhook({}));
  });

  // ---------------------------------------------------------------
  // SubscriptionService
  // ---------------------------------------------------------------
  it("subscriptionService.subscribe success", async () => {
    const client = makeClient();
    const service = createSubscriptionService(client);
    await expectSuccess({
      client,
      call: () =>
        service.subscribe({
          plan_id: "plan-1",
          source_customer_id: "src-1",
          destination_customer_id: "dst-1",
          payment_method_id: "pm-1",
          payment_method_type: "CARD",
          payment_method_provider: "PAGAR_ME",
          fee_bearer: "connected_account",
        }),
      httpMethod: "post",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/subscription/subscribe`,
        expect.any(Object),
        getAuthConfig(client),
      ],
    });
  });

  it("subscriptionService.subscribe failure", async () => {
    const client = makeClient();
    const service = createSubscriptionService(client);
    await expectFailure({
      call: () =>
        service.subscribe({
          plan_id: "x",
          source_customer_id: "x",
          destination_customer_id: "x",
          payment_method_id: "x",
          payment_method_type: "CARD",
          payment_method_provider: "PAGAR_ME",
          fee_bearer: "connected_account",
        }),
      httpMethod: "post",
      errorMessage: "Failed to subscribe",
    });
  });

  it("subscriptionService.subscribe token error", async () => {
    const client = makeClientWithTokenError();
    const service = createSubscriptionService(client);
    await expectTokenFailure(() =>
      service.subscribe({
        plan_id: "x",
        source_customer_id: "x",
        destination_customer_id: "x",
        payment_method_id: "x",
        payment_method_type: "CARD",
        payment_method_provider: "PAGAR_ME",
        fee_bearer: "connected_account",
      }),
    );
  });

  it("subscriptionService.cancel success", async () => {
    const client = makeClient();
    const service = createSubscriptionService(client);
    await expectSuccess({
      client,
      call: () => service.cancel("sub-1"),
      httpMethod: "patch",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/subscription/subscriptions/sub-1/cancel`,
        undefined,
        getAuthConfig(client),
      ],
    });
  });

  it("subscriptionService.cancel token error", async () => {
    const client = makeClientWithTokenError();
    const service = createSubscriptionService(client);
    await expectTokenFailure(() => service.cancel("sub-1"));
  });

  it("subscriptionService.get success", async () => {
    const client = makeClient();
    const service = createSubscriptionService(client);
    await expectSuccess({
      client,
      call: () => service.get("sub-1"),
      httpMethod: "get",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/subscription/sub-1`,
        getAuthConfig(client),
      ],
    });
  });

  it("subscriptionService.get token error", async () => {
    const client = makeClientWithTokenError();
    const service = createSubscriptionService(client);
    await expectTokenFailure(() => service.get("sub-1"));
  });

  it("subscriptionService.list success", async () => {
    const client = makeClient();
    const service = createSubscriptionService(client);
    const response = { ok: true };
    mockedHttpClient.get.mockResolvedValue(ok(response) as never);
    const result = await service.list({ customer_id: "cust-1" });
    expect(result).toEqual(ok(response));
    expect(client.getAccessToken).toHaveBeenCalled();
  });

  it("subscriptionService.list token error", async () => {
    const client = makeClientWithTokenError();
    const service = createSubscriptionService(client);
    await expectTokenFailure(() =>
      service.list({ customer_id: "cust-1" }),
    );
  });

  it("subscriptionService.pay success", async () => {
    const client = makeClient();
    const service = createSubscriptionService(client);
    await expectSuccess({
      client,
      call: () =>
        service.pay("sub-1", {
          customer_id: "cust-1",
          payment_method_id: "pm-1",
          payment_method_type: "CARD",
          payment_method_provider: "PAGAR_ME",
        }),
      httpMethod: "post",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/subscription/sub-1/payment`,
        expect.any(Object),
        getAuthConfig(client),
      ],
    });
  });

  it("subscriptionService.pay token error", async () => {
    const client = makeClientWithTokenError();
    const service = createSubscriptionService(client);
    await expectTokenFailure(() =>
      service.pay("sub-1", {
        customer_id: "cust-1",
        payment_method_id: "pm-1",
        payment_method_type: "CARD",
        payment_method_provider: "PAGAR_ME",
      }),
    );
  });

  // ---------------------------------------------------------------
  // DisputeService
  // ---------------------------------------------------------------
  it("disputeService.list success", async () => {
    const client = makeClient();
    const service = createDisputeService(client);
    await expectSuccess({
      client,
      call: () => service.list(),
      httpMethod: "get",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/disputes`,
        getAuthConfig(client),
      ],
    });
  });

  it("disputeService.list token error", async () => {
    const client = makeClientWithTokenError();
    const service = createDisputeService(client);
    await expectTokenFailure(() => service.list());
  });

  it("disputeService.updateEvidence success", async () => {
    const client = makeClient();
    const service = createDisputeService(client);
    await expectSuccess({
      client,
      call: () =>
        service.updateEvidence("d-1", {
          text_evidences: [{ key: "customer_name", value: "Test" }],
        }),
      httpMethod: "put",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/disputes/d-1/evidence`,
        expect.any(Object),
        getAuthConfig(client),
      ],
    });
  });

  it("disputeService.updateEvidence failure", async () => {
    const client = makeClient();
    const service = createDisputeService(client);
    await expectFailure({
      call: () => service.updateEvidence("d-1", {}),
      httpMethod: "put",
      errorMessage: "Failed to update evidence",
    });
  });

  it("disputeService.submit success", async () => {
    const client = makeClient();
    const service = createDisputeService(client);
    await expectSuccess({
      client,
      call: () => service.submit("d-1"),
      httpMethod: "put",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/disputes/d-1/submit`,
        undefined,
        getAuthConfig(client),
      ],
    });
  });

  it("disputeService.close success", async () => {
    const client = makeClient();
    const service = createDisputeService(client);
    await expectSuccess({
      client,
      call: () => service.close("d-1"),
      httpMethod: "put",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/disputes/d-1/close`,
        undefined,
        getAuthConfig(client),
      ],
    });
  });

  it("disputeService.close token error", async () => {
    const client = makeClientWithTokenError();
    const service = createDisputeService(client);
    await expectTokenFailure(() => service.close("d-1"));
  });

  // ---------------------------------------------------------------
  // PayoutService
  // ---------------------------------------------------------------
  it("payoutService.create success", async () => {
    const client = makeClient();
    const service = createPayoutService(client);
    await expectSuccess({
      client,
      call: () =>
        service.create({
          payment_method_id: "pm-1",
          amount: 1000,
          currency: "USD",
          customer_id: "cust-1",
        }),
      httpMethod: "post",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/outbound_payments`,
        expect.any(Object),
        getAuthConfig(client),
      ],
    });
  });

  it("payoutService.create failure", async () => {
    const client = makeClient();
    const service = createPayoutService(client);
    await expectFailure({
      call: () =>
        service.create({
          payment_method_id: "x",
          amount: 1000,
          currency: "USD",
          customer_id: "x",
        }),
      httpMethod: "post",
      errorMessage: "Failed to create payout",
    });
  });

  it("payoutService.create token error", async () => {
    const client = makeClientWithTokenError();
    const service = createPayoutService(client);
    await expectTokenFailure(() =>
      service.create({
        payment_method_id: "x",
        amount: 1000,
        currency: "USD",
        customer_id: "x",
      }),
    );
  });

  // ---------------------------------------------------------------
  // WalletService
  // ---------------------------------------------------------------
  it("walletService.getBalance success", async () => {
    const client = makeClient();
    const service = createWalletService(client);
    await expectSuccess({
      client,
      call: () => service.getBalance("cust-1"),
      httpMethod: "get",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/wallets/cust-1/balance`,
        getAuthConfig(client),
      ],
    });
  });

  it("walletService.getBalance failure", async () => {
    const client = makeClient();
    const service = createWalletService(client);
    await expectFailure({
      call: () => service.getBalance("cust-1"),
      httpMethod: "get",
      errorMessage: "Balance not found",
    });
  });

  it("walletService.getBalance token error", async () => {
    const client = makeClientWithTokenError();
    const service = createWalletService(client);
    await expectTokenFailure(() => service.getBalance("cust-1"));
  });

  // ---------------------------------------------------------------
  // MerchantService
  // ---------------------------------------------------------------
  it("merchantService.calculateTransferDate success", async () => {
    const client = makeClient();
    const service = createMerchantService(client);
    await expectSuccess({
      client,
      call: () =>
        service.calculateTransferDate({
          settlementDate: "2026-05-01",
          region: "US",
        }),
      httpMethod: "post",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/merchant/util/transfer-date`,
        { settlementDate: "2026-05-01", region: "US" },
        getAuthConfig(client),
      ],
    });
  });

  it("merchantService.calculateTransferDate failure", async () => {
    const client = makeClient();
    const service = createMerchantService(client);
    await expectFailure({
      call: () =>
        service.calculateTransferDate({
          settlementDate: "invalid",
          region: "XX",
        }),
      httpMethod: "post",
      errorMessage: "Failed to calculate transfer date",
    });
  });

  it("merchantService.calculateTransferDate token error", async () => {
    const client = makeClientWithTokenError();
    const service = createMerchantService(client);
    await expectTokenFailure(() =>
      service.calculateTransferDate({
        settlementDate: "2026-05-01",
        region: "US",
      }),
    );
  });

  // ---------------------------------------------------------------
  // FileService
  // ---------------------------------------------------------------
  it("fileService.upload success", async () => {
    const client = makeClient();
    const service = createFileService(client);
    await expectSuccess({
      client,
      call: () => service.upload({}),
      httpMethod: "postMultipart",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/files`,
        {},
        getAuthConfig(client),
      ],
    });
  });

  it("fileService.upload token error", async () => {
    const client = makeClientWithTokenError();
    const service = createFileService(client);
    await expectTokenFailure(() => service.upload({}));
  });

  it("fileService.list success", async () => {
    const client = makeClient();
    const service = createFileService(client);
    await expectSuccess({
      client,
      call: () => service.list(),
      httpMethod: "get",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/files`,
        getAuthConfig(client),
      ],
    });
  });

  it("fileService.list token error", async () => {
    const client = makeClientWithTokenError();
    const service = createFileService(client);
    await expectTokenFailure(() => service.list());
  });

  it("fileService.get success", async () => {
    const client = makeClient();
    const service = createFileService(client);
    await expectSuccess({
      client,
      call: () => service.get("f-1"),
      httpMethod: "get",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/files/f-1`,
        getAuthConfig(client),
      ],
    });
  });

  it("fileService.get failure", async () => {
    const client = makeClient();
    const service = createFileService(client);
    await expectFailure({
      call: () => service.get("f-1"),
      httpMethod: "get",
      errorMessage: "File not found",
    });
  });

  it("fileService.delete success", async () => {
    const client = makeClient();
    const service = createFileService(client);
    await expectSuccess({
      client,
      call: () => service.delete("f-1"),
      httpMethod: "delete",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/files/f-1`,
        getAuthConfig(client),
      ],
    });
  });

  it("fileService.delete token error", async () => {
    const client = makeClientWithTokenError();
    const service = createFileService(client);
    await expectTokenFailure(() => service.delete("f-1"));
  });

  // ---------------------------------------------------------------
  // TaxService
  // ---------------------------------------------------------------
  it("taxService.calculate success", async () => {
    const client = makeClient();
    const service = createTaxService(client);
    await expectSuccess({
      client,
      call: () => service.calculate({ provider: "stripe" }),
      httpMethod: "post",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/taxes/calculate`,
        { provider: "stripe" },
        getAuthConfig(client),
      ],
    });
  });

  it("taxService.calculate failure", async () => {
    const client = makeClient();
    const service = createTaxService(client);
    await expectFailure({
      call: () => service.calculate({ provider: "stripe" }),
      httpMethod: "post",
      errorMessage: "Failed to calculate taxes",
    });
  });

  it("taxService.calculate token error", async () => {
    const client = makeClientWithTokenError();
    const service = createTaxService(client);
    await expectTokenFailure(() =>
      service.calculate({ provider: "stripe" }),
    );
  });

  // ---------------------------------------------------------------
  // ProviderProxyService
  // ---------------------------------------------------------------
  it("providerProxyService.proxy success", async () => {
    const client = makeClient();
    const service = createProviderProxyService(client);
    await expectSuccess({
      client,
      call: () =>
        service.proxy("stripe", {
          method: "GET",
          url: "https://example.com",
        }),
      httpMethod: "post",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/providers/stripe/proxy`,
        { method: "GET", url: "https://example.com" },
        getAuthConfig(client),
      ],
    });
  });

  it("providerProxyService.proxy failure", async () => {
    const client = makeClient();
    const service = createProviderProxyService(client);
    await expectFailure({
      call: () =>
        service.proxy("stripe", { method: "GET", url: "invalid" }),
      httpMethod: "post",
      errorMessage: "URL not whitelisted",
    });
  });

  it("providerProxyService.proxy token error", async () => {
    const client = makeClientWithTokenError();
    const service = createProviderProxyService(client);
    await expectTokenFailure(() =>
      service.proxy("stripe", { method: "GET", url: "https://example.com" }),
    );
  });

  // ---------------------------------------------------------------
  // PixService
  // ---------------------------------------------------------------
  it("pixService.createPaid success", async () => {
    const client = makeClient();
    const service = createPixService(client);
    await expectSuccess({
      client,
      call: () =>
        service.createPaid({
          pix_string: "test",
          pix_string_type: "BR_CODE",
          amount: 100,
        }),
      httpMethod: "post",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/pix/paid`,
        { pix_string: "test", pix_string_type: "BR_CODE", amount: 100 },
        getAuthConfig(client),
      ],
    });
  });

  it("pixService.createPaid failure", async () => {
    const client = makeClient();
    const service = createPixService(client);
    await expectFailure({
      call: () =>
        service.createPaid({
          pix_string: "test",
          pix_string_type: "BR_CODE",
          amount: 100,
        }),
      httpMethod: "post",
      errorMessage: "Failed to create PIX payment",
    });
  });

  it("pixService.createPaid token error", async () => {
    const client = makeClientWithTokenError();
    const service = createPixService(client);
    await expectTokenFailure(() =>
      service.createPaid({
        pix_string: "test",
        pix_string_type: "BR_CODE",
        amount: 100,
      }),
    );
  });

  // ---------------------------------------------------------------
  // SandboxService
  // ---------------------------------------------------------------
  it("sandboxService.simulateWebhook success", async () => {
    const client = makeClient();
    const service = createSandboxService(client);
    await expectSuccess({
      client,
      call: () =>
        service.simulateWebhook("stripe", {
          category: "payment_lifecycle",
        }),
      httpMethod: "post",
      expectedArgs: [
        `${SANDBOX_URL}/api/v1/sandbox/webhooks/stripe/simulate`,
        { category: "payment_lifecycle" },
        getAuthConfig(client),
      ],
    });
  });

  it("sandboxService.simulateWebhook failure", async () => {
    const client = makeClient();
    const service = createSandboxService(client);
    await expectFailure({
      call: () =>
        service.simulateWebhook("stripe", { category: "invalid" }),
      httpMethod: "post",
      errorMessage: "Failed to simulate webhook",
    });
  });

  it("sandboxService.simulateWebhook token error", async () => {
    const client = makeClientWithTokenError();
    const service = createSandboxService(client);
    await expectTokenFailure(() =>
      service.simulateWebhook("stripe", { category: "payment_lifecycle" }),
    );
  });
});
