import { getPlatformStats } from "../../src/metrics/platform";
import { getCampaignSummary } from "../../src/metrics/campaign";
import { getTreasuryReport } from "../../src/metrics/treasury";

describe("metrics stubs", () => {
  it("getPlatformStats returns empty object", async () => {
    const result = await getPlatformStats();
    expect(result).toEqual({});
  });

  it("getCampaignSummary returns empty object", async () => {
    const result = await getCampaignSummary("0x1234567890abcdef1234567890abcdef12345678");
    expect(result).toEqual({});
  });

  it("getTreasuryReport returns empty object", async () => {
    const result = await getTreasuryReport("0x1234567890abcdef1234567890abcdef12345678");
    expect(result).toEqual({});
  });
});
