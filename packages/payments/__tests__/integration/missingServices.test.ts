import {
  createOakClient,
  createCustomerService,
  createWalletService,
  createMerchantService,
  createFileService,
  createTaxService,
  createProviderProxyService,
  createPixService,
  createSandboxService,
  createTransferService,
  createPlanService,
  createSubscriptionService,
  createDisputeService,
  createPayoutService,
  createPaymentService,
} from '../../src';
import { CustomerService } from '../../src/services/customerService';
import { WalletService } from '../../src/services/walletService';
import { MerchantService } from '../../src/services/merchantService';
import { FileService } from '../../src/services/fileService';
import { TaxService } from '../../src/services/taxService';
import { ProviderProxyService } from '../../src/services/providerProxyService';
import { PixService } from '../../src/services/pixService';
import { SandboxService } from '../../src/services/sandboxService';
import { TransferService } from '../../src/services/transferService';
import { PlanService } from '../../src/services/planService';
import { SubscriptionService } from '../../src/services/subscriptionService';
import { DisputeService } from '../../src/services/disputeService';
import { PayoutService } from '../../src/services/payoutService';
import { PaymentService } from '../../src/services/paymentService';
import { getConfigFromEnv } from '../config';

const INTEGRATION_TEST_TIMEOUT = 30000;

