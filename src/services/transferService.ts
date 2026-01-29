import {
  SDKConfig,
  CreateTransferRequest,
  CreateTransferResponse,
  Result,
  ok,
  err,
} from "../types";
import { httpClient, SDKError } from "../utils";
import { RetryOptions } from "../utils/defaultRetryConfig";
import { AuthService } from "./authService";

export class TransferService {
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

  async createTransfer(
    transfer: CreateTransferRequest
  ): Promise<Result<CreateTransferResponse, SDKError>> {
    try {
      // Proactively ensure a valid token before making the request
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.post<CreateTransferResponse>(
        `${this.config.baseUrl}/api/v1/transfer`,
        transfer,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to create transfer", error));
    }
  }
}
