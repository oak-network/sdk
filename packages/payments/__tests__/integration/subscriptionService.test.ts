import {
  createOakClient,
  createSubscriptionService,
  createPlanService,
} from '../../src';
import { SubscriptionService } from '../../src/services/subscriptionService';
import { PlanService } from '../../src/services/planService';
import { getConfigFromEnv } from '../config';

const INTEGRATION_TEST_TIMEOUT = 30000;

describe('SubscriptionService - Integration', () => {
  let subscriptions: SubscriptionService;
  let plans: PlanService;

  /** Plan hash_id created during setup. */
  let testPlanId: string | undefined;

  beforeAll(async () => {
    const client = createOakClient({
      ...getConfigFromEnv(),
      retryOptions: {
        maxNumberOfRetries: 2,
        delay: 500,
        backoffFactor: 2,
      },
    });
    subscriptions = createSubscriptionService(client);
    plans = createPlanService(client);

    // Try to get an existing plan, or note that none exist
    const listRes = await plans.list({ per_page: 1 });
    if (listRes.ok && listRes.value.data.data.length > 0) {
      testPlanId = listRes.value.data.data[0].hash_id;
    }
  }, INTEGRATION_TEST_TIMEOUT);

  // ---------------------------------------------------------------
  // Service shape
  // ---------------------------------------------------------------
  describe('service interface', () => {
    it('should expose subscribe method', () => {
      expect(typeof subscriptions.subscribe).toBe('function');
    });

    it('should expose cancel method', () => {
      expect(typeof subscriptions.cancel).toBe('function');
    });

    it('should expose list method', () => {
      expect(typeof subscriptions.list).toBe('function');
    });

    it('should expose get method', () => {
      expect(typeof subscriptions.get).toBe('function');
    });

    it('should expose pay method', () => {
      expect(typeof subscriptions.pay).toBe('function');
    });
  });

  // ---------------------------------------------------------------
  // get() - error path
  // ---------------------------------------------------------------
  describe('get', () => {
    it(
      'should return an error for a non-existent subscription',
      async () => {
        const response = await subscriptions.get('non-existent-id');
        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // cancel() - error path
  // ---------------------------------------------------------------
  describe('cancel', () => {
    it(
      'should return an error for a non-existent subscription',
      async () => {
        const response = await subscriptions.cancel('non-existent-id');
        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // pay() - error path
  // ---------------------------------------------------------------
  describe('pay', () => {
    it(
      'should return an error for a non-existent subscription',
      async () => {
        const response = await subscriptions.pay('non-existent-id', {
          customer_id: 'fake-customer-id',
          payment_method_id: 'fake-pm-id',
          payment_method_type: 'CARD',
          payment_method_provider: 'PAGAR_ME',
        });
        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // subscribe() - error path (invalid plan)
  // ---------------------------------------------------------------
  describe('subscribe', () => {
    it(
      'should return an error for an invalid plan',
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
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });
});
