import { SDKConfig, CreateSellRequest, CreateSellResponse } from "../types";
import { httpClient, SDKError } from "../utils";
import { RetryOptions } from "../utils/defaultRetryConfig";
import { AuthService } from "./authService";

export class SellService {
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

  async createSell(
    sellRequest: CreateSellRequest
  ): Promise<CreateSellResponse> {
    try {
      const token = await this.authService.getAccessToken();
      const response = await httpClient.post<CreateSellResponse>(
        `${this.config.baseUrl}/api/v1/sell`,
        sellRequest,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: this.retryOptions,
        }
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to create sell", error);
    }
  }
}