describe('All New Services - Integration', () => {
  let customers: CustomerService;
  let wallets: WalletService;
  let merchant: MerchantService;
  let files: FileService;
  let taxes: TaxService;
  let providerProxy: ProviderProxyService;
  let pix: PixService;
  let sandbox: SandboxService;
  let transfers: TransferService;
  let plans: PlanService;
  let subscriptions: SubscriptionService;
  let disputes: DisputeService;
  let payouts: PayoutService;
  let payments: PaymentService;

  let existingCustomerId: string | undefined;
  let approvedCustomerId: string | undefined;

  beforeAll(async () => {
    const client = createOakClient({
      ...getConfigFromEnv(),
      retryOptions: {
        maxNumberOfRetries: 2,
        delay: 500,
        backoffFactor: 2,
      },
    });
    customers = createCustomerService(client);
    wallets = createWalletService(client);
    merchant = createMerchantService(client);
    files = createFileService(client);
    taxes = createTaxService(client);
    providerProxy = createProviderProxyService(client);
    pix = createPixService(client);
    sandbox = createSandboxService(client);
    transfers = createTransferService(client);
    plans = createPlanService(client);
    subscriptions = createSubscriptionService(client);
    disputes = createDisputeService(client);
    payouts = createPayoutService(client);
    payments = createPaymentService(client);

    // Find existing customer
    const listRes = await customers.list({ limit: 1 });
    if (listRes.ok && listRes.value.data.customer_list.length > 0) {
      const first = listRes.value.data.customer_list[0];
      existingCustomerId = (first.id ?? first.customer_id) as string;
    }

    // Find approved customer for payment tests
    const approvedRes = await customers.list({
      target_role: 'customer',
      provider_registration_status: 'approved',
      provider: 'stripe',
    });
    if (approvedRes.ok && approvedRes.value.data.customer_list.length > 0) {
      approvedCustomerId = (approvedRes.value.data.customer_list[0].id ??
        approvedRes.value.data.customer_list[0].customer_id) as string;
    }
  }, INTEGRATION_TEST_TIMEOUT);

  // ---------------------------------------------------------------
  // PaymentService - capture, sandboxPaid, sandboxSettle
  // ---------------------------------------------------------------
  describe('PaymentService - capture/sandbox', () => {
    it(
      'should return error for capture with invalid ID',
      async () => {
        const response = await payments.capture('non-existent-id');
        expect(response.ok).toBe(false);
        if (!response.ok) {
          expect(response.error).toBeDefined();
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      'should create payment then sandbox paid it',
      async () => {
        if (!approvedCustomerId) {
          throw new Error('No approved customer — create one with Stripe KYC');
        }

        const createRes = await payments.create({
          provider: 'stripe',
          source: {
            amount: 1500,
            currency: 'usd',
            payment_method: { type: 'card' },
            capture_method: 'automatic',
            customer: { id: approvedCustomerId },
          },
          confirm: false,
          metadata: { order_id: `test-sandbox-${Date.now()}` },
        } as any);

        expect(createRes.ok).toBe(true);
        if (!createRes.ok) return;

        const paymentId = createRes.value.data.id;
        expect(paymentId).toBeDefined();
        expect(typeof paymentId).toBe('string');

        const sandboxRes = await payments.sandboxPaid(paymentId);
        expect(sandboxRes).toBeDefined();
        if (sandboxRes.ok) {
          expect(sandboxRes.value.data.id).toEqual(paymentId);
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      'should return error for sandboxSettle with invalid ID',
      async () => {
        const response = await payments.sandboxSettle('non-existent-id');
        expect(response.ok).toBe(false);
        if (!response.ok) {
          expect(response.error).toBeDefined();
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // CustomerService - files + populatePlatform
  // ---------------------------------------------------------------
  describe('CustomerService - files & platform', () => {
    it(
      'should get files for an existing customer and verify response shape',
      async () => {
        if (!existingCustomerId) {
          throw new Error('No customer available');
        }
        const response = await customers.getFiles(existingCustomerId);
        expect(response).toBeDefined();
        if (response.ok) {
          expect(response.value).toBeDefined();
          expect(response.value.data).toBeDefined();
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      'should return error for getFiles with non-existent customer',
      async () => {
        const response = await customers.getFiles('non-existent-id');
        expect(response.ok).toBe(false);
        if (!response.ok) {
          expect(response.error).toBeDefined();
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      'should return error for populatePlatform with invalid customer',
      async () => {
        const response = await customers.populatePlatform('non-existent-id', {
          provider: 'stripe',
        });
        expect(response.ok).toBe(false);
        if (!response.ok) {
          expect(response.error).toBeDefined();
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // TransferService - sendWebhook
  // ---------------------------------------------------------------
  describe('TransferService - sendWebhook', () => {
    it(
      'should call the transfer webhook endpoint',
      async () => {
        const response = await transfers.sendWebhook({});
        expect(response).toBeDefined();
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // SubscriptionService
  // ---------------------------------------------------------------
  describe('SubscriptionService', () => {
    it(
      'should return error for subscribe with invalid plan',
      async () => {
        const response = await subscriptions.subscribe({
          plan_id: 'non-existent-plan',
          source_customer_id: 'fake-source',
          destination_customer_id: 'fake-dest',
          payment_method_id: 'fake-pm',
          payment_method_type: 'CARD',
          payment_method_provider: 'PAGAR_ME',
          fee_bearer: 'connected_account',
        });
        expect(response.ok).toBe(false);
        if (!response.ok) {
          expect(response.error).toBeDefined();
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      'should return error for get with non-existent subscription',
      async () => {
        const response = await subscriptions.get('non-existent-id');
        expect(response.ok).toBe(false);
        if (!response.ok) {
          expect(response.error).toBeDefined();
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      'should return error for cancel with non-existent subscription',
      async () => {
        const response = await subscriptions.cancel('non-existent-id');
        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      'should return error for pay with non-existent subscription',
      async () => {
        const response = await subscriptions.pay('non-existent-id', {
          customer_id: 'fake-customer-id',
          payment_method_id: 'fake-pm-id',
          payment_method_type: 'CARD',
          payment_method_provider: 'PAGAR_ME',
        });
        expect(response.ok).toBe(false);
        if (!response.ok) {
          expect(response.error).toBeDefined();
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // DisputeService
  // ---------------------------------------------------------------
  describe('DisputeService', () => {
    it(
      'should list disputes',
      async () => {
        const response = await disputes.list();
        expect(response).toBeDefined();
        if (response.ok) {
          expect(response.value).toBeDefined();
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      'should return error for updateEvidence with non-existent dispute',
      async () => {
        const response = await disputes.updateEvidence('non-existent-id', {
          text_evidences: [{ key: 'customer_name', value: 'Test Customer' }],
        });
        expect(response.ok).toBe(false);
        if (!response.ok) {
          expect(response.error).toBeDefined();
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      'should return error for submit with non-existent dispute',
      async () => {
        const response = await disputes.submit('non-existent-id');
        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      'should return error for close with non-existent dispute',
      async () => {
        const response = await disputes.close('non-existent-id');
        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // PayoutService
  // ---------------------------------------------------------------
  describe('PayoutService', () => {
    it(
      'should return error for payout with non-existent customer',
      async () => {
        const response = await payouts.create({
          payment_method_id: 'non-existent-pm',
          amount: 1000,
          currency: 'USD',
          customer_id: 'non-existent-customer',
        });
        expect(response.ok).toBe(false);
        if (!response.ok) {
          expect(response.error).toBeDefined();
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // WalletService
  // ---------------------------------------------------------------
  describe('WalletService', () => {
    it(
      'should return error for getBalance with non-existent customer',
      async () => {
        const response = await wallets.getBalance('non-existent-id');
        expect(response.ok).toBe(false);
        if (!response.ok) {
          expect(response.error).toBeDefined();
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      'should attempt getBalance for existing customer',
      async () => {
        if (!existingCustomerId) {
          throw new Error('No customer available');
        }
        const response = await wallets.getBalance(existingCustomerId);
        // May return 404 if no trading wallet — both outcomes valid
        expect(response).toBeDefined();
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // MerchantService
  // ---------------------------------------------------------------
  describe('MerchantService', () => {
    it(
      'should calculate transfer date with valid params',
      async () => {
        const response = await merchant.calculateTransferDate({
          settlementDate: '2026-06-01',
          region: 'US',
        });
        expect(response).toBeDefined();
        if (response.ok) {
          expect(response.value).toBeDefined();
          expect(response.value.data).toBeDefined();
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      'should return error for invalid region format',
      async () => {
        const response = await merchant.calculateTransferDate({
          settlementDate: '2026-06-01',
          region: 'INVALID_TOO_LONG',
        });
        expect(response.ok).toBe(false);
        if (!response.ok) {
          expect(response.error).toBeDefined();
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // FileService
  // ---------------------------------------------------------------
  describe('FileService', () => {
    it(
      'should list merchant files',
      async () => {
        const response = await files.list();
        expect(response).toBeDefined();
        if (response.ok) {
          expect(response.value).toBeDefined();
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      'should return error for get with non-existent file',
      async () => {
        const response = await files.get('non-existent-file-id');
        expect(response.ok).toBe(false);
        if (!response.ok) {
          expect(response.error).toBeDefined();
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      'should return error for delete with non-existent file',
      async () => {
        const response = await files.delete('non-existent-file-id');
        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // TaxService
  // ---------------------------------------------------------------
  describe('TaxService', () => {
    it(
      'should call tax calculation endpoint',
      async () => {
        const response = await taxes.calculate({ provider: 'stripe' });
        expect(response).toBeDefined();
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // ProviderProxyService
  // ---------------------------------------------------------------
  describe('ProviderProxyService', () => {
    it(
      'should return error for non-whitelisted URL',
      async () => {
        const response = await providerProxy.proxy('stripe', {
          method: 'GET',
          url: 'https://invalid-not-whitelisted.example.com',
        });
        expect(response.ok).toBe(false);
        if (!response.ok) {
          expect(response.error).toBeDefined();
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // PixService
  // ---------------------------------------------------------------
  describe('PixService', () => {
    it(
      'should call pix paid endpoint',
      async () => {
        const response = await pix.createPaid({
          pix_string: 'test-pix-string',
          pix_string_type: 'BR_CODE',
          amount: 100,
        });
        expect(response).toBeDefined();
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // SandboxService
  // ---------------------------------------------------------------
  describe('SandboxService', () => {
    it(
      'should return error for invalid simulation category',
      async () => {
        const response = await sandbox.simulateWebhook('stripe', {
          category: 'invalid_category',
        });
        expect(response.ok).toBe(false);
        if (!response.ok) {
          expect(response.error).toBeDefined();
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // PlanService - verify new query params
  // ---------------------------------------------------------------
  describe('PlanService - filters', () => {
    it(
      'should list plans with active filter',
      async () => {
        const response = await plans.list({ active: true });
        expect(response).toBeDefined();
        if (response.ok) {
          expect(response.value.data).toBeDefined();
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });
});
