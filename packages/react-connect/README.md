# @oaknetwork/react-connect

Headless React primitives for **Plaid** bank linking and **Stripe Connect** account onboarding. No buttons or UI from this package—you build your own and use these primitives. Callback-based so your app (or Oak backend) supplies tokens and secrets.

## Installation

```bash
pnpm add @oaknetwork/react-connect
# or
npm install @oaknetwork/react-connect
```

**Peer dependencies:** `react` and `react-dom` (>=18).

## Plaid (connect bank)

Use the `usePlaidBankConnect` hook and attach `open()` to your own button. Control loading and errors with `isPending` and `error`.

```tsx
import { usePlaidBankConnect } from "@oaknetwork/react-connect";

function MyBankConnect() {
  const { open, ready, isPending, error } = usePlaidBankConnect({
    getLinkToken: () =>
      fetch("/api/plaid/link-token").then((r) => r.json()).then((d) => d.link_token),
    onSubmitPublicToken: (token) =>
      fetch("/api/plaid/exchange", {
        method: "POST",
        body: JSON.stringify({ public_token: token }),
      }),
    plaidEnv: "sandbox",
    onExit: () => console.log("User exited Link"),
  });

  return (
    <>
      <button onClick={() => open()} disabled={isPending || !ready}>
        Connect bank account
      </button>
      {error && <p role="alert">{error.message}</p>}
    </>
  );
}
```

Optional: pass `plaidLinkOptions` (e.g. `onEvent`, `onLoad`, `receivedRedirectUri`) to customize the underlying Plaid Link config.

## Stripe Connect (account onboarding)

Wrap your app with `StripeConnectProvider` and pass `connectOptions` (e.g. `appearance`) for full customization. Render `ConnectAccountOnboarding` where you want it (e.g. in a modal or section).

```tsx
import {
  StripeConnectProvider,
  ConnectAccountOnboarding,
} from "@oaknetwork/react-connect";

function App() {
  return (
    <StripeConnectProvider
      publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      fetchClientSecret={async () => {
        const res = await providerRegistration("stripe");
        return res?.data?.client_secret ?? "";
      }}
      connectOptions={{
        appearance: {
          overlays: "dialog",
          variables: { colorPrimary: "#000000" },
        },
      }}
    >
      <YourApp />
    </StripeConnectProvider>
  );
}

// Where you want account onboarding (e.g. behind your own button or in a route):
function OnboardingSection() {
  const handleExit = async () => {
    await revalidateTagAction("KYC:STATUS");
  };
  return <ConnectAccountOnboarding onExit={handleExit} />;
}
```

## API

- **Plaid:** `usePlaidBankConnect(options)` → `{ open, ready, isPending, error }`. Options: `getLinkToken`, `onSubmitPublicToken`, `plaidEnv`, optional `onExit`, `onError`, `plaidLinkOptions`.
- **Stripe:** `StripeConnectProvider` props: `publishableKey`, `fetchClientSecret`, optional `connectOptions` (full passthrough to Connect.js), optional `children`. Re-exported `ConnectAccountOnboarding` for use inside the provider tree. You can also import `AppearanceOptions` from this package for typing `connectOptions.appearance`.

## Behavior

- **Plaid:** Callbacks are stored in refs so the Plaid Link config stays stable across re-renders and always uses the latest `getLinkToken`/`onSubmitPublicToken`. Calling `open()` while a request is in flight is a no-op. State updates are skipped after unmount. If `onSubmitPublicToken` throws, `error` is set and `onError` is called so you can show feedback.
- **Stripe Connect:** The Connect instance is created once per `publishableKey`; `fetchClientSecret` and `connectOptions` are read from refs so changing them does not recreate the instance. When `connectOptions.appearance` or `connectOptions.locale` changes, `instance.update()` is called so the UI updates without remounting.

## License

MIT
