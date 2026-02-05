import type {
  CreateTransferRequest,
  CreateTransferResponse,
  OakClient,
  Result,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { err, ok } from "../types";

export interface TransferService {
  create(transfer: CreateTransferRequest): Promise<Result<CreateTransferResponse>>;
}

export const createTransferService = (client: OakClient): TransferService => ({
  async create(
    transfer: CreateTransferRequest,
  ): Promise<Result<CreateTransferResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.post<CreateTransferResponse>(
        `${client.config.baseUrl}/api/v1/transfer`,
        transfer,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: client.retryOptions,
        },
      );

      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to create transfer", error));
    }
  },
});
