/**
 * Types for Stripe Connect provider.
 * Re-export Connect init params from @stripe/connect-js so users get full customization.
 */

import type { ReactNode } from "react";
import type { IStripeConnectInitParams } from "@stripe/connect-js";

/**
 * Props for StripeConnectProvider.
 * publishableKey and fetchClientSecret are required; all other Connect options
 * (appearance, locale, fonts, etc.) are passed through via connectOptions.
 */
export interface StripeConnectProviderProps {
  /** Stripe Connect publishable key. */
  publishableKey: string;
  /** Called by Connect.js to get client secret; app returns secret from backend (e.g. provider registration). */
  fetchClientSecret: () => Promise<string>;
  /**
   * Optional. Passed through to loadConnectAndInitialize.
   * Include appearance (e.g. overlays, variables.colorPrimary), locale, fonts, or any other Connect option.
   */
  connectOptions?: Omit<
    IStripeConnectInitParams,
    "publishableKey" | "fetchClientSecret"
  >;
  /** Optional. React node to wrap (provider only; no UI from the package). */
  children?: ReactNode;
}
