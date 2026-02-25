import { createOakClient, Payment } from '../../src';
import { Crowdsplit } from '../../src/products/crowdsplit';
import { ApiError } from '../../src/utils/errorHandler';
import { getConfigFromEnv } from '../config';

const INTEGRATION_TEST_TIMEOUT = 30000;

/**
 * Build a PagarMe PIX payment request.
 *
 * NOTE: capture_method is NOT allowed for PagarMe PIX (API returns 422).
 */
const buildPagarMePixPaymentRequest = (
  customerId: string,
  confirm = false,
): Payment.Request =>
  ({
    provider: 'pagar_me',
    source: {
      amount: 100,
      currency: 'brl',
      customer: { id: customerId },
      payment_method: { type: 'pix', expiry_date: '2030-01-01' },
    },
    confirm,
  }) as unknown as Payment.Request;

/**
 * Build a Stripe card payment request.
 *
 * capture_method: 'automatic' is REQUIRED for Stripe.
 */
const buildStripePaymentRequest = (
  customerId: string,
  confirm = false,
): Payment.Request => {
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
  return request as unknown as Payment.Request;
};

describe('PaymentService - Integration', () => {
  let payments: ReturnType<typeof Crowdsplit>['payments'];
  let customers: ReturnType<typeof Crowdsplit>['customers'];

  /** A KYC-approved customer ID fetched via filtered customer list. */
  let approvedCustomerId: string | undefined;

  beforeAll(() => {
    const client = createOakClient({
      ...getConfigFromEnv(),
      retryOptions: {
        maxNumberOfRetries: 2,
        delay: 500,
        backoffFactor: 2,
      },
    });
    const cs = Crowdsplit(client);
    customers = cs.customers;
    payments = cs.payments;
  });

  // ---------------------------------------------------------------
  // Find an approved customer using filtered list
  // ---------------------------------------------------------------
  it(
    'should find a Stripe-approved customer from the database',
    async () => {
      const listRes = await customers.list({
        target_role: 'customer',
        provider_registration_status: 'approved',
        provider: 'stripe',
      });

      expect(listRes.ok).toBe(true);
      if (listRes.ok && listRes.value.data.customer_list.length === 0) {
        console.warn('Skipping: no Stripe-approved customers found');
        return;
      }
      if (listRes.ok) {
        expect(listRes.value.data.customer_list.length).toBeGreaterThan(0);
        approvedCustomerId = (listRes.value.data.customer_list[0].id ??
          listRes.value.data.customer_list[0].customer_id) as string;
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  // ---------------------------------------------------------------
  // Payment creation
  // ---------------------------------------------------------------
  it(
    'should create a payment with a valid customer',
    async () => {
      if (!approvedCustomerId) {
        console.warn('Skipping: no approved customer available');
        return;
      }

      const response = await payments.create(
        buildStripePaymentRequest(approvedCustomerId, false),
      );

      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(response.value.data.id).toBeDefined();
        expect(response.value.data.provider).toBeDefined();
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    'should return an error for an invalid customer',
    async () => {
      const response = await payments.create(
        buildPagarMePixPaymentRequest('non-existent-id'),
      );
      expect(response.ok).toBe(false);
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  // ---------------------------------------------------------------
  // Customer retrieval
  // ---------------------------------------------------------------
  it(
    'should validate that an invalid customer ID returns an error',
    async () => {
      const response = await customers.get('invalid-customer-id-123');
      expect(response.ok).toBe(false);
      if (!response.ok) {
        expect(response.error).toBeDefined();
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    'should validate that the approved customer ID is valid',
    async () => {
      if (!approvedCustomerId) {
        console.warn('Skipping: no approved customer available');
        return;
      }

      const response = await customers.get(approvedCustomerId);
      expect(response.ok).toBe(true);
      if (response.ok) {
        const id = response.value.data.id ?? response.value.data.customer_id;
        expect(id).toEqual(approvedCustomerId);
        expect(response.value.data).toBeDefined();
        expect(response.value.data.email).toBeDefined();
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  // ---------------------------------------------------------------
  // Payment confirmation
  // ---------------------------------------------------------------
  it(
    'should confirm a payment with a valid ID',
    async () => {
      if (!approvedCustomerId) {
        console.warn('Skipping: no approved customer available');
        return;
      }

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
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    'should return an error for an invalid confirm ID',
    async () => {
      const response = await payments.confirm('non-existent-id');
      expect(response.ok).toBe(false);
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  // ---------------------------------------------------------------
  // Payment cancellation
  // ---------------------------------------------------------------
  it(
    'should cancel a payment with a valid ID',
    async () => {
      if (!approvedCustomerId) {
        console.warn('Skipping: no approved customer available');
        return;
      }

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
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    'should return an error for an invalid cancel ID',
    async () => {
      const response = await payments.cancel('non-existent-id');
      expect(response.ok).toBe(false);
    },
    INTEGRATION_TEST_TIMEOUT,
  );
});
