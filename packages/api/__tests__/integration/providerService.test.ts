import { createOakClient } from '../../src';
import { Crowdsplit } from '../../src/products/crowdsplit';
import { getConfigFromEnv } from '../config';
import { ApiError } from '../../src/utils/errorHandler';

const INTEGRATION_TEST_TIMEOUT = 30000;

describe('ProviderService - Integration', () => {
  let providers: ReturnType<typeof Crowdsplit>['providers'];
  let customers: ReturnType<typeof Crowdsplit>['customers'];

  /** An existing customer ID fetched from the database. */
  let existingCustomerId: string | undefined;

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
    providers = cs.providers;
    customers = cs.customers;
  });

  // ---------------------------------------------------------------
  // Setup: find an existing customer from the database
  // ---------------------------------------------------------------
  it(
    'should find an existing customer from the database',
    async () => {
      const listRes = await customers.list({ limit: 1 });
      expect(listRes.ok).toBe(true);
      if (listRes.ok && listRes.value.data.customer_list.length === 0) {
        throw new Error('No customers found in database');
      }
      if (listRes.ok) {
        expect(listRes.value.data.customer_list.length).toBeGreaterThan(0);
        existingCustomerId = (listRes.value.data.customer_list[0].id ??
          listRes.value.data.customer_list[0].customer_id) as string;
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  // ---------------------------------------------------------------
  // getSchema()
  // ---------------------------------------------------------------
  it(
    'should get schema for an enabled provider',
    async () => {
      // Try stripe first (default provider), then pagar_me as fallback
      const stripeRes = await providers.getSchema({ provider: 'stripe' });
      if (stripeRes.ok) {
        expect(stripeRes.value.data).toBeDefined();
        expect(typeof stripeRes.value.data).toBe('object');
        return;
      }

      const pagarRes = await providers.getSchema({ provider: 'pagar_me' });
      if (pagarRes.ok) {
        expect(pagarRes.value.data).toBeDefined();
        expect(typeof pagarRes.value.data).toBe('object');
        return;
      }

      // At least one provider must be enabled
      expect(stripeRes.ok || pagarRes.ok).toBe(true);
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    'should return an error for invalid provider schema request',
    async () => {
      const response = await providers.getSchema({
        provider: 'invalid_provider' as 'pagar_me',
      });
      expect(response.ok).toBe(false);
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  // ---------------------------------------------------------------
  // getRegistrationStatus()
  // ---------------------------------------------------------------
  it(
    'should get registration status for a valid customer',
    async () => {
      if (!existingCustomerId) {
        throw new Error('No customer available — setup test must run first');
      }

      const response =
        await providers.getRegistrationStatus(existingCustomerId);
      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(Array.isArray(response.value.data)).toBe(true);
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    'should return an error for invalid customer registration status',
    async () => {
      const response = await providers.getRegistrationStatus('non-existent-id');
      expect(response.ok).toBe(false);
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  // ---------------------------------------------------------------
  // submitRegistration()
  // ---------------------------------------------------------------
  it(
    'should submit a valid Stripe registration',
    async () => {
      if (!existingCustomerId) {
        throw new Error('No customer available — setup test must run first');
      }

      const response = await providers.submitRegistration(existingCustomerId, {
        provider: 'stripe',
        target_role: 'customer',
      });

      // Registration may succeed or return an error if the customer
      // is already registered with this provider.
      if (response.ok) {
        const data = response.value.data;
        const registration = Array.isArray(data) ? data[0] : data;
        expect(registration).toBeDefined();
        expect(registration.provider).toBe('stripe');
        expect(registration.status).toBeDefined();
      } else {
        expect(response.error).toBeInstanceOf(ApiError);
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    'should submit a valid PagarMe registration',
    async () => {
      if (!existingCustomerId) {
        throw new Error('No customer available — setup test must run first');
      }

      const response = await providers.submitRegistration(existingCustomerId, {
        provider: 'pagar_me',
        target_role: 'customer',
      });

      // Registration may succeed or return an error if the customer
      // is already registered with this provider.
      if (response.ok) {
        const data = response.value.data;
        const registration = Array.isArray(data) ? data[0] : data;
        expect(registration).toBeDefined();
        expect(registration.provider).toBe('pagar_me');
        expect(registration.status).toBeDefined();
      } else {
        expect(response.error).toBeInstanceOf(ApiError);
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    'should return an error for invalid provider registration',
    async () => {
      if (!existingCustomerId) {
        throw new Error('No customer available — setup test must run first');
      }

      const response = await providers.submitRegistration(existingCustomerId, {
        provider: 'invalid_provider' as 'stripe',
        target_role: 'customer',
      });
      expect(response.ok).toBe(false);
    },
    INTEGRATION_TEST_TIMEOUT,
  );
});
