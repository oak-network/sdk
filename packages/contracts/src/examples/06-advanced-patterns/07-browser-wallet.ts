/**
 * Step 7: Browser Wallet Integration (MetaMask / Injected Providers)
 *
 * For frontend applications that use MetaMask, Coinbase Wallet, or
 * any browser extension that injects `window.ethereum`, the SDK
 * provides two helpers:
 *
 *   - `createBrowserProvider(ethereum, chain)` — wraps the injected
 *     provider into a viem PublicClient for on-chain reads
 *   - `getSigner(ethereum, chain)` — requests accounts from the
 *     wallet (triggers the MetaMask popup) and returns a WalletClient
 *     with the connected account attached
 *
 * Two usage patterns are shown:
 *
 *   A. Full configuration — construct the client with provider and
 *      signer up front, so every entity inherits the wallet
 *   B. Per-entity override — start with a read-only client and pass
 *      the signer only when creating a specific entity
 *
 * This file requires a browser environment with `window.ethereum`.
 */

import {
  createOakContractsClient,
  createBrowserProvider,
  getSigner,
  getChainFromId,
  CHAIN_IDS,
} from "@oaknetwork/contracts-sdk";

declare const window: { ethereum: Parameters<typeof createBrowserProvider>[0] };

// ============================================================
// A. Full Configuration — provider + signer passed to client
// ============================================================

async function browserWalletFullConfig(): Promise<void> {
  const chain = getChainFromId(CHAIN_IDS.CELO_TESTNET_SEPOLIA);
  const provider = createBrowserProvider(window.ethereum, chain);
  const signer = await getSigner(window.ethereum, chain);

  const oak = createOakContractsClient({ chain, provider, signer });

  const gp = oak.globalParams("0x..." as `0x${string}`);

  // Reads
  const admin = await gp.getProtocolAdminAddress();
  console.log("Protocol admin:", admin);

  // Writes — automatically use the browser wallet signer
  // await gp.enlistPlatform(platformHash, adminAddr, fee, adapter);
}

// ============================================================
// B. Per-Entity Override — read-only client + signer on entity
// ============================================================

async function browserWalletPerEntity(): Promise<void> {
  const chain = getChainFromId(CHAIN_IDS.CELO_TESTNET_SEPOLIA);

  const oak = createOakContractsClient({
    chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
    rpcUrl: "https://forno.celo-sepolia.celo-testnet.org",
  });

  const signer = await getSigner(window.ethereum, chain);
  console.log("Connected wallet:", signer.account.address);

  const treasuryAddress = "0x..." as `0x${string}`;
  const treasury = oak.allOrNothingTreasury(treasuryAddress, { signer });

  const raised = await treasury.getRaisedAmount();
  console.log("Raised:", raised);

  // Writes use the browser wallet signer
  // const txHash = await treasury.claimRefund(0n);
  // await oak.waitForReceipt(txHash);
}
