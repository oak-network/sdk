import { createOakClient, createCountryService } from "../../src";
import type { CountryService } from "../../src/services";
import { getConfigFromEnv, INTEGRATION_TEST_TIMEOUT } from "../config";

describe("CountryService - Integration", () => {
  let countryService: CountryService;

  beforeAll(() => {
    const client = createOakClient(getConfigFromEnv());
    countryService = createCountryService(client);
  });

  it(
    "should list countries with well-formed entries",
    async () => {
      const result = await countryService.list();

      expect(result.ok).toBe(true);
      if (result.ok) {
        const countries = result.value.data.countries;
        expect(countries.length).toBeGreaterThan(0);

        const first = countries[0];
        expect(first).toHaveProperty("iso_alpha_2");
        expect(first).toHaveProperty("name");
        expect(first).toHaveProperty("kyc_supported");
        expect(typeof first.iso_alpha_2).toBe("string");
        expect(typeof first.name).toBe("string");
        expect(typeof first.kyc_supported).toBe("boolean");
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  it(
    "should return consistent kyc_supported boolean values",
    async () => {
      const result = await countryService.list();

      expect(result.ok).toBe(true);
      if (result.ok) {
        const countries = result.value.data.countries;
        const allBoolean = countries.every(
          (c) => typeof c.kyc_supported === "boolean",
        );
        expect(allBoolean).toBe(true);
      }
    },
    INTEGRATION_TEST_TIMEOUT,
  );
});
