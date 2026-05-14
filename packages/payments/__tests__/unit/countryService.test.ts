import { createCountryService } from "../../src/services";
import { httpClient } from "../../src/utils/httpClient";
import { ApiError } from "../../src/utils/errorHandler";
import type { OakClient, Country } from "../../src/types";
import { err, ok } from "../../src/types";
import { ENVIRONMENT_URLS } from "../../src/types/environment";

const SANDBOX_URL = ENVIRONMENT_URLS.sandbox;

jest.mock("../../src/utils/httpClient", () => ({
  httpClient: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    postMultipart: jest.fn(),
  },
}));

const mockedHttpClient = httpClient as jest.Mocked<typeof httpClient>;

const retryOptions = { maxNumberOfRetries: 0, delay: 0, backoffFactor: 2 };

const makeClient = (): OakClient => ({
  config: {
    environment: "sandbox",
    clientId: "id",
    baseUrl: SANDBOX_URL,
  },
  retryOptions,
  getAccessToken: jest.fn().mockResolvedValue(ok("token")),
  grantToken: jest.fn(),
});

describe("CountryService (Unit)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("countryService.list success", async () => {
    const client = makeClient();
    const service = createCountryService(client);
    const response: Country.ListResponse = {
      msg: "Success",
      data: {
        countries: [
          { iso_alpha_2: "US", name: "United States", kyc_supported: true },
          { iso_alpha_2: "AF", name: "Afghanistan", kyc_supported: false },
        ],
      },
    };
    mockedHttpClient.get.mockResolvedValue(ok(response) as never);

    const result = await service.list();

    expect(result).toEqual(ok(response));
    expect(mockedHttpClient.get).toHaveBeenCalledWith(
      `${SANDBOX_URL}/api/v1/countries`,
      { retryOptions: client.retryOptions },
    );
  });

  it("countryService.list does not require authentication", async () => {
    const client = makeClient();
    const service = createCountryService(client);
    mockedHttpClient.get.mockResolvedValue(ok({}) as never);

    await service.list();

    expect(client.getAccessToken).not.toHaveBeenCalled();
  });

  it("countryService.list failure", async () => {
    const client = makeClient();
    const service = createCountryService(client);
    const apiError = new ApiError("Failed to list countries", 500, {
      msg: "Failed to list countries",
    });
    mockedHttpClient.get.mockResolvedValue(err(apiError) as never);

    const result = await service.list();

    expect(result).toEqual(err(expect.any(ApiError)));
  });
});
