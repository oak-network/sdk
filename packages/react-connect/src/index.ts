/**
 * @oaknetwork/react-connect
 *
 * Headless React primitives for Plaid bank linking and Stripe Connect (account onboarding).
 * No buttons or UI from this package—use your own. Callback-based so the host app supplies tokens and secrets.
 */

export {
  usePlaidBankConnect,
  type UsePlaidBankConnectOptions,
  type UsePlaidBankConnectReturn,
  type PlaidLinkPassthroughOptions,
  type PlaidEnv,
} from "./plaid";

export { StripeConnectProvider, type StripeConnectProviderProps } from "./stripe-connect";

export { ConnectAccountOnboarding } from "@stripe/react-connect-js";

/** Re-exported for typing connectOptions.appearance without depending on @stripe/connect-js directly. */
export type { AppearanceOptions } from "@stripe/connect-js";
