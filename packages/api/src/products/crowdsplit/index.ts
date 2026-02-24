import type { OakClient } from "../../types";
import {
  createBuyService,
  createCustomerService,
  createPaymentMethodService,
  createPaymentService,
  createPlanService,
  createProviderService,
  createRefundService,
  createSellService,
  createTransactionService,
  createTransferService,
  createWebhookService,
  type BuyService,
  type CustomerService,
  type PaymentMethodService,
  type PaymentService,
  type PlanService,
  type ProviderService,
  type RefundService,
  type SellService,
  type TransactionService,
  type TransferService,
  type WebhookService,
} from "../../services";

export interface CrowdsplitProduct {
  customers: CustomerService;
  payments: PaymentService;
  paymentMethods: PaymentMethodService;
  providers: ProviderService;
  refunds: RefundService;
  transactions: TransactionService;
  webhooks: WebhookService;
  transfers: TransferService;
  sell: SellService;
  plans: PlanService;
  buy: BuyService;
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
  refunds: createRefundService(client),
  transactions: createTransactionService(client),
  webhooks: createWebhookService(client),
  transfers: createTransferService(client),
  sell: createSellService(client),
  plans: createPlanService(client),
  buy: createBuyService(client),
});
