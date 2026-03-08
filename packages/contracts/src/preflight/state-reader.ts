import type { Address, Hex, PublicClient } from "viem";
import { GLOBAL_PARAMS_ABI } from "../abis/global-params.js";
import { CAMPAIGN_INFO_FACTORY_ABI } from "../abis/campaign-info-factory.js";
import { CAMPAIGN_INFO_ABI } from "../abis/campaign-info.js";
import { PAYMENT_TREASURY_ABI } from "../abis/payment-treasury.js";
import { ALL_OR_NOTHING_ABI } from "../abis/all-or-nothing.js";
import { KEEP_WHATS_RAISED_ABI } from "../abis/keep-whats-raised.js";
import type { StateReader } from "./types.js";

/** Minimal ERC20 ABI for balance and allowance reads. */
const ERC20_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * Creates a state reader for on-chain reads during preflight validation.
 * All reads are memoized per-run and wrapped in try/catch for graceful degradation.
 *
 * @param publicClient - Viem PublicClient for on-chain reads
 * @param blockTag - Block tag for snapshot consistency
 * @returns StateReader instance
 */
export function createStateReader(
  publicClient: PublicClient,
  blockTag: bigint | "latest",
): StateReader {
  const cache = new Map<string, unknown>();

  async function cachedRead<T>(key: string, fn: () => Promise<T>): Promise<T | null> {
    if (cache.has(key)) return cache.get(key) as T | null;
    try {
      const result = await fn();
      cache.set(key, result);
      return result;
    } catch {
      cache.set(key, null);
      return null;
    }
  }

  const blockNumber = blockTag === "latest" ? undefined : blockTag;

  return {
    async getBlockTimestamp(): Promise<bigint | null> {
      return cachedRead("block:timestamp", async () => {
        const block = await publicClient.getBlock(
          blockNumber !== undefined ? { blockNumber } : { blockTag: "latest" },
        );
        return block.timestamp;
      });
    },

    // ── GlobalParams ─────────────────────────────────────────────────────

    async checkIfPlatformIsListed(globalParamsAddress: Address, platformHash: Hex): Promise<boolean | null> {
      return cachedRead(`gp:listed:${globalParamsAddress}:${platformHash}`, () =>
        publicClient.readContract({
          address: globalParamsAddress,
          abi: GLOBAL_PARAMS_ABI,
          functionName: "checkIfPlatformIsListed",
          args: [platformHash],
          ...(blockNumber !== undefined && { blockNumber }),
        }),
      );
    },

    async checkIfPlatformDataKeyValid(globalParamsAddress: Address, key: Hex): Promise<boolean | null> {
      return cachedRead(`gp:dataKeyValid:${globalParamsAddress}:${key}`, () =>
        publicClient.readContract({
          address: globalParamsAddress,
          abi: GLOBAL_PARAMS_ABI,
          functionName: "checkIfPlatformDataKeyValid",
          args: [key],
          ...(blockNumber !== undefined && { blockNumber }),
        }),
      );
    },

    async getTokensForCurrency(globalParamsAddress: Address, currency: Hex): Promise<readonly Address[] | null> {
      return cachedRead(`gp:tokens:${globalParamsAddress}:${currency}`, () =>
        publicClient.readContract({
          address: globalParamsAddress,
          abi: GLOBAL_PARAMS_ABI,
          functionName: "getTokensForCurrency",
          args: [currency],
          ...(blockNumber !== undefined && { blockNumber }),
        }),
      );
    },

    async getFromRegistry(globalParamsAddress: Address, key: Hex): Promise<Hex | null> {
      return cachedRead(`gp:registry:${globalParamsAddress}:${key}`, () =>
        publicClient.readContract({
          address: globalParamsAddress,
          abi: GLOBAL_PARAMS_ABI,
          functionName: "getFromRegistry",
          args: [key],
          ...(blockNumber !== undefined && { blockNumber }),
        }),
      );
    },

    async getPlatformAdminAddress(globalParamsAddress: Address, platformHash: Hex): Promise<Address | null> {
      return cachedRead(`gp:admin:${globalParamsAddress}:${platformHash}`, () =>
        publicClient.readContract({
          address: globalParamsAddress,
          abi: GLOBAL_PARAMS_ABI,
          functionName: "getPlatformAdminAddress",
          args: [platformHash],
          ...(blockNumber !== undefined && { blockNumber }),
        }),
      );
    },

    // ── CampaignInfoFactory ──────────────────────────────────────────────

    async identifierToCampaignInfo(factoryAddress: Address, identifierHash: Hex): Promise<Address | null> {
      return cachedRead(`factory:id:${factoryAddress}:${identifierHash}`, () =>
        publicClient.readContract({
          address: factoryAddress,
          abi: CAMPAIGN_INFO_FACTORY_ABI,
          functionName: "identifierToCampaignInfo",
          args: [identifierHash],
          ...(blockNumber !== undefined && { blockNumber }),
        }),
      );
    },

    // ── CampaignInfo ─────────────────────────────────────────────────────

    async checkIfPlatformSelected(infoAddress: Address, platformHash: Hex): Promise<boolean | null> {
      return cachedRead(`info:selected:${infoAddress}:${platformHash}`, () =>
        publicClient.readContract({
          address: infoAddress,
          abi: CAMPAIGN_INFO_ABI,
          functionName: "checkIfPlatformSelected",
          args: [platformHash],
          ...(blockNumber !== undefined && { blockNumber }),
        }),
      );
    },

    async checkIfPlatformApproved(infoAddress: Address, platformHash: Hex): Promise<boolean | null> {
      return cachedRead(`info:approved:${infoAddress}:${platformHash}`, () =>
        publicClient.readContract({
          address: infoAddress,
          abi: CAMPAIGN_INFO_ABI,
          functionName: "checkIfPlatformApproved",
          args: [platformHash],
          ...(blockNumber !== undefined && { blockNumber }),
        }),
      );
    },

    async isTokenAccepted(infoAddress: Address, token: Address): Promise<boolean | null> {
      return cachedRead(`info:token:${infoAddress}:${token}`, () =>
        publicClient.readContract({
          address: infoAddress,
          abi: CAMPAIGN_INFO_ABI,
          functionName: "isTokenAccepted",
          args: [token],
          ...(blockNumber !== undefined && { blockNumber }),
        }),
      );
    },

    async getLaunchTime(infoAddress: Address): Promise<bigint | null> {
      return cachedRead(`info:launchTime:${infoAddress}`, () =>
        publicClient.readContract({
          address: infoAddress,
          abi: CAMPAIGN_INFO_ABI,
          functionName: "getLaunchTime",
          ...(blockNumber !== undefined && { blockNumber }),
        }),
      );
    },

    async getDeadline(infoAddress: Address): Promise<bigint | null> {
      return cachedRead(`info:deadline:${infoAddress}`, () =>
        publicClient.readContract({
          address: infoAddress,
          abi: CAMPAIGN_INFO_ABI,
          functionName: "getDeadline",
          ...(blockNumber !== undefined && { blockNumber }),
        }),
      );
    },

    async getLineItemType(
      infoAddress: Address,
      platformHash: Hex,
      typeId: Hex,
    ): Promise<{ exists: boolean } | null> {
      return cachedRead(`info:lineItemType:${infoAddress}:${platformHash}:${typeId}`, async () => {
        const result = await publicClient.readContract({
          address: infoAddress,
          abi: CAMPAIGN_INFO_ABI,
          functionName: "getLineItemType",
          args: [platformHash, typeId],
          ...(blockNumber !== undefined && { blockNumber }),
        });
        const [exists] = result as [boolean, string, boolean, boolean, boolean, boolean];
        return { exists };
      });
    },

    // ── Treasury common reads ─────────────────────────────────────────────

    async getPlatformHash(treasuryAddress: Address): Promise<Hex | null> {
      return cachedRead(`treasury:platformHash:${treasuryAddress}`, () =>
        publicClient.readContract({
          address: treasuryAddress,
          abi: PAYMENT_TREASURY_ABI,
          functionName: "getplatformHash",
          ...(blockNumber !== undefined && { blockNumber }),
        }),
      );
    },

    async getCancelled(treasuryAddress: Address): Promise<boolean | null> {
      return cachedRead(`treasury:cancelled:${treasuryAddress}`, () =>
        publicClient.readContract({
          address: treasuryAddress,
          abi: ALL_OR_NOTHING_ABI,
          functionName: "cancelled",
          ...(blockNumber !== undefined && { blockNumber }),
        }),
      );
    },

    async getPaused(treasuryAddress: Address): Promise<boolean | null> {
      return cachedRead(`treasury:paused:${treasuryAddress}`, () =>
        publicClient.readContract({
          address: treasuryAddress,
          abi: ALL_OR_NOTHING_ABI,
          functionName: "paused",
          ...(blockNumber !== undefined && { blockNumber }),
        }),
      );
    },

    async getRaisedAmount(treasuryAddress: Address): Promise<bigint | null> {
      return cachedRead(`treasury:raisedAmount:${treasuryAddress}`, () =>
        publicClient.readContract({
          address: treasuryAddress,
          abi: ALL_OR_NOTHING_ABI,
          functionName: "getRaisedAmount",
          ...(blockNumber !== undefined && { blockNumber }),
        }),
      );
    },

    // ── KWR-specific reads ──────────────────────────────────────────────

    async getWithdrawalApprovalStatus(treasuryAddress: Address): Promise<boolean | null> {
      return cachedRead(`kwr:withdrawalApproval:${treasuryAddress}`, () =>
        publicClient.readContract({
          address: treasuryAddress,
          abi: KEEP_WHATS_RAISED_ABI,
          functionName: "getWithdrawalApprovalStatus",
          ...(blockNumber !== undefined && { blockNumber }),
        }),
      );
    },

    async getGoalAmount(treasuryAddress: Address): Promise<bigint | null> {
      return cachedRead(`kwr:goalAmount:${treasuryAddress}`, () =>
        publicClient.readContract({
          address: treasuryAddress,
          abi: KEEP_WHATS_RAISED_ABI,
          functionName: "getGoalAmount",
          ...(blockNumber !== undefined && { blockNumber }),
        }),
      );
    },

    // ── Treasury reward reads ─────────────────────────────────────────────

    async getReward(
      treasuryAddress: Address,
      rewardName: Hex,
    ): Promise<{ rewardValue: bigint; isRewardTier: boolean } | null> {
      return cachedRead(`reward:${treasuryAddress}:${rewardName}`, async () => {
        // Both AON and KWR share the same getReward(bytes32) signature
        const result = await publicClient.readContract({
          address: treasuryAddress,
          abi: ALL_OR_NOTHING_ABI,
          functionName: "getReward",
          args: [rewardName],
          ...(blockNumber !== undefined && { blockNumber }),
        });
        const data = result as unknown as { rewardValue: bigint; isRewardTier: boolean };
        return { rewardValue: data.rewardValue, isRewardTier: data.isRewardTier };
      });
    },

    // ── PaymentTreasury ──────────────────────────────────────────────────

    async getPaymentData(
      treasuryAddress: Address,
      paymentId: Hex,
    ): Promise<{ buyerAddress: Address; isConfirmed: boolean; expiration: bigint; amount: bigint } | null> {
      return cachedRead(`pt:payment:${treasuryAddress}:${paymentId}`, async () => {
        const result = await publicClient.readContract({
          address: treasuryAddress,
          abi: PAYMENT_TREASURY_ABI,
          functionName: "getPaymentData",
          args: [paymentId],
          ...(blockNumber !== undefined && { blockNumber }),
        });
        const data = result as unknown as {
          buyerAddress: Address;
          isConfirmed: boolean;
          expiration: bigint;
          amount: bigint;
        };
        return {
          buyerAddress: data.buyerAddress,
          isConfirmed: data.isConfirmed,
          expiration: data.expiration,
          amount: data.amount,
        };
      });
    },

    // ── ERC20 ────────────────────────────────────────────────────────────

    async erc20BalanceOf(token: Address, owner: Address): Promise<bigint | null> {
      return cachedRead(`erc20:balance:${token}:${owner}`, () =>
        publicClient.readContract({
          address: token,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [owner],
          ...(blockNumber !== undefined && { blockNumber }),
        }),
      );
    },

    async erc20Allowance(token: Address, owner: Address, spender: Address): Promise<bigint | null> {
      return cachedRead(`erc20:allowance:${token}:${owner}:${spender}`, () =>
        publicClient.readContract({
          address: token,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [owner, spender],
          ...(blockNumber !== undefined && { blockNumber }),
        }),
      );
    },
  };
}
