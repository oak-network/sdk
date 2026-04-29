import { ApiResponse } from "./common";

export namespace ProviderProxy {
  export interface Request {
    method: string;
    url: string;
    body?: unknown;
    headers?: Record<string, string>;
  }

  export type Response = ApiResponse<unknown>;
}
