import { ApiResponse } from "./common";

export namespace Refund {
  export interface Request {
    amount?: number;
    metadata?: Record<string, any>;
  }

  interface Data {
    id: string;
    status: string; // e.g., "created"
    type: "refund";
    amount?: number;
    provider?: string;
  }

  export type Response = ApiResponse<Data>;
}
