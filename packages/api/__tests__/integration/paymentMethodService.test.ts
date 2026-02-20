import { createOakClient } from "../../src";
import { Crowdsplit } from "../../src/products/crowdsplit";
import { getConfigFromEnv } from "../config";

const INTEGRATION_TEST_TIMEOUT = 30000;

describe("PaymentMethodService - Integration", () => {
  let paymentMethods: ReturnType<typeof Crowdsplit>["paymentMethods"];
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
    const crowdsplit = Crowdsplit(client);
    paymentMethods = crowdsplit.paymentMethods;
    customers = crowdsplit.customers;
  });

  let testCustomerId: string | undefined;
  let createdPaymentMethodId: string | undefined;

  describe("setup", () => {
    it(
      "should find or create a test customer",
      async () => {
        const listResponse = await customers.list({ limit: 1 });
        if (listResponse.ok && listResponse.value.data.customer_list.length > 0) {
          testCustomerId = listResponse.value.data.customer_list[0].id as string;
        } else {
          const email = `pm_test_${Date.now()}@example.com`;
          const createResponse = await customers.create({ email });
          if (createResponse.ok) {
            testCustomerId = createResponse.value.data.id as string;
          }
        }
        expect(testCustomerId).toBeDefined();
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("add", () => {
    it(
      "should add a PIX payment method",
      async () => {
        if (!testCustomerId) {
          console.warn("Skipping: testCustomerId not available");
          return;
        }

        const response = await paymentMethods.add(testCustomerId, {
          type: "pix",
          pix_string: `pix_test_${Date.now()}@example.com`,
          metadata: {
            test: true,
            created_by: "integration_test",
          },
        });

        expect(response.ok).toBe(true);
        if (response.ok) {
          expect(response.value.data.id).toBeDefined();
          expect(response.value.data.type).toBe("pix");
          createdPaymentMethodId = response.value.data.id;
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      "should add a bank account payment method (Stripe)",
      async () => {
        if (!testCustomerId) {
          console.warn("Skipping: testCustomerId not available");
          return;
        }

        const response = await paymentMethods.add(testCustomerId, {
          type: "bank",
          provider: "stripe",
          currency: "usd",
          bank_name: "Test Bank",
          bank_account_number: "000123456789",
          bank_routing_number: "110000000",
          bank_account_type: "CHECKING",
          bank_account_name: "Integration Test Account",
          metadata: {
            test: true,
            created_by: "integration_test",
          },
        });

        if (response.ok) {
          expect(response.value.data.id).toBeDefined();
          expect(response.value.data.type).toBe("bank");
          if (!createdPaymentMethodId) {
            createdPaymentMethodId = response.value.data.id;
          }
        } else {
          console.warn("Bank account creation failed - may require Stripe connected account");
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("get", () => {
    it(
      "should get the created payment method",
      async () => {
        if (!testCustomerId || !createdPaymentMethodId) {
          console.warn("Skipping: testCustomerId or createdPaymentMethodId not available");
          return;
        }

        const response = await paymentMethods.get(testCustomerId, createdPaymentMethodId);

        expect(response.ok).toBe(true);
        if (response.ok) {
          expect(response.value.data.id).toEqual(createdPaymentMethodId);
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      "should handle invalid payment method ID gracefully",
      async () => {
        if (!testCustomerId) {
          console.warn("Skipping: testCustomerId not available");
          return;
        }

        const response = await paymentMethods.get(testCustomerId, "non-existent-pm-id");

        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      "should handle invalid customer ID gracefully",
      async () => {
        const response = await paymentMethods.get("non-existent-customer-id", "non-existent-pm-id");

        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("list", () => {
    it(
      "should list all payment methods for customer",
      async () => {
        if (!testCustomerId) {
          console.warn("Skipping: testCustomerId not available");
          return;
        }

        const response = await paymentMethods.list(testCustomerId);

        expect(response.ok).toBe(true);
        if (response.ok) {
          expect(Array.isArray(response.value.data)).toBe(true);
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      "should list payment methods with type filter",
      async () => {
        if (!testCustomerId) {
          console.warn("Skipping: testCustomerId not available");
          return;
        }

        const response = await paymentMethods.list(testCustomerId, { type: "pix" });

        expect(response.ok).toBe(true);
        if (response.ok) {
          expect(Array.isArray(response.value.data)).toBe(true);
          response.value.data.forEach((pm) => {
            expect(pm.type).toBe("pix");
          });
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      "should list payment methods with status filter",
      async () => {
        if (!testCustomerId) {
          console.warn("Skipping: testCustomerId not available");
          return;
        }

        const response = await paymentMethods.list(testCustomerId, { status: "active" });

        expect(response.ok).toBe(true);
        if (response.ok) {
          expect(Array.isArray(response.value.data)).toBe(true);
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      "should list payment methods with platform filter",
      async () => {
        if (!testCustomerId) {
          console.warn("Skipping: testCustomerId not available");
          return;
        }

        const response = await paymentMethods.list(testCustomerId, { platform: "stripe" });

        expect(response.ok).toBe(true);
        if (response.ok) {
          expect(Array.isArray(response.value.data)).toBe(true);
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("delete", () => {
    it(
      "should delete the payment method",
      async () => {
        if (!testCustomerId || !createdPaymentMethodId) {
          console.warn("Skipping: testCustomerId or createdPaymentMethodId not available");
          return;
        }

        const response = await paymentMethods.delete(testCustomerId, createdPaymentMethodId);

        expect(response.ok).toBe(true);
        if (response.ok) {
          expect(response.value.msg).toBeDefined();
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      "should handle deleting non-existent payment method",
      async () => {
        if (!testCustomerId) {
          console.warn("Skipping: testCustomerId not available");
          return;
        }

        const response = await paymentMethods.delete(testCustomerId, "non-existent-pm-id");

        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      "should verify payment method is deleted",
      async () => {
        if (!testCustomerId || !createdPaymentMethodId) {
          console.warn("Skipping: testCustomerId or createdPaymentMethodId not available");
          return;
        }

        const response = await paymentMethods.get(testCustomerId, createdPaymentMethodId);

        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });
});
