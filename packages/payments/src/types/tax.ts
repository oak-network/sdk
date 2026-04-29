import { ApiResponse } from "./common";

export namespace Tax {
  export interface CalculateRequest {
    provider: string;
    [key: string]: unknown;
  }

  export type CalculateResponse = ApiResponse<unknown>;
}
