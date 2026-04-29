import { ApiResponse } from "./common";

export namespace Pix {
  export interface PaidRequest {
    pix_string: string;
    pix_string_type: "BR_CODE" | "PIX_KEY";
    amount: number;
  }

  export type PaidResponse = ApiResponse<unknown>;
}
