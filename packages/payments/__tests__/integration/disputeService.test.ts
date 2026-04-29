import { createOakClient, createDisputeService } from '../../src';
import { DisputeService } from '../../src/services/disputeService';
import { getConfigFromEnv, INTEGRATION_TEST_TIMEOUT } from '../config';

describe('DisputeService - Integration', () => {
  let disputes: DisputeService;

  beforeAll(() => {
    const client = createOakClient({
      ...getConfigFromEnv(),
      retryOptions: {
        maxNumberOfRetries: 2,
        delay: 500,
        backoffFactor: 2,
      },
    });
    disputes = createDisputeService(client);
  });

  // ---------------------------------------------------------------
  // Service shape
  // ---------------------------------------------------------------
  describe('service interface', () => {
    it('should expose list method', () => {
      expect(typeof disputes.list).toBe('function');
    });

    it('should expose updateEvidence method', () => {
      expect(typeof disputes.updateEvidence).toBe('function');
    });

    it('should expose submit method', () => {
      expect(typeof disputes.submit).toBe('function');
    });

    it('should expose close method', () => {
      expect(typeof disputes.close).toBe('function');
    });
  });

  // ---------------------------------------------------------------
  // list()
  // ---------------------------------------------------------------
  describe('list', () => {
    it(
      'should return a response when listing disputes',
      async () => {
        const response = await disputes.list();
        // May return empty list or data - both are valid
        expect(response).toBeDefined();
        if (response.ok) {
          expect(response.value).toBeDefined();
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // updateEvidence() - error path
  // ---------------------------------------------------------------
  describe('updateEvidence', () => {
    it(
      'should return an error for a non-existent dispute',
      async () => {
        const response = await disputes.updateEvidence('non-existent-id', {
          text_evidences: [
            { key: 'customer_name', value: 'Test Customer' },
          ],
        });
        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // submit() - error path
  // ---------------------------------------------------------------
  describe('submit', () => {
    it(
      'should return an error for a non-existent dispute',
      async () => {
        const response = await disputes.submit('non-existent-id');
        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // close() - error path
  // ---------------------------------------------------------------
  describe('close', () => {
    it(
      'should return an error for a non-existent dispute',
      async () => {
        const response = await disputes.close('non-existent-id');
        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });
});
