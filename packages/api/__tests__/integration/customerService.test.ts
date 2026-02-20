import { createOakClient } from "../../src";
import { Crowdsplit } from "../../src/products/crowdsplit";
import { getConfigFromEnv } from "../config";

const INTEGRATION_TEST_TIMEOUT = 30000;

describe("CustomerService - Integration", () => {
  let customers: ReturnType<typeof Crowdsplit>["customers"];

  beforeAll(() => {
    const client = createOakClient({
      ...getConfigFromEnv(),
      retryOptions: {
        maxNumberOfRetries: 2,
        delay: 500,
        backoffFactor: 2,
      },
    });
    customers = Crowdsplit(client).customers;
  });

  let createdCustomerId: string | undefined;

  it(
    "should create a stripe customer",
    async () => {
      const timestamp = Date.now();
      const email = `test_${timestamp}@example.com`;
      const response = await customers.create({
        email,
        first_name: 'John',
        last_name: 'Doe',
        document_type: 'personal_tax_id',
        document_number: `${timestamp}`.padStart(11, '0').substring(0, 11),
      });
      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(response.value.data.id).toBeDefined();
        expect(response.value.data.email).toEqual(email);
        createdCustomerId = response.value.data.id as string;
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    "should create a stripe connected account",
    async () => {
      const timestamp = Date.now();
      const email = `test_${timestamp}@example.com`;
      const country_code = "US";
      const response = await customers.create({
        email,
        country_code,
        first_name: 'Jane',
        last_name: 'Smith',
        document_type: 'personal_tax_id',
        document_number: `${timestamp + 1}`.padStart(11, '0').substring(0, 11),
      });
      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(response.value.data.id).toBeDefined();
        expect(response.value.data.email).toEqual(email);
        expect(response.value.data.country_code).toEqual(
          country_code.toLowerCase(),
        );
        createdCustomerId = response.value.data.id as string;
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    "should get the created customer",
    async () => {
      if (!createdCustomerId) {
        console.warn(
          "Skipping: createdCustomerId not available from previous test",
        );
        return;
      }
      const response = await customers.get(createdCustomerId);
      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(response.value.data.id).toEqual(createdCustomerId);
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    "should update the customer",
    async () => {
      if (!createdCustomerId) {
        console.warn(
          "Skipping: createdCustomerId not available from previous test",
        );
        return;
      }
      const response = await customers.update(createdCustomerId, {
        first_name: "UpdatedName",
      });
      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(response.value.data.first_name).toEqual("UpdatedName");
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    "should list customers",
    async () => {
      const response = await customers.list({ limit: 5 });
      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(Array.isArray(response.value.data.customer_list)).toBe(true);
        expect(response.value.data.customer_list.length).toBeGreaterThan(0);
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    "should handle invalid customer ID gracefully",
    async () => {
      const response = await customers.get("non-existent-id");
      expect(response.ok).toBe(false);
    },
    INTEGRATION_TEST_TIMEOUT,
  );
});
