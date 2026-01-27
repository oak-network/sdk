import { SDKConfig } from "./types";
import {
  AuthService,
  BuyService,
  CustomerService,
  PlanService,
  SellService,
  PaymentService,
  ProviderService,
  TransactionService,
  TransferService,
  WebhookService,
} from "./services";
import {
  DEFAULT_RETRY_OPTIONS,
  RetryOptions,
} from "./utils/defaultRetryConfig";

export class CrowdsplitSDK {
  private config: SDKConfig;
  private retryOptions: RetryOptions;
  public auth: AuthService;
  public payment: PaymentService;
  public customer: CustomerService;
  public provider: ProviderService;
  public transaction: TransactionService;
  public webhook: WebhookService;
  public transfer: TransferService;
  public sell: SellService;
  public plan: PlanService;
  public buy: BuyService;

  constructor(config: SDKConfig) {
    this.config = config;
    this.retryOptions = {
      ...DEFAULT_RETRY_OPTIONS,
      ...config.retryOptions,
    };
    this.auth = new AuthService(config, this.retryOptions);
    this.payment = new PaymentService(config, this.auth, this.retryOptions);
    this.customer = new CustomerService(config, this.auth, this.retryOptions);
    this.provider = new ProviderService(config, this.auth, this.retryOptions);
    this.transaction = new TransactionService(
      config,
      this.auth,
      this.retryOptions
    );
    this.webhook = new WebhookService(config, this.auth, this.retryOptions);
    this.transfer = new TransferService(config, this.auth, this.retryOptions);
    this.sell = new SellService(config, this.auth, this.retryOptions);
    this.plan = new PlanService(config, this.auth, this.retryOptions);
    this.buy = new BuyService(config, this.auth, this.retryOptions);
  }
}
