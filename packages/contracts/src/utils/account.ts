import type { Account, WalletClient } from "../lib";

/**
 * Narrows a possibly-null WalletClient to a non-null WalletClient, throwing a descriptive
 * error if no signer has been configured. Use this in write methods to obtain a typed
 * reference before calling writeContract.
 * @param walletClient - The wallet client to check, or null for a read-only client
 * @returns The non-null WalletClient
 * @throws {Error} If walletClient is null (no signer configured)
 */
export function requireSigner(walletClient: WalletClient | null): WalletClient {
  if (walletClient === null) {
    throw new Error(
      "No signer configured. Pass a signer when creating the client " +
      "({ privateKey } or { signer }) or supply one per entity: " +
      "oak.globalParams(address, { signer: walletClient }).",
    );
  }
  return walletClient;
}

/**
 * Asserts that a WalletClient has an account attached; throws a descriptive error if not.
 * @param walletClient - The wallet client to check
 * @returns The attached account
 * @throws {Error} If no account is attached to the wallet client
 */
export function requireAccount(walletClient: WalletClient): Account {
  if (!walletClient.account) {
    throw new Error("WalletClient has no account attached. Provide a signer with an account.");
  }
  return walletClient.account;
}
