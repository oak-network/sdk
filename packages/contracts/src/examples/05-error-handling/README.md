# Scenario 5: Error Handling and Transaction Safety

## The Story

Kai is a frontend developer at ArtFund, responsible for building the campaign management interface. Before any transaction is sent to the blockchain, Kai wants to:

1. **Preview the outcome** — simulate the transaction against the current chain state to see if it would succeed
2. **Show clear error messages** — if the transaction would fail, explain why in plain language and suggest what to do
3. **Estimate the cost** — display the gas estimate so users know what they will pay before confirming

Kai also needs to handle edge cases that come up in production: What happens when a user without the right permissions tries to perform a restricted action? What about users browsing the app without a connected wallet? How should the UI handle a read-only session?

These patterns are essential for any production application built on Oak Protocol. A good error handling strategy turns cryptic blockchain reverts into helpful user-facing messages.

## How It Unfolds

1. **Simulate before sending** — Call the contract's `simulate` method to preview a transaction. If simulation passes, the transaction is safe to broadcast
2. **Prepare for external signing** — Extract raw transaction parameters from a simulation result for use with multisig wallets, account abstraction, or custom signing flows
3. **Catch typed errors** — When a transaction reverts, decode the raw revert data into a named error class with a human-readable recovery hint
4. **Handle read-only clients** — When no wallet is connected, write methods throw immediately without making an RPC call. The UI should prompt the user to connect their wallet
5. **Complete simulate-then-send pattern** — A reusable function that combines simulation, error handling, and execution into a single safe workflow
6. **One-call simulate + error decode** — `simulateWithErrorDecode` wraps simulation and error parsing into a single convenience call

## Files

| Step | File | Description |
| --- | --- | --- |
| 1 | `01-simulate-before-send.ts` | Simulate a transaction and inspect the result before broadcasting |
| 2 | `02-prepare-transaction.ts` | Extract raw transaction parameters for external or multisig signing |
| 3 | `03-catch-typed-errors.ts` | Catch and decode typed revert errors with recovery hints |
| 4 | `04-read-only-client.ts` | Handle the case where no wallet is connected |
| 5 | `05-safe-transaction-pattern.ts` | A reusable simulate-then-send pattern for production UIs |
| 6 | `06-simulate-with-error-decode.ts` | One-call convenience wrapper — simulate + auto-decode reverts |
