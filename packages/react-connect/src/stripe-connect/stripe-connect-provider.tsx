"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  loadConnectAndInitialize,
  type StripeConnectInstance,
} from "@stripe/connect-js";
import { ConnectComponentsProvider } from "@stripe/react-connect-js";
import type { StripeConnectProviderProps } from "./types";

/**
 * Headless provider for Stripe Connect embedded components (e.g. Connect Account Onboarding).
 * Renders only ConnectComponentsProvider; no button or UI.
 *
 * The Connect instance is created once per publishableKey. fetchClientSecret and
 * connectOptions are read from refs so changing them does not recreate the instance;
 * when connectOptions (appearance or locale) changes, instance.update() is called
 * so the UI updates without remounting.
 *
 * @param props - publishableKey, fetchClientSecret, optional connectOptions (appearance, locale, etc.), optional children
 *
 * @example
 * ```tsx
 * <StripeConnectProvider
 *   publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
 *   fetchClientSecret={async () => (await providerRegistration('stripe')).data?.client_secret ?? ''}
 *   connectOptions={{ appearance: { overlays: 'dialog', variables: { colorPrimary: '#000000' } } }}
 * >
 *   <App />
 * </StripeConnectProvider>
 * ```
 * Then where you want account onboarding: <ConnectAccountOnboarding onExit={handleExit} />
 */
export function StripeConnectProvider({
  publishableKey,
  fetchClientSecret,
  connectOptions,
  children,
}: StripeConnectProviderProps): JSX.Element {
  const fetchClientSecretRef = useRef(fetchClientSecret);
  const connectOptionsRef = useRef(connectOptions);
  fetchClientSecretRef.current = fetchClientSecret;
  connectOptionsRef.current = connectOptions;

  const connectInstance = useMemo(
    () =>
      loadConnectAndInitialize({
        publishableKey,
        fetchClientSecret: () => fetchClientSecretRef.current(),
        ...connectOptionsRef.current,
      }),
    [publishableKey]
  );

  const instanceRef = useRef(connectInstance);
  instanceRef.current = connectInstance;

  useEffect(() => {
    const opts = connectOptionsRef.current;
    if (!opts) return;
    instanceRef.current.update({
      appearance: opts.appearance,
      locale: opts.locale,
    });
  }, [connectOptions?.appearance, connectOptions?.locale]);

  return (
    <ConnectComponentsProvider connectInstance={connectInstance}>
      {children ?? null}
    </ConnectComponentsProvider>
  );
}
