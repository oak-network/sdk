"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import type { UsePlaidBankConnectOptions, UsePlaidBankConnectReturn } from "./types";

/**
 * Headless hook for Plaid Link bank connect flow.
 * Returns open, ready, isPending, error—attach open() to your own button; no UI from this package.
 *
 * Callbacks are stored in refs so the Plaid Link config stays stable across re-renders and
 * always uses the latest getLinkToken/onSubmitPublicToken. Prevents double-fetch when open()
 * is called while a request is in flight, and avoids setState after unmount.
 *
 * @param options - getLinkToken, onSubmitPublicToken, plaidEnv, optional onExit, onError, plaidLinkOptions (merged into usePlaidLink config; do not pass token/onSuccess/onExit there)
 * @returns { open, ready, isPending, error }
 *
 * @example
 * ```tsx
 * const { open, ready, isPending, error } = usePlaidBankConnect({
 *   getLinkToken: () => fetch('/api/plaid/link-token').then(r => r.json()).then(d => d.link_token),
 *   onSubmitPublicToken: (token) => fetch('/api/plaid/exchange', { method: 'POST', body: JSON.stringify({ token }) }),
 *   plaidEnv: 'sandbox',
 * });
 * return <button onClick={() => open()} disabled={isPending || !ready}>Connect bank</button>;
 * ```
 */
export function usePlaidBankConnect(
  options: UsePlaidBankConnectOptions
): UsePlaidBankConnectReturn {
  const {
    getLinkToken,
    onSubmitPublicToken,
    plaidEnv,
    onExit: onExitOption,
    onError,
    plaidLinkOptions = {},
  } = options;

  const getLinkTokenRef = useRef(getLinkToken);
  const onSubmitPublicTokenRef = useRef(onSubmitPublicToken);
  const onExitOptionRef = useRef(onExitOption);
  const onErrorRef = useRef(onError);
  getLinkTokenRef.current = getLinkToken;
  onSubmitPublicTokenRef.current = onSubmitPublicToken;
  onExitOptionRef.current = onExitOption;
  onErrorRef.current = onError;

  const [linkToken, setLinkToken] = useState<string | null>(null);
  const linkTokenRef = useRef<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const onSuccess = useCallback((publicToken: string) => {
    const currentLinkToken = linkTokenRef.current;
    if (!currentLinkToken) return;
    const submit = onSubmitPublicTokenRef.current;
    const reportError = onErrorRef.current;
    submit(publicToken).catch((err: unknown) => {
      const e = err instanceof Error ? err : new Error(String(err));
      if (isMountedRef.current) setError(e);
      reportError?.(e);
    });
    setLinkToken(null);
    linkTokenRef.current = null;
  }, []);

  const onExit = useCallback(() => {
    setLinkToken(null);
    linkTokenRef.current = null;
    onExitOptionRef.current?.();
  }, []);

  const passthrough = { ...plaidLinkOptions };
  if (passthrough.receivedRedirectUri === null) {
    passthrough.receivedRedirectUri = undefined;
  }

  const { open: openPlaid, ready } = usePlaidLink({
    ...passthrough,
    token: linkToken ?? null,
    env: plaidEnv,
    onSuccess,
    onExit,
  });

  const open = useCallback(async () => {
    if (isPending) return;
    setError(null);
    setIsPending(true);
    try {
      const token = await getLinkTokenRef.current();
      if (!isMountedRef.current) return;
      setLinkToken(token);
      linkTokenRef.current = token;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      if (isMountedRef.current) setError(e);
      onErrorRef.current?.(e);
    } finally {
      if (isMountedRef.current) setIsPending(false);
    }
  }, [isPending]);

  useEffect(() => {
    if (linkToken && ready) {
      openPlaid();
    }
  }, [linkToken, ready, openPlaid]);

  return {
    open,
    ready,
    isPending,
    error,
  };
}
