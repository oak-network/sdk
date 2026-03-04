/**
 * Types for Plaid bank-connect hook.
 * Re-exports and extends types from react-plaid-link where applicable.
 */

import type { PlaidLinkOnEvent, PlaidLinkOnLoad } from 'react-plaid-link';
import type { PlaidEnv } from '../types';

/** Options for usePlaidBankConnect. */
export interface UsePlaidBankConnectOptions {
  /** Called when user invokes open(); app fetches link token from backend. */
  getLinkToken: () => Promise<string>;
  /** Called after Plaid success; app submits public token to backend. */
  onSubmitPublicToken: (publicToken: string) => Promise<void>;
  /** Plaid Link environment.*/
  plaidEnv: PlaidEnv;
  /** Optional; called when user exits Link without completing. */
  onExit?: () => void;
  /** Optional; called when getLinkToken or open fails. */
  onError?: (err: Error) => void;
  /**
   * Optional extra options passed through to the underlying usePlaidLink config.
   * Merge/spread into the config so users can customize everything the underlying package allows.
   */
  plaidLinkOptions?: PlaidLinkPassthroughOptions;
}

/**
 * Options passed through to react-plaid-link config.
 * Excludes token, onSuccess, onExit (set by the hook).
 */
export interface PlaidLinkPassthroughOptions {
  onEvent?: PlaidLinkOnEvent;
  onLoad?: PlaidLinkOnLoad;
  receivedRedirectUri?: string;
  [key: string]: unknown;
}

/** Return type of usePlaidBankConnect. */
export interface UsePlaidBankConnectReturn {
  /** Call from your own button/link; fetches link token and opens Plaid Link when ready. */
  open: () => Promise<void>;
  /** True when Plaid Link is ready to open. */
  ready: boolean;
  /** True while link token is being fetched. */
  isPending: boolean;
  /** Set if getLinkToken or open fails; clear when open() is called again. */
  error: Error | null;
}

export type { PlaidEnv };
