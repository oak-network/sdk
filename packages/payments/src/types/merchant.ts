import { ApiResponse } from "./common";

export namespace Merchant {
  export interface TransferDateRequest {
    settlementDate: string;
    region: string;
    config?: {
      weekends?: number[];
      holidays?: string[];
    };
  }

  export type TransferDateResponse = ApiResponse<unknown>;
}
