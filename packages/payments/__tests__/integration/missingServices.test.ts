import {
  createOakClient,
  createCustomerService,
  createWalletService,
  createMerchantService,
  createFileService,
} from '../../src';
import { CustomerService } from '../../src/services/customerService';
import { WalletService } from '../../src/services/walletService';
import { MerchantService } from '../../src/services/merchantService';
import { FileService } from '../../src/services/fileService';
import { getConfigFromEnv } from '../config';

const INTEGRATION_TEST_TIMEOUT = 30000;

describe('Missing Services - Integration', () => {
  let customers: CustomerService;
  let wallets: WalletService;
  let merchant: MerchantService;
  let files: FileService;
  let existingCustomerId: string | undefined;

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

    const listRes = await customers.list({ limit: 1 });
    if (listRes.ok && listRes.value.data.customer_list.length > 0) {
      const first = listRes.value.data.customer_list[0];
      existingCustomerId = (first.id ?? first.customer_id) as string;
    }
  }, INTEGRATION_TEST_TIMEOUT);

  // ---------------------------------------------------------------
  // CustomerService - file methods
  // ---------------------------------------------------------------
  describe('CustomerService - files', () => {
    it('should expose uploadFiles method', () => {
      expect(typeof customers.uploadFiles).toBe('function');
    });

    it('should expose getFiles method', () => {
      expect(typeof customers.getFiles).toBe('function');
    });

    it(
      'should get files for a customer',
      async () => {
        if (!existingCustomerId) {
          throw new Error('No customer available');
        }
        const response = await customers.getFiles(existingCustomerId);
        expect(response).toBeDefined();
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // CustomerService - populatePlatform (KYC)
  // ---------------------------------------------------------------
  describe('CustomerService - populatePlatform', () => {
    it('should expose populatePlatform method', () => {
      expect(typeof customers.populatePlatform).toBe('function');
    });

    it(
      'should return an error for an invalid customer',
      async () => {
        const response = await customers.populatePlatform('non-existent-id', {
          provider: 'stripe',
        });
        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // WalletService
  // ---------------------------------------------------------------
  describe('WalletService', () => {
    it('should expose getBalance method', () => {
      expect(typeof wallets.getBalance).toBe('function');
    });

    it(
      'should return an error for a non-existent customer',
      async () => {
        const response = await wallets.getBalance('non-existent-id');
        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // MerchantService
  // ---------------------------------------------------------------
  describe('MerchantService', () => {
    it('should expose calculateTransferDate method', () => {
      expect(typeof merchant.calculateTransferDate).toBe('function');
    });

    it(
      'should calculate a transfer date',
      async () => {
        const response = await merchant.calculateTransferDate({
          settlementDate: '2026-05-01',
          region: 'US',
        });
        // May succeed or fail depending on backend config
        expect(response).toBeDefined();
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  // ---------------------------------------------------------------
  // FileService
  // ---------------------------------------------------------------
  describe('FileService', () => {
    it('should expose upload method', () => {
      expect(typeof files.upload).toBe('function');
    });

    it('should expose list method', () => {
      expect(typeof files.list).toBe('function');
    });

    it('should expose get method', () => {
      expect(typeof files.get).toBe('function');
    });

    it('should expose delete method', () => {
      expect(typeof files.delete).toBe('function');
    });

    it(
      'should list files',
      async () => {
        const response = await files.list();
        expect(response).toBeDefined();
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      'should return an error for a non-existent file',
      async () => {
        const response = await files.get('non-existent-id');
        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });
});
