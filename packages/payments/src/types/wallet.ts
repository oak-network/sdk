import { ApiResponse } from "./common";

export namespace Wallet {
  export interface TokenBalance {
    tokenName: string;
    amount: number;
  }

  export interface BalanceData {
    balance: TokenBalance[];
  }

  export type BalanceResponse = ApiResponse<BalanceData>;
}
