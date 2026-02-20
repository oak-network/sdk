import { createOakClient } from '../../src';
import { Crowdsplit } from '../../src/products/crowdsplit';
import type { CreatePaymentRequest } from '../../src/types/payment';
import { ApiError } from '../../src/utils/errorHandler';
import { getConfigFromEnv } from '../config';

/**
 * Build a PagarMe PIX payment request.
 *
 * NOTE: capture_method is NOT allowed for PagarMe PIX (API returns 422).
 */
const buildPagarMePixPaymentRequest = (
  customerId: string,
  confirm = false,
): CreatePaymentRequest =>
  ({
    provider: 'pagar_me',
    source: {
      amount: 100,
      currency: 'brl',
      customer: { id: customerId },
      payment_method: { type: 'pix', expiry_date: '2030-01-01' },
    },
    confirm,
  }) as unknown as CreatePaymentRequest;

/**
 * Build a Stripe card payment request.
 *
 * capture_method is REQUIRED for Stripe (API returns 422 without it).
 */
const buildStripePaymentRequest = (
  customerId: string,
  confirm = false,
): CreatePaymentRequest => {
  const request: Record<string, unknown> = {
    provider: 'stripe',
    source: {
      amount: 1500,
      currency: 'usd',
      payment_method: { type: 'card' },
      capture_method: 'automatic',
      customer: { id: customerId },
    },
    confirm,
    metadata: {
      order_id: `test-${Date.now()}`,
      customer_email: 'integration-test@example.com',
    },
  };
  return request as unknown as CreatePaymentRequest;
};

describe('PaymentService - Integration', () => {
  let payments: ReturnType<typeof Crowdsplit>['payments'];
  let customers: ReturnType<typeof Crowdsplit>['customers'];
  let providers: ReturnType<typeof Crowdsplit>['providers'];

  /** An already-approved customer ID fetched from the database. */
  let approvedCustomerId: string;
  let hasApprovedCustomer = false;
  let setupFailureReason = '';

  beforeAll(async () => {
    const client = createOakClient({
      ...getConfigFromEnv(),
      retryOptions: {
        maxNumberOfRetries: 1,
        delay: 200,
        backoffFactor: 2,
      },
    });
    const cs = Crowdsplit(client);
    customers = cs.customers;
    payments = cs.payments;
    providers = cs.providers;

    // Fetch existing customers from the database and find one that
    // is already approved for a provider (KYC requires the UI, so
    // we cannot create+approve customers programmatically).
    const listRes = await customers.list({ limit: 50 });
    if (!listRes.ok) {
      setupFailureReason = `Failed to list customers: ${listRes.error instanceof ApiError ? listRes.error.message : 'Unknown error'}`;
      return;
    }

    const customerList = listRes.value.data.customer_list;
    if (customerList.length === 0) {
      setupFailureReason = 'No customers found in the database.';
      return;
    }

    // Check each customer's provider registration status to find
    // one that has been approved.
    for (const customer of customerList) {
      const id = (customer.id ?? customer.customer_id) as string;
      if (!id) continue;

      const statusRes = await providers.getRegistrationStatus(id);
      if (!statusRes.ok) continue;

      const registrations = statusRes.value.data;
      const approved =
        Array.isArray(registrations) &&
        registrations.some((r) => r.status?.toLowerCase() === 'approved');

      if (approved) {
        approvedCustomerId = id;
        hasApprovedCustomer = true;
        break;
      }
    }

    if (!hasApprovedCustomer) {
      setupFailureReason =
        'No approved customer found. KYC must be completed in the UI before running these tests.';
    }
  }, 30_000);

  /**
   * Asserts the test has an approved customer, otherwise fails with
   * a clear message.
   */
  const requireApprovedCustomer = () => {
    if (!hasApprovedCustomer) {
      throw new Error(`Test cannot run: ${setupFailureReason}`);
    }
  };

  // ---------------------------------------------------------------
  // Payment creation tests
  // ---------------------------------------------------------------
  it('should create a payment with a valid customer', async () => {
    requireApprovedCustomer();

    const response = await payments.create(
      buildStripePaymentRequest(approvedCustomerId, false),
    );

    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.value.data.id).toBeDefined();
      expect(response.value.data.provider).toBeDefined();
    }
  });

  it('should return an error for an invalid customer', async () => {
    const response = await payments.create(
      buildPagarMePixPaymentRequest('non-existent-id'),
    );
    expect(response.ok).toBe(false);
  });

  // ---------------------------------------------------------------
  // Customer validation tests
  // ---------------------------------------------------------------
  it('should validate that an invalid client ID returns an error', async () => {
    const invalidCustomerId = 'invalid-customer-id-123';
    const customerResponse = await customers.get(invalidCustomerId);
    expect(customerResponse.ok).toBe(false);
    if (!customerResponse.ok) {
      expect(customerResponse.error).toBeDefined();
    }
  });

  it('should validate that the client of the client ID is valid', async () => {
    requireApprovedCustomer();

    const customerResponse = await customers.get(approvedCustomerId);
    expect(customerResponse.ok).toBe(true);
    if (customerResponse.ok) {
      const id =
        customerResponse.value.data.id ??
        customerResponse.value.data.customer_id;
      expect(id).toEqual(approvedCustomerId);
      expect(customerResponse.value.data).toBeDefined();
      expect(customerResponse.value.data.email).toBeDefined();
    }
  });

  // ---------------------------------------------------------------
  // Payment confirm tests
  // ---------------------------------------------------------------
  it('should confirm a payment with a valid ID', async () => {
    requireApprovedCustomer();

    const createResponse = await payments.create(
      buildStripePaymentRequest(approvedCustomerId, false),
    );
    expect(createResponse.ok).toBe(true);
    if (!createResponse.ok) return;

    const paymentId = createResponse.value.data.id;
    const response = await payments.confirm(paymentId);
    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.value.data.id).toEqual(paymentId);
    }
  });

  it('should return an error for an invalid confirm ID', async () => {
    const response = await payments.confirm('non-existent-id');
    expect(response.ok).toBe(false);
  });

  // ---------------------------------------------------------------
  // Payment cancel tests
  // ---------------------------------------------------------------
  it('should cancel a payment with a valid ID', async () => {
    requireApprovedCustomer();

    const createResponse = await payments.create(
      buildStripePaymentRequest(approvedCustomerId, false),
    );
    expect(createResponse.ok).toBe(true);
    if (!createResponse.ok) return;

    const paymentId = createResponse.value.data.id;
    const response = await payments.cancel(paymentId);
    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.value.data.id).toEqual(paymentId);
    }
  });

  it('should return an error for an invalid cancel ID', async () => {
    const response = await payments.cancel('non-existent-id');
    expect(response.ok).toBe(false);
  });
});
