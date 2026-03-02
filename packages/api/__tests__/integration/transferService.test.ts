import { createOakClient, createTransferService, createCustomerService, createPaymentMethodService } from "../../src";
import { TransferService } from "../../src/services/transferService";
import { CustomerService } from "../../src/services/customerService";
import { PaymentMethodService } from "../../src/services/paymentMethodService";
import { getConfigFromEnv } from "../config";

const INTEGRATION_TEST_TIMEOUT = 30000;

describe("TransferService - Integration", () => {
  let transfers: TransferService;
  let customers: CustomerService;
  let paymentMethods: PaymentMethodService;

  beforeAll(() => {
    const client = createOakClient({
      ...getConfigFromEnv(),
      retryOptions: {
        maxNumberOfRetries: 2,
        delay: 500,
        backoffFactor: 2,
      },
    });
    transfers = createTransferService(client);
    customers = createCustomerService(client);
    paymentMethods = createPaymentMethodService(client);
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
        throw new Error("No customers found - this test requires at least one customer with approved provider registration");
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
        throw new Error("No customer or payment method found - this test requires at least one customer with an active bank payment method");
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
