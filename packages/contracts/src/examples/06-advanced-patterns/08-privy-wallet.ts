/**
 * Step 8: Privy Wallet Integration
 *
 * Privy embedded wallets expose an EIP-1193 provider. Pass that
 * provider to viem's `custom` transport for both `createPublicClient`
 * and `createWalletClient`, then pass `chain`, `provider`, and
 * `signer` into `createOakContractsClient` — the same full-config
 * pattern as the browser wallet example (Step 7, Pattern A).
 *
 * This snippet uses the `useWallets` hook from `@privy-io/react-auth`
 * to pick a wallet. Replace that with whatever wallet selection logic
 * your app uses.
 *
 * This file requires a React environment with Privy configured.
 */

import {
  createOakContractsClient,
  createPublicClient,
  createWalletClient,
  custom,
  getChainFromId,
  CHAIN_IDS,
} from "@oaknetwork/contracts-sdk";

// Replace with your actual Privy wallet hook
// import { useWallets } from "@privy-io/react-auth";

async function connectPrivyWallet(): Promise<void> {
  // --- In a React component, you would use the hook: ---
  // const { wallets } = useWallets();
  // const wallet = wallets[0]; // or select by address / connector

  // For this example, assume `wallet` is available:
  const wallet = {} as {
    address: string;
    switchChain: (chainId: number) => Promise<void>;
    getEthereumProvider: () => Promise<Parameters<typeof custom>[0]>;
  };

  const chain = getChainFromId(CHAIN_IDS.CELO_TESTNET_SEPOLIA);
  await wallet.switchChain(chain.id);

  const ethereumProvider = await wallet.getEthereumProvider();

  const provider = createPublicClient({
    chain,
    transport: custom(ethereumProvider),
  });

  const signer = createWalletClient({
    chain,
    transport: custom(ethereumProvider),
    account: wallet.address as `0x${string}`,
  });

  const oak = createOakContractsClient({ chain, provider, signer });

  // From here, usage is identical to any other client
  const gp = oak.globalParams("0x..." as `0x${string}`);

  const admin = await gp.getProtocolAdminAddress();
  console.log("Protocol admin:", admin);

  const fee = await gp.getProtocolFeePercent();
  console.log("Protocol fee:", Number(fee), "bps");

  // Writes use the Privy wallet signer automatically
  // await gp.enlistPlatform(platformHash, adminAddr, fee, adapter);
}
