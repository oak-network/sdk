import { SDKConfig, CreateBuyRequest, CreateBuyResponse } from "../types";
import { httpClient, SDKError } from "../utils";
import { RetryOptions } from "../utils/defaultRetryConfig";
import { AuthService } from "./authService";

export class BuyService {
  private config: SDKConfig;
  private authService: AuthService;
  private retryOptions: RetryOptions;

  constructor(
    config: SDKConfig,
    authService: AuthService,
    retryOptions: RetryOptions
  ) {
    this.config = config;
    this.authService = authService;
    this.retryOptions = retryOptions;
  }

  async createBuy(BuyRequest: CreateBuyRequest): Promise<CreateBuyResponse> {
    try {
      const token = await this.authService.getAccessToken();
      const response = await httpClient.post<CreateBuyResponse>(
        `${this.config.baseUrl}/api/v1/buy`,
        BuyRequest,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: this.retryOptions,
        }
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to create buy", error);
    }
  }
}
