/**
 * Step 6: Optional Platform Configuration (Platform Admin / Protocol Admin)
 *
 * This file collects all optional configuration steps that can be
 * performed after the core onboarding (Steps 1–5). None of these
 * are required to get started — you can skip any or all and come
 * back later. Each section is independent.
 *
 * Contents:
 *
 *   A. Line Item Types (Platform Admin, PaymentTreasury only)
 *      — Define how payment components (product, shipping, tax) are
 *        categorized on-chain: goal contribution, fees, refundability.
 *        Includes removing a line item type.
 *
 *   B. Claim Delay (Platform Admin, PaymentTreasury only)
 *      — Set a safety window after a treasury's deadline that protects
 *        buyers before the platform can sweep remaining funds
 *
 *   C. Platform Data Keys (Platform Admin)
 *      — Register custom metadata fields for campaigns (e.g., category,
 *        internal order ID). Includes reading data key ownership and
 *        removing a key.
 *
 *   D. Platform Adapter (Protocol Admin)
 *      — Set an ERC-2771 trusted forwarder to enable gasless transactions
 *        across all treasury types
 *
 *   E. Protocol Admin Functions (Protocol Admin only)
 *      — Currency/token management, global data registry, delisting,
 *        admin address updates, fee updates. Listed for completeness;
 *        platforms coordinate with Oak support for these.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

// ============================================================
// A. Line Item Types (PaymentTreasury Only)
// ============================================================
//
// Line item types define how different components of a payment are
// categorized and handled on-chain. Each type controls:
//
//   - countsTowardGoal  — does this amount count toward the funding target?
//   - applyProtocolFee  — does the protocol fee apply?
//   - canRefund         — can the buyer claim a refund for this item?
//   - instantTransfer   — are funds transferred immediately on confirmation?
//
// NovaPay sets up "product" (refundable, counts toward goal) and
// "shipping" (non-refundable, instant transfer, no protocol fee).

async function setupLineItemTypes(): Promise<void> {
  const oak = createOakContractsClient({
    chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
    rpcUrl: process.env.RPC_URL!,
    privateKey: process.env.NOVAPAY_ADMIN_PRIVATE_KEY! as `0x${string}`,
  });

  const globalParams = oak.globalParams(process.env.GLOBAL_PARAMS_ADDRESS! as `0x${string}`);
  const platformHash = keccak256(toHex("NOVAPAY"));

  // "product" line item type
  //
  // Constraint: when countsTowardGoal is true, applyProtocolFee must be
  // false, canRefund must be true, and instantTransfer must be false.
  const productTypeId = keccak256(toHex("product"));
  const tx1 = await globalParams.setPlatformLineItemType(
    platformHash,
    productTypeId,
    "product",
    true,   // countsTowardGoal
    false,  // applyProtocolFee (must be false when countsTowardGoal is true)
    true,   // canRefund        (must be true when countsTowardGoal is true)
    false,  // instantTransfer  (must be false when countsTowardGoal is true)
  );
  await oak.waitForReceipt(tx1);
  console.log("Line item type 'product' set:", tx1);

  // "shipping" line item type
  const shippingTypeId = keccak256(toHex("shipping"));
  const tx2 = await globalParams.setPlatformLineItemType(
    platformHash,
    shippingTypeId,
    "shipping",
    false,  // countsTowardGoal
    false,  // applyProtocolFee
    false,  // canRefund
    true,   // instantTransfer
  );
  await oak.waitForReceipt(tx2);
  console.log("Line item type 'shipping' set:", tx2);

  // Verify
  const productInfo = await globalParams.getPlatformLineItemType(platformHash, productTypeId);
  console.log("Product type:", {
    exists: productInfo.exists,
    countsTowardGoal: productInfo.countsTowardGoal,
    applyProtocolFee: productInfo.applyProtocolFee,
    canRefund: productInfo.canRefund,
    instantTransfer: productInfo.instantTransfer,
  });

  // --- Remove a line item type (optional) ---
  //
  // If a line item type is no longer needed, the Platform Admin can
  // remove it. This sets `exists` to false, preventing new payments
  // from using that type. Existing payments are unaffected.

  // const removeTx = await globalParams.removePlatformLineItemType(
  //   platformHash,
  //   shippingTypeId,
  // );
  // await oak.waitForReceipt(removeTx);
  // console.log("'shipping' line item type removed");
}

// ============================================================
// B. Claim Delay (PaymentTreasury Only)
// ============================================================
//
// The claim delay is a safety window after a PaymentTreasury's
// deadline. Until it expires, `claimExpiredFunds()` reverts with
// `PaymentTreasuryClaimWindowNotReached`.
//
// Formula: claimableAt = deadline + claimDelay
//
// A 7-day delay gives buyers a full week after the deadline to
// claim refunds before the platform can sweep remaining funds.
// Default is 0 (platform can claim immediately after deadline).

async function setClaimDelay(): Promise<void> {
  const oak = createOakContractsClient({
    chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
    rpcUrl: process.env.RPC_URL!,
    privateKey: process.env.NOVAPAY_ADMIN_PRIVATE_KEY! as `0x${string}`,
  });

  const globalParams = oak.globalParams(process.env.GLOBAL_PARAMS_ADDRESS! as `0x${string}`);
  const platformHash = keccak256(toHex("NOVAPAY"));

  const sevenDaysInSeconds = 7n * 24n * 60n * 60n; // 604,800 seconds
  const txHash = await globalParams.updatePlatformClaimDelay(platformHash, sevenDaysInSeconds);
  await oak.waitForReceipt(txHash);
  console.log("Claim delay set to 7 days");

  const claimDelay = await globalParams.getPlatformClaimDelay(platformHash);
  console.log("Current claim delay:", Number(claimDelay), "seconds");
}

// ============================================================
// C. Platform Data Keys
// ============================================================
//
// Platform data keys provide a key-value metadata store for campaigns.
// The Platform Admin registers valid keys in GlobalParams using
// `addPlatformData`. Campaign creators pass key-value pairs when
// calling `createCampaign` — the factory validates each key.
//
// Platform data is purely informational — not used by any treasury.
// Common uses: campaign categories, platform-specific IDs, tagging.

async function registerPlatformDataKeys(): Promise<void> {
  const oak = createOakContractsClient({
    chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
    rpcUrl: process.env.RPC_URL!,
    privateKey: process.env.NOVAPAY_ADMIN_PRIVATE_KEY! as `0x${string}`,
  });

  const globalParams = oak.globalParams(process.env.GLOBAL_PARAMS_ADDRESS! as `0x${string}`);
  const platformHash = keccak256(toHex("NOVAPAY"));

  // Register a "category" data key
  const categoryKey = keccak256(toHex("novapay:category"));
  const tx1 = await globalParams.addPlatformData(platformHash, categoryKey);
  await oak.waitForReceipt(tx1);
  console.log("Data key 'novapay:category' registered");

  // Register an "internal-id" data key
  const internalIdKey = keccak256(toHex("novapay:internal-id"));
  const tx2 = await globalParams.addPlatformData(platformHash, internalIdKey);
  await oak.waitForReceipt(tx2);
  console.log("Data key 'novapay:internal-id' registered");

  // Verify
  const isValid = await globalParams.checkIfPlatformDataKeyValid(categoryKey);
  console.log("'novapay:category' valid:", isValid); // true

  const owner = await globalParams.getPlatformDataOwner(categoryKey);
  console.log("Data key owner:", owner); // should match platformHash

  // How creators use these keys:
  //
  // await factory.createCampaign({
  //   ...campaignData,
  //   platformDataKey: [categoryKey, internalIdKey],
  //   platformDataValue: [
  //     toHex("electronics", { size: 32 }),
  //     toHex("NP-2026-00451", { size: 32 }),
  //   ],
  // });

  // --- Remove a platform data key (optional) ---
  //
  // If a data key is no longer needed, the Platform Admin can remove
  // it. After removal, `checkIfPlatformDataKeyValid` returns false
  // and `getPlatformDataOwner` returns zero bytes.

  // const removeTx = await globalParams.removePlatformData(platformHash, internalIdKey);
  // await oak.waitForReceipt(removeTx);
  // console.log("'novapay:internal-id' data key removed");
}

// ============================================================
// D. Platform Adapter (Meta-Transactions) — Protocol Admin
// ============================================================
//
// The platform adapter is an ERC-2771 trusted forwarder that enables
// gasless meta-transactions across all treasury types.
//
// How it works:
//   1. Protocol Admin sets the adapter via `setPlatformAdapter`
//      (this is onlyOwner — the platform admin cannot set it)
//   2. When a treasury is deployed, it receives the adapter address
//   3. Transactions from the adapter extract the real sender from
//      the last 20 bytes of calldata (standard ERC-2771)
//
// Set to the zero address to disable (the default).

async function setPlatformAdapter(): Promise<void> {
  const oak = createOakContractsClient({
    chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
    rpcUrl: process.env.RPC_URL!,
    privateKey: process.env.PROTOCOL_ADMIN_PRIVATE_KEY! as `0x${string}`,
  });

  const globalParams = oak.globalParams(process.env.GLOBAL_PARAMS_ADDRESS! as `0x${string}`);
  const platformHash = keccak256(toHex("NOVAPAY"));
  const adapterAddress = process.env.NOVAPAY_ADAPTER_ADDRESS! as `0x${string}`;

  const txHash = await globalParams.setPlatformAdapter(platformHash, adapterAddress);
  await oak.waitForReceipt(txHash);
  console.log("Platform adapter set to:", adapterAddress);

  const currentAdapter = await globalParams.getPlatformAdapter(platformHash);
  console.log("Current adapter:", currentAdapter);

  // To disable later:
  //   await globalParams.setPlatformAdapter(
  //     platformHash,
  //     "0x0000000000000000000000000000000000000000" as `0x${string}`,
  //   );
}

// ============================================================
// E. Protocol Admin Functions (Protocol Admin Only)
// ============================================================
//
// The functions below are restricted to the contract owner
// (Protocol Admin). Platform admins cannot call them. They are
// listed here for completeness — a platform would coordinate
// with the Oak support team to request any of these actions.

async function protocolAdminExamples(): Promise<void> {
  const oak = createOakContractsClient({
    chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
    rpcUrl: process.env.RPC_URL!,
    privateKey: process.env.PROTOCOL_ADMIN_PRIVATE_KEY! as `0x${string}`,
  });

  const globalParams = oak.globalParams(process.env.GLOBAL_PARAMS_ADDRESS! as `0x${string}`);
  const platformHash = keccak256(toHex("NOVAPAY"));

  // --- Currency management ---
  //
  // The Protocol Admin manages which ERC-20 tokens are accepted
  // for each currency. Campaigns specify a currency (e.g., "USD"),
  // and the protocol resolves it to a list of accepted token addresses.

  const usdCurrency = toHex("USD", { size: 32 });

  // const cusdToken = process.env.CUSD_TOKEN_ADDRESS! as `0x${string}`;
  // const addTokenTx = await globalParams.addTokenToCurrency(usdCurrency, cusdToken);
  // await oak.waitForReceipt(addTokenTx);
  // console.log("cUSD added as accepted token for USD");

  const usdTokens = await globalParams.getTokensForCurrency(usdCurrency);
  console.log("USD accepted tokens:", usdTokens);

  // const removeTokenTx = await globalParams.removeTokenFromCurrency(usdCurrency, cusdToken);
  // await oak.waitForReceipt(removeTokenTx);
  // console.log("cUSD removed from USD currency");

  // --- Global data registry ---
  //
  // A key-value store for protocol-level data (e.g., storing
  // the CampaignInfoFactory address, treasury templates, or
  // other protocol constants).

  // const registryKey = keccak256(toHex("campaignInfoFactory"));
  // const registryValue = toHex(process.env.CAMPAIGN_INFO_FACTORY_ADDRESS!, { size: 32 });
  // const registryTx = await globalParams.addToRegistry(registryKey, registryValue);
  // await oak.waitForReceipt(registryTx);
  // console.log("Registry entry added");

  const factoryKey = keccak256(toHex("campaignInfoFactory"));
  const factoryValue = await globalParams.getFromRegistry(factoryKey);
  console.log("Registry value for 'campaignInfoFactory':", factoryValue);

  // --- Delist a platform ---
  //
  // Removes a platform from the protocol entirely. The platform
  // admin address and fee percent are reset to zero. Existing
  // deployed treasuries continue to function, but no new ones
  // can be created.

  // const delistTx = await globalParams.delistPlatform(platformHash);
  // await oak.waitForReceipt(delistTx);
  // console.log("Platform delisted");

  // --- Update platform admin address ---
  //
  // Changes the admin wallet for a platform. Only the Protocol
  // Admin can do this (not the current platform admin).

  // const newAdmin = process.env.NOVAPAY_NEW_ADMIN_ADDRESS! as `0x${string}`;
  // const updateAdminTx = await globalParams.updatePlatformAdminAddress(platformHash, newAdmin);
  // await oak.waitForReceipt(updateAdminTx);
  // console.log("Platform admin updated to:", newAdmin);

  // --- Update protocol fee percent ---

  // const updateFeeTx = await globalParams.updateProtocolFeePercent(300n); // 3%
  // await oak.waitForReceipt(updateFeeTx);
  // console.log("Protocol fee updated to 300 bps");

  const protocolFee = await globalParams.getProtocolFeePercent();
  console.log("Current protocol fee:", Number(protocolFee), "bps");

  // --- Update protocol admin address ---

  // const newProtocolAdmin = process.env.NEW_PROTOCOL_ADMIN_ADDRESS! as `0x${string}`;
  // const updateProtocolAdminTx = await globalParams.updateProtocolAdminAddress(newProtocolAdmin);
  // await oak.waitForReceipt(updateProtocolAdminTx);
  // console.log("Protocol admin updated");

  const protocolAdmin = await globalParams.getProtocolAdminAddress();
  console.log("Current protocol admin:", protocolAdmin);

  const contractOwner = await globalParams.owner();
  console.log("Contract owner:", contractOwner);
}

// Run the configuration you need:
// await setupLineItemTypes();
// await setClaimDelay();
// await registerPlatformDataKeys();
// await setPlatformAdapter();
// await protocolAdminExamples();
