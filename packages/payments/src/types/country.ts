import { ApiResponse } from "./common";

export namespace Country {
  export interface Item {
    /** ISO 3166-1 alpha-2 uppercase country code (e.g. "US", "GB"). */
    iso_alpha_2: string;
    /** English display name of the country. */
    name: string;
    /** Whether the country is currently eligible for KYC onboarding. */
    kyc_supported: boolean;
  }

  export interface ListData {
    countries: Item[];
  }

  export type ListResponse = ApiResponse<ListData>;
}
