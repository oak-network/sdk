import {
  SDKConfig,
  CreateSellRequest,
  CreateSellResponse,
  Result,
  ok,
  err,
} from "../types";
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
  ): Promise<Result<CreateSellResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.post<CreateSellResponse>(
        `${this.config.baseUrl}/api/v1/sell`,
        sellRequest,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: this.retryOptions,
        }
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to create sell", error));
    }
  }
}
