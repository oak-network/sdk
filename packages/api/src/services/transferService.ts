import type {
  CreateTransferRequest,
  CreateTransferResponse,
  OakClient,
  Result,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { err } from "../types";

export interface TransferService {
  create(transfer: CreateTransferRequest): Promise<Result<CreateTransferResponse>>;
}

export const createTransferService = (client: OakClient): TransferService => ({
  async create(
    transfer: CreateTransferRequest,
  ): Promise<Result<CreateTransferResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.post<CreateTransferResponse>(
      `${client.config.baseUrl}/api/v1/transfer`,
      transfer,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        retryOptions: client.retryOptions,
      },
    );
  },
});
