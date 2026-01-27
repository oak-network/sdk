import {
  SDKConfig,
  CreateTransferRequest,
  CreateTransferResponse,
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
  ): Promise<CreateTransferResponse> {
    try {
      // Proactively ensure a valid token before making the request
      const token = await this.authService.getAccessToken();

      const response = await httpClient.post<CreateTransferResponse>(
        `${this.config.baseUrl}/api/v1/transfer`,
        transfer,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return response;
    } catch (error) {
      throw new SDKError("Failed to create transfer", error);
    }
  }
}
