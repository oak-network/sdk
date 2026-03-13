import type { Account, WalletClient } from "../lib";

/**
 * Asserts that walletClient has an account attached; throws a descriptive error if not.
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
