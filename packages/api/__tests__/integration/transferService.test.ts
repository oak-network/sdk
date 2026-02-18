import { createOakClient } from "../../src";
import { Crowdsplit } from "../../src/products/crowdsplit";
import { getConfigFromEnv } from "../config";

const INTEGRATION_TEST_TIMEOUT = 30000;

describe("TransferService - Integration", () => {
  let transfers: ReturnType<typeof Crowdsplit>["transfers"];
  let customers: ReturnType<typeof Crowdsplit>["customers"];
  let paymentMethods: ReturnType<typeof Crowdsplit>["paymentMethods"];

  beforeAll(() => {
    const client = createOakClient({
      ...getConfigFromEnv(),
      retryOptions: {
        maxNumberOfRetries: 2,
        delay: 500,
        backoffFactor: 2,
      },
    });
    transfers = Crowdsplit(client).transfers;
    customers = Crowdsplit(client).customers;
    paymentMethods = Crowdsplit(client).paymentMethods;
  });

  let customerId: string | undefined;
  let paymentMethodId: string | undefined;

  it(
    "should create a transfer (Stripe: Manual Payout)",
    async () => {
      const customerList = await customers.list({
        target_role: "customer",
        provider_registration_status: "approved",
        provider: "stripe",
      });
      expect(customerList.ok).toBe(true);
      if (
        customerList.ok &&
        customerList.value.data.customer_list.length === 0
      ) {
        console.warn("Skipping: no customers found");
        return;
      }
      if (customerList.ok) {
        expect(customerList.value.data.customer_list.length).toBeGreaterThan(0);

        for (const customer of customerList.value.data.customer_list) {
          const paymentMethod = await paymentMethods.list(
            customer.id as string,
            {
              type: "bank",
              status: "active",
              platform: "stripe",
            },
          );
          if (paymentMethod.ok && paymentMethod.value.data.length > 0) {
            customerId = customer.id as string;
            paymentMethodId = paymentMethod.value.data[0].id as string;
            break;
          }
        }
      }

      if (!customerId || !paymentMethodId) {
        console.warn("Skipping: no customer or payment method found");
        return;
      }

      expect(customerId).toBeDefined();
      expect(paymentMethodId).toBeDefined();
      const transfer = await transfers.create({
        provider: "stripe",
        source: {
          amount: 1,
          currency: "usd",
          customer: {
            id: customerId as string,
          },
        },
        destination: {
          customer: {
            id: customerId as string,
          },
          payment_method: {
            type: "bank",
            id: paymentMethodId as string,
          },
        }, // required
        metadata: {
          reference_id: `payout_testing_in_sdk_${Date.now()}`,
          campaign_id: "crowdfund_xyz",
        },
      });
      expect(transfer.ok).toBe(true);
    },
    INTEGRATION_TEST_TIMEOUT,
  );
});
