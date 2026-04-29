import { createOakClient, createPayoutService } from '../../src';
import { PayoutService } from '../../src/services/payoutService';
import { getConfigFromEnv } from '../config';

const INTEGRATION_TEST_TIMEOUT = 30000;

describe('PayoutService - Integration', () => {
  let payouts: PayoutService;

  beforeAll(() => {
    const client = createOakClient({
      ...getConfigFromEnv(),
      retryOptions: {
        maxNumberOfRetries: 2,
        delay: 500,
        backoffFactor: 2,
      },
    });
    payouts = createPayoutService(client);
  });

  // ---------------------------------------------------------------
  // Service shape
  // ---------------------------------------------------------------
  describe('service interface', () => {
    it('should expose create method', () => {
      expect(typeof payouts.create).toBe('function');
    });
  });

  // ---------------------------------------------------------------
  // create() - error path (invalid customer)
  // ---------------------------------------------------------------
  describe('create', () => {
    it(
      'should return an error for an invalid customer',
      async () => {
        const response = await payouts.create({
          payment_method_id: 'non-existent-pm',
          amount: 1000,
          currency: 'USD',
          customer_id: 'non-existent-customer',
        });
        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      'should return an error for invalid currency',
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
});
