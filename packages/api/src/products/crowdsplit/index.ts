import type { OakClient } from "../../types";
import {
  createBuyService,
  createCustomerService,
  createPaymentMethodService,
  createPaymentService,
  createPlanService,
  createProviderService,
  createSellService,
  createTransactionService,
  createTransferService,
  createWebhookService,
} from "../../services";

export interface CrowdsplitProduct {
  customers: ReturnType<typeof createCustomerService>;
  payments: ReturnType<typeof createPaymentService>;
  paymentMethods: ReturnType<typeof createPaymentMethodService>;
  providers: ReturnType<typeof createProviderService>;
  transactions: ReturnType<typeof createTransactionService>;
  webhooks: ReturnType<typeof createWebhookService>;
  transfers: ReturnType<typeof createTransferService>;
  sell: ReturnType<typeof createSellService>;
  plans: ReturnType<typeof createPlanService>;
  buy: ReturnType<typeof createBuyService>;
}

/**
 * @param client - Configured OakClient instance
 * @returns Object containing all Crowdsplit service instances
 */
export const Crowdsplit = (client: OakClient): CrowdsplitProduct => ({
  customers: createCustomerService(client),
  payments: createPaymentService(client),
  paymentMethods: createPaymentMethodService(client),
  providers: createProviderService(client),
  transactions: createTransactionService(client),
  webhooks: createWebhookService(client),
  transfers: createTransferService(client),
  sell: createSellService(client),
  plans: createPlanService(client),
  buy: createBuyService(client),
});
