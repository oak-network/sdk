import { createOakClient } from "../../src";
import { Crowdsplit } from "../../src/products/crowdsplit";
import { getConfigFromEnv } from "../config";

const INTEGRATION_TEST_TIMEOUT = 30000;

describe("CustomerService - Integration", () => {
  let customers: ReturnType<typeof Crowdsplit>["customers"];
  /** Customer resolved from list so get/update tests don't depend on create succeeding. */
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
    customers = Crowdsplit(client).customers;

    const listResponse = await customers.list({ limit: 1 });
    if (listResponse.ok && listResponse.value.data.customer_list.length > 0) {
      const first = listResponse.value.data.customer_list[0];
      existingCustomerId = (first.id ?? first.customer_id) as string;
    }
  }, INTEGRATION_TEST_TIMEOUT);

  describe("create", () => {
    it(
      "should create a customer with email only",
      async () => {
        const email = `test_${Date.now()}@example.com`;
        const response = await customers.create({ email });

        expect(response.ok).toBe(true);
        if (response.ok) {
          expect(response.value.data.id ?? response.value.data.customer_id).toBeDefined();
          expect(response.value.data.email).toEqual(email);
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("get", () => {
    beforeAll(() => {
      if (!existingCustomerId) {
        throw new Error(
          "No customer in account — create one or ensure list returns at least one",
        );
      }
    });

    it(
      "should get a customer by ID",
      async () => {
        const response = await customers.get(existingCustomerId!);

        expect(response.ok).toBe(true);
        if (response.ok) {
          const id = response.value.data.id ?? response.value.data.customer_id;
          expect(id).toEqual(existingCustomerId);
          expect(response.value.data.email).toBeDefined();
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

  describe("update", () => {
    beforeAll(() => {
      if (!existingCustomerId) {
        throw new Error(
          "No customer in account — create one or ensure list returns at least one",
        );
      }
    });

    it(
      "should update a customer",
      async () => {
        const updatedEmail = `updated_${Date.now()}@example.com`;
        const response = await customers.update(existingCustomerId!, {
          email: updatedEmail,
        });

        expect(response.ok).toBe(true);
        if (response.ok) {
          expect(response.value.data.email).toEqual(updatedEmail);
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("list", () => {
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
  });
});
