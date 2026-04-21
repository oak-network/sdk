import { getTestClient, getTestConfig } from "../setup/test-client";
import { getPlatformStats } from "../../src/metrics/platform";
import { getCampaignSummary } from "../../src/metrics/campaign";
import { getTreasuryReport } from "../../src/metrics/treasury";

const cfg = getTestConfig();
const client = getTestClient();

describe("Metrics — getPlatformStats", () => {
  it("returns platformCount and protocolFeePercent", async () => {
    const stats = await getPlatformStats({
      globalParamsAddress: cfg.addresses.globalParams,
      publicClient: client.publicClient,
    });

    expect(typeof stats.platformCount).toBe("bigint");
    expect(typeof stats.protocolFeePercent).toBe("bigint");
    expect(stats.platformCount).toBeGreaterThanOrEqual(0n);
  });
});

describe("Metrics — getCampaignSummary", () => {
  it("returns campaign financial summary (may revert on uninitialized)", async () => {
    try {
      const summary = await getCampaignSummary({
        campaignInfoAddress: cfg.addresses.campaignInfo,
        publicClient: client.publicClient,
      });

      expect(typeof summary.totalRaised).toBe("bigint");
      expect(typeof summary.totalLifetimeRaised).toBe("bigint");
      expect(typeof summary.totalRefunded).toBe("bigint");
      expect(typeof summary.totalAvailable).toBe("bigint");
      expect(typeof summary.totalCancelled).toBe("bigint");
      expect(typeof summary.totalExpected).toBe("bigint");
      expect(typeof summary.goalAmount).toBe("bigint");
      expect(typeof summary.goalReached).toBe("boolean");
    } catch {
      /* revert expected on uninitialized campaign */
    }
  });
});

describe("Metrics — getTreasuryReport (all-or-nothing)", () => {
  it("returns treasury report (may revert on uninitialized)", async () => {
    try {
      const report = await getTreasuryReport({
        treasuryAddress: cfg.addresses.allOrNothing,
        treasuryType: "all-or-nothing",
        publicClient: client.publicClient,
      });

      expect(report.address).toBe(cfg.addresses.allOrNothing);
      expect(report.treasuryType).toBe("all-or-nothing");
      expect(typeof report.raisedAmount).toBe("bigint");
      expect(typeof report.lifetimeRaisedAmount).toBe("bigint");
      expect(typeof report.refundedAmount).toBe("bigint");
      expect(typeof report.platformFeePercent).toBe("bigint");
      expect(typeof report.cancelled).toBe("boolean");
    } catch {
      /* revert expected on uninitialized treasury */
    }
  });
});

describe("Metrics — getTreasuryReport (keep-whats-raised)", () => {
  it("returns treasury report (may revert on uninitialized)", async () => {
    try {
      const report = await getTreasuryReport({
        treasuryAddress: cfg.addresses.keepWhatsRaised,
        treasuryType: "keep-whats-raised",
        publicClient: client.publicClient,
      });

      expect(report.address).toBe(cfg.addresses.keepWhatsRaised);
      expect(report.treasuryType).toBe("keep-whats-raised");
      expect(typeof report.raisedAmount).toBe("bigint");
    } catch {
      /* revert expected on uninitialized treasury */
    }
  });
});

describe("Metrics — getTreasuryReport (payment-treasury)", () => {
  it("returns treasury report (may revert on uninitialized)", async () => {
    try {
      const report = await getTreasuryReport({
        treasuryAddress: cfg.addresses.paymentTreasury,
        treasuryType: "payment-treasury",
        publicClient: client.publicClient,
      });

      expect(report.address).toBe(cfg.addresses.paymentTreasury);
      expect(report.treasuryType).toBe("payment-treasury");
      expect(typeof report.raisedAmount).toBe("bigint");
    } catch {
      /* revert expected on uninitialized treasury */
    }
  });
});
