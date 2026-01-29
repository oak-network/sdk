import type { OakClient } from "../../types";
import {
  createBuyService,
  createCustomerService,
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
  providers: ReturnType<typeof createProviderService>;
  transactions: ReturnType<typeof createTransactionService>;
  webhooks: ReturnType<typeof createWebhookService>;
  transfers: ReturnType<typeof createTransferService>;
  sell: ReturnType<typeof createSellService>;
  plans: ReturnType<typeof createPlanService>;
  buy: ReturnType<typeof createBuyService>;
}

export const Crowdsplit = (client: OakClient): CrowdsplitProduct => ({
  customers: createCustomerService(client),
  payments: createPaymentService(client),
  providers: createProviderService(client),
  transactions: createTransactionService(client),
  webhooks: createWebhookService(client),
  transfers: createTransferService(client),
  sell: createSellService(client),
  plans: createPlanService(client),
  buy: createBuyService(client),
});
