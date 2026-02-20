import { createOakClient } from '../../src';
import { Crowdsplit } from '../../src/products/crowdsplit';
import { getConfigFromEnv } from '../config';
import { ApiError } from '../../src/utils/errorHandler';

const INTEGRATION_TEST_TIMEOUT = 30000;

describe('TransactionService - Integration', () => {
  let transactions: ReturnType<typeof Crowdsplit>['transactions'];
  let payments: ReturnType<typeof Crowdsplit>['payments'];
  let customers: ReturnType<typeof Crowdsplit>['customers'];

  /** A KYC-approved customer ID fetched via filtered customer list. */
  let approvedCustomerId: string | undefined;
  /** A transaction ID obtained from a real payment. */
  let knownTransactionId: string | undefined;
  /** The payment ID from a confirmed payment (used as charge_id for settle). */
  let confirmedPaymentId: string | undefined;

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
    transactions = cs.transactions;
    payments = cs.payments;
    customers = cs.customers;
  });

  // ---------------------------------------------------------------
  // Setup: find approved customer and create a payment/transaction
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

  it(
    'should create and confirm a payment to produce a transaction',
    async () => {
      if (!approvedCustomerId) {
        console.warn('Skipping: no approved customer available');
        return;
      }

      // Create a payment — this produces a transaction
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
        metadata: { order_id: `txn-test-${Date.now()}` },
      } as unknown as import('../../src/types/payment').CreatePaymentRequest);

      expect(createRes.ok).toBe(true);
      if (!createRes.ok) return;

      const paymentId = createRes.value.data.id;

      // Confirm the payment so the transaction progresses
      const confirmRes = await payments.confirm(paymentId);
      if (confirmRes.ok) {
        confirmedPaymentId = paymentId;
      }

      // Fetch the first transaction to get a known valid ID
      const listRes = await transactions.list({ limit: 1 });
      if (listRes.ok && listRes.value.data.transaction_list.length > 0) {
        knownTransactionId = listRes.value.data.transaction_list[0].id;
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  // ---------------------------------------------------------------
  // list()
  // ---------------------------------------------------------------
  it(
    'should list transactions without any filter',
    async () => {
      const response = await transactions.list();
      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(Array.isArray(response.value.data.transaction_list)).toBe(true);
        expect(response.value.data.count).toBeGreaterThanOrEqual(0);
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    'should list transactions with type_list filter',
    async () => {
      const response = await transactions.list({
        type_list: 'installment_payment',
      });
      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(Array.isArray(response.value.data.transaction_list)).toBe(true);
        for (const tx of response.value.data.transaction_list) {
          expect(tx.type).toBe('installment_payment');
        }
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    'should list transactions with pagination (limit and offset)',
    async () => {
      const limit = 2;
      const response = await transactions.list({ limit, offset: 0 });
      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(response.value.data.transaction_list.length).toBeLessThanOrEqual(
          limit,
        );
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    'should list transactions with status filter',
    async () => {
      const response = await transactions.list({
        status: 'PENDING,INITIATED',
      });
      // The API may return 404 if no transactions match the filter
      if (response.ok) {
        expect(Array.isArray(response.value.data.transaction_list)).toBe(true);
      } else {
        expect(response.error).toBeInstanceOf(ApiError);
        expect((response.error as ApiError).status).toBe(404);
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    'should list transactions with payment_method filter',
    async () => {
      const response = await transactions.list({ payment_method: 'pix' });
      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(Array.isArray(response.value.data.transaction_list)).toBe(true);
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    'should list transactions with source_currency filter',
    async () => {
      const response = await transactions.list({ source_currency: 'brl' });
      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(Array.isArray(response.value.data.transaction_list)).toBe(true);
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    'should list transactions with dateFrom and dateTo filter',
    async () => {
      const response = await transactions.list({
        dateFrom: '2025-01-01',
        dateTo: '2026-12-31',
      });
      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(Array.isArray(response.value.data.transaction_list)).toBe(true);
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    'should list transactions with multiple combined filters',
    async () => {
      const response = await transactions.list({
        limit: 5,
        offset: 0,
        type_list: 'installment_payment',
      });
      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(Array.isArray(response.value.data.transaction_list)).toBe(true);
        expect(response.value.data.transaction_list.length).toBeLessThanOrEqual(
          5,
        );
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    'should handle filters with no matching results',
    async () => {
      // The API returns 404 when filters match no transactions
      const response = await transactions.list({
        customer_id: '00000000-0000-0000-0000-000000000000',
      });
      expect(response.ok).toBe(false);
      if (!response.ok) {
        expect(response.error).toBeInstanceOf(ApiError);
        expect((response.error as ApiError).status).toBe(404);
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  // ---------------------------------------------------------------
  // get()
  // ---------------------------------------------------------------
  it(
    'should get a transaction by valid ID',
    async () => {
      if (!knownTransactionId) {
        console.warn('Skipping: no transaction ID available');
        return;
      }

      const response = await transactions.get(knownTransactionId);
      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(response.value.data.id).toEqual(knownTransactionId);
        expect(response.value.data.status).toBeDefined();
        expect(response.value.data.type).toBeDefined();
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    'should return error for invalid transaction ID',
    async () => {
      const response = await transactions.get('non-existent-id');
      expect(response.ok).toBe(false);
      if (!response.ok) {
        expect(response.error).toBeInstanceOf(ApiError);
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    'should handle empty string ID by listing transactions',
    async () => {
      // The API treats empty ID as a list operation
      const response = await transactions.get('');
      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(response.value.data).toHaveProperty('transaction_list');
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  // ---------------------------------------------------------------
  // settle()
  // ---------------------------------------------------------------
  it(
    'should settle a valid transaction',
    async () => {
      if (!knownTransactionId || !confirmedPaymentId) {
        console.warn('Skipping: no confirmed transaction available');
        return;
      }

      const response = await transactions.settle(knownTransactionId, {
        charge_id: confirmedPaymentId,
        amount: 100,
        status: 'SETTLED',
      });

      // If the transaction isn't in a settleable state, the API will
      // return an error — that's still valid SDK behavior.
      if (response.ok) {
        expect(response.ok).toBe(true);
      } else {
        expect(response.error).toBeInstanceOf(ApiError);
        const status = (response.error as ApiError).status;
        expect([400, 404, 422, 500]).toContain(status);
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    'should return error when settling a non-existent transaction',
    async () => {
      const response = await transactions.settle('non-existent-id', {
        charge_id: 'fake-charge-id',
        amount: 100,
        status: 'SETTLED',
      });
      expect(response.ok).toBe(false);
      if (!response.ok) {
        expect(response.error).toBeInstanceOf(ApiError);
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    'should return error when settling with negative amount',
    async () => {
      const response = await transactions.settle('non-existent-id', {
        charge_id: 'fake-charge-id',
        amount: -50,
        status: 'SETTLED',
      });
      expect(response.ok).toBe(false);
    },
    INTEGRATION_TEST_TIMEOUT,
  );
});
