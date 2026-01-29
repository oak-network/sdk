import type {
  CreateTransferRequest,
  CreateTransferResponse,
  OakClient,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";

export interface TransferService {
  createTransfer(transfer: CreateTransferRequest): Promise<CreateTransferResponse>;
}

export const createTransferService = (client: OakClient): TransferService => ({
  async createTransfer(
    transfer: CreateTransferRequest
  ): Promise<CreateTransferResponse> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.post<CreateTransferResponse>(
        `${client.config.baseUrl}/api/v1/transfer`,
        transfer,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        }
      );

      return response;
    } catch (error) {
      throw new SDKError("Failed to create transfer", error);
    }
  },
});
