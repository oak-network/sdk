import { buildUrl } from "../../src/utils/buildUrl";

describe("buildUrl", () => {
  it("should join URL segments correctly", () => {
    const result = buildUrl("https://api.oak.com", "api/v1", "customers");
    expect(result).toBe("https://api.oak.com/api/v1/customers");
  });

  it("should handle trailing slashes", () => {
    const result = buildUrl("https://api.oak.com/", "api/v1/", "customers/");
    expect(result).toBe("https://api.oak.com/api/v1/customers");
  });

  it("should handle single segment", () => {
    const result = buildUrl("https://api.oak.com");
    expect(result).toBe("https://api.oak.com");
  });

  it("should filter out undefined segments", () => {
    const result = buildUrl(
      "https://api.oak.com",
      "api/v1",
      undefined,
      "customers",
    );
    expect(result).toBe("https://api.oak.com/api/v1/customers");
  });

  it("should filter out empty string segments", () => {
    const result = buildUrl("https://api.oak.com", "api/v1", "", "customers");
    expect(result).toBe("https://api.oak.com/api/v1/customers");
  });

  it("should handle resource IDs", () => {
    const customerId = "cust_123";
    const result = buildUrl(
      "https://api.oak.com",
      "api/v1/customers",
      customerId,
    );
    expect(result).toBe("https://api.oak.com/api/v1/customers/cust_123");
  });

  it("should handle complex paths", () => {
    const result = buildUrl(
      "https://api.oak.com",
      "api/v1",
      "customers",
      "cust_123",
      "payments",
    );
    expect(result).toBe(
      "https://api.oak.com/api/v1/customers/cust_123/payments",
    );
  });

  it("should work with localhost URLs", () => {
    const result = buildUrl("http://localhost:3000", "api", "test");
    expect(result).toBe("http://localhost:3000/api/test");
  });
});
