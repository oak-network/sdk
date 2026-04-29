import {
  createOakClient,
  createTaxService,
  createProviderProxyService,
  createPixService,
  createSandboxService,
  createTransferService,
} from '../../src';
import { TaxService } from '../../src/services/taxService';
import { ProviderProxyService } from '../../src/services/providerProxyService';
import { PixService } from '../../src/services/pixService';
import { SandboxService } from '../../src/services/sandboxService';
import { TransferService } from '../../src/services/transferService';
import { getConfigFromEnv } from '../config';

const INTEGRATION_TEST_TIMEOUT = 30000;

describe('Remaining Gaps - Integration', () => {
  let taxes: TaxService;
  let providerProxy: ProviderProxyService;
  let pix: PixService;
  let sandbox: SandboxService;
  let transfers: TransferService;

  beforeAll(() => {
    const client = createOakClient({
      ...getConfigFromEnv(),
      retryOptions: {
        maxNumberOfRetries: 2,
        delay: 500,
        backoffFactor: 2,
      },
    });
    taxes = createTaxService(client);
    providerProxy = createProviderProxyService(client);
    pix = createPixService(client);
    sandbox = createSandboxService(client);
    transfers = createTransferService(client);
  });

  // ---------------------------------------------------------------
  // Gap 6: TaxService
  // ---------------------------------------------------------------
  describe('TaxService', () => {
    it('should expose calculate method', () => {
      expect(typeof taxes.calculate).toBe('function');
    });

    it(
      'should call the tax calculation endpoint',
      async () => {
        const response = await taxes.calculate({
          provider: 'stripe',
        });
        expect(response).toBeDefined();
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // Gap 7: ProviderProxyService
  // ---------------------------------------------------------------
  describe('ProviderProxyService', () => {
    it('should expose proxy method', () => {
      expect(typeof providerProxy.proxy).toBe('function');
    });

    it(
      'should return an error for an invalid proxy request',
      async () => {
        const response = await providerProxy.proxy('stripe', {
          method: 'GET',
          url: 'https://invalid-url.example.com',
        });
        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // Gap 8: PixService
  // ---------------------------------------------------------------
  describe('PixService', () => {
    it('should expose createPaid method', () => {
      expect(typeof pix.createPaid).toBe('function');
    });

    it(
      'should call the pix paid endpoint',
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
  // Gap 9: SandboxService
  // ---------------------------------------------------------------
  describe('SandboxService', () => {
    it('should expose simulateWebhook method', () => {
      expect(typeof sandbox.simulateWebhook).toBe('function');
    });

    it(
      'should return an error for an invalid simulation',
      async () => {
        const response = await sandbox.simulateWebhook('stripe', {
          category: 'invalid_category',
        });
        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // Gap 10: TransferService.sendWebhook
  // ---------------------------------------------------------------
  describe('TransferService - sendWebhook', () => {
    it('should expose sendWebhook method', () => {
      expect(typeof transfers.sendWebhook).toBe('function');
    });

    it(
      'should return a response when sending a transfer webhook',
      async () => {
        const response = await transfers.sendWebhook({});
        expect(response).toBeDefined();
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });
});
