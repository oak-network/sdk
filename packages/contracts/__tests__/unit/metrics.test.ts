import type { Address, PublicClient } from "../../src/lib";
import { getPlatformStats } from "../../src/metrics/platform";
import { getCampaignSummary } from "../../src/metrics/campaign";
import { getTreasuryReport } from "../../src/metrics/treasury";
import { multicall } from "../../src/utils/multicall";
import type { TreasuryType } from "../../src/metrics/types";

const ADDR = "0x0000000000000000000000000000000000000001" as Address;

/**
 * Builds a mock PublicClient whose `.readContract` resolves per-functionName.
 */
function mockPublicClient(returnValues: Record<string, unknown> = {}): PublicClient {
  return {
    readContract: jest.fn().mockImplementation(
      ({ functionName }: { functionName: string }) =>
        Promise.resolve(
          functionName in returnValues ? returnValues[functionName] : 0n,
        ),
    ),
  } as unknown as PublicClient;
}

// ──────────────────────────────────────────────────────────────────────────────
// multicall utility
// ──────────────────────────────────────────────────────────────────────────────

describe("multicall utility", () => {
  it("runs all closures concurrently and returns results in order", async () => {
    const results = await multicall([
      () => Promise.resolve(5n),
      () => Promise.resolve("hello"),
      () => Promise.resolve(true),
    ]);

    expect(results).toEqual([5n, "hello", true]);
  });

  it("returns an empty array for empty input", async () => {
    const results = await multicall([]);
    expect(results).toEqual([]);
  });

  it("propagates errors from failed closures", async () => {
    await expect(
      multicall([
        () => Promise.resolve(1n),
        () => Promise.reject(new Error("boom")),
      ]),
    ).rejects.toThrow("boom");
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// getPlatformStats
// ──────────────────────────────────────────────────────────────────────────────

describe("getPlatformStats", () => {
  it("returns platform count and protocol fee percent from GlobalParams", async () => {
    const pub = mockPublicClient({
      getNumberOfListedPlatforms: 5n,
      getProtocolFeePercent: 250n,
    });

    const stats = await getPlatformStats({
      globalParamsAddress: ADDR,
      publicClient: pub,
    });

    expect(stats.platformCount).toBe(5n);
    expect(stats.protocolFeePercent).toBe(250n);
    expect(pub.readContract).toHaveBeenCalledTimes(2);
  });

  it("returns zero values when contract returns defaults", async () => {
    const pub = mockPublicClient();

    const stats = await getPlatformStats({
      globalParamsAddress: ADDR,
      publicClient: pub,
    });

    expect(stats.platformCount).toBe(0n);
    expect(stats.protocolFeePercent).toBe(0n);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// getCampaignSummary
// ──────────────────────────────────────────────────────────────────────────────

describe("getCampaignSummary", () => {
  it("returns all aggregated campaign values", async () => {
    const pub = mockPublicClient({
      getTotalRaisedAmount: 1000n,
      getTotalLifetimeRaisedAmount: 1200n,
      getTotalRefundedAmount: 200n,
      getTotalAvailableRaisedAmount: 800n,
      getTotalCancelledAmount: 50n,
      getTotalExpectedAmount: 300n,
      getGoalAmount: 500n,
    });

    const summary = await getCampaignSummary({
      campaignInfoAddress: ADDR,
      publicClient: pub,
    });

    expect(summary.totalRaised).toBe(1000n);
    expect(summary.totalLifetimeRaised).toBe(1200n);
    expect(summary.totalRefunded).toBe(200n);
    expect(summary.totalAvailable).toBe(800n);
    expect(summary.totalCancelled).toBe(50n);
    expect(summary.totalExpected).toBe(300n);
    expect(summary.goalAmount).toBe(500n);
    expect(summary.goalReached).toBe(true);
    expect(pub.readContract).toHaveBeenCalledTimes(7);
  });

  it("sets goalReached to false when raised < goal", async () => {
    const pub = mockPublicClient({
      getTotalRaisedAmount: 100n,
      getGoalAmount: 500n,
    });

    const summary = await getCampaignSummary({
      campaignInfoAddress: ADDR,
      publicClient: pub,
    });

    expect(summary.goalReached).toBe(false);
  });

  it("sets goalReached to true when raised equals goal exactly", async () => {
    const pub = mockPublicClient({
      getTotalRaisedAmount: 500n,
      getGoalAmount: 500n,
    });

    const summary = await getCampaignSummary({
      campaignInfoAddress: ADDR,
      publicClient: pub,
    });

    expect(summary.goalReached).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// getTreasuryReport
// ──────────────────────────────────────────────────────────────────────────────

describe("getTreasuryReport", () => {
  const treasuryTypes: TreasuryType[] = [
    "all-or-nothing",
    "keep-whats-raised",
    "payment-treasury",
  ];

  it.each(treasuryTypes)(
    "returns correct report for %s treasury",
    async (treasuryType) => {
      const feeFnName =
        treasuryType === "payment-treasury"
          ? "getplatformFeePercent"
          : "getPlatformFeePercent";

      const pub = mockPublicClient({
        getRaisedAmount: 5000n,
        getLifetimeRaisedAmount: 7000n,
        getRefundedAmount: 2000n,
        [feeFnName]: 300n,
        cancelled: false,
      });

      const report = await getTreasuryReport({
        treasuryAddress: ADDR,
        treasuryType,
        publicClient: pub,
      });

      expect(report.address).toBe(ADDR);
      expect(report.treasuryType).toBe(treasuryType);
      expect(report.raisedAmount).toBe(5000n);
      expect(report.lifetimeRaisedAmount).toBe(7000n);
      expect(report.refundedAmount).toBe(2000n);
      expect(report.platformFeePercent).toBe(300n);
      expect(report.cancelled).toBe(false);
      expect(pub.readContract).toHaveBeenCalledTimes(5);
    },
  );

  it("reports cancelled treasury", async () => {
    const pub = mockPublicClient({
      cancelled: true,
    });

    const report = await getTreasuryReport({
      treasuryAddress: ADDR,
      treasuryType: "all-or-nothing",
      publicClient: pub,
    });

    expect(report.cancelled).toBe(true);
  });
});
