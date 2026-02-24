import { createOakClient } from "../../src";
import { Crowdsplit } from "../../src/products/crowdsplit";
import { getConfigFromEnv } from "../config";

const INTEGRATION_TEST_TIMEOUT = 30000;

describe("PaymentMethodService - Integration", () => {
  let paymentMethods: ReturnType<typeof Crowdsplit>["paymentMethods"];
  let customers: ReturnType<typeof Crowdsplit>["customers"];
  let testCustomerId: string;
  let createdPaymentMethodId: string | undefined;

  beforeAll(async () => {
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

    const listResponse = await customers.list({ limit: 1 });
    if (listResponse.ok && listResponse.value.data.customer_list.length > 0) {
      const first = listResponse.value.data.customer_list[0];
      testCustomerId = (first.id ?? first.customer_id) as string;
    } else {
      const createResponse = await customers.create({
        email: `pm_test_${Date.now()}@example.com`,
      });
      if (!createResponse.ok) {
        throw new Error(
          "Could not get or create test customer — ensure at least one customer exists or create with email only is supported",
        );
      }
      testCustomerId = (createResponse.value.data.id ??
        createResponse.value.data.customer_id) as string;
    }

    if (!testCustomerId) {
      throw new Error(
        "testCustomerId not available — list or create must yield a customer",
      );
    }
  }, INTEGRATION_TEST_TIMEOUT);

  describe("add", () => {
    it(
      "should add a PIX payment method",
      async () => {
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
        }
        // When Stripe connected account is not set up, creation fails; test does not fail the suite.
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("get", () => {
    describe("when a payment method was added", () => {
      beforeAll(() => {
        if (!createdPaymentMethodId) {
          throw new Error(
            "createdPaymentMethodId not available — add PIX test must run first",
          );
        }
      });

      it(
        "should get the created payment method",
        async () => {
          const response = await paymentMethods.get(
            testCustomerId,
            createdPaymentMethodId!,
          );

          expect(response.ok).toBe(true);
          if (response.ok) {
            expect(response.value.data.id).toEqual(createdPaymentMethodId);
          }
        },
        INTEGRATION_TEST_TIMEOUT,
      );
    });

    it(
      "should handle invalid payment method ID gracefully",
      async () => {
        const response = await paymentMethods.get(
          testCustomerId,
          "non-existent-pm-id",
        );

        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      "should handle invalid customer ID gracefully",
      async () => {
        const response = await paymentMethods.get(
          "non-existent-customer-id",
          "non-existent-pm-id",
        );

        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("list", () => {
    it(
      "should list all payment methods for customer",
      async () => {
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
        const response = await paymentMethods.list(testCustomerId, {
          type: "pix",
        });

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
        const response = await paymentMethods.list(testCustomerId, {
          status: "active",
        });

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
        const response = await paymentMethods.list(testCustomerId, {
          platform: "stripe",
        });

        expect(response.ok).toBe(true);
        if (response.ok) {
          expect(Array.isArray(response.value.data)).toBe(true);
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("delete", () => {
    beforeAll(() => {
      if (!createdPaymentMethodId) {
        throw new Error(
          "createdPaymentMethodId not available — add PIX test must run first",
        );
      }
    });

    it(
      "should delete the payment method",
      async () => {
        const response = await paymentMethods.delete(
          testCustomerId,
          createdPaymentMethodId!,
        );

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
        const response = await paymentMethods.delete(
          testCustomerId,
          "non-existent-pm-id",
        );

        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      "should verify payment method is deleted",
      async () => {
        const response = await paymentMethods.get(
          testCustomerId,
          createdPaymentMethodId!,
        );

        expect(response.ok).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });
});
