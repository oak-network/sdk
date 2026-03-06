import { normalizeAddresses } from "../../src/preflight/normalizers";

describe("normalizeAddresses", () => {
  it("should checksum lowercase address fields", () => {
    const input = {
      creator: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      other: "hello",
    };
    const result = normalizeAddresses(input, ["creator"]);
    expect(result.creator).toBe("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
    expect(result.other).toBe("hello");
  });

  it("should not modify non-address fields", () => {
    const input = { name: "test", value: 42 };
    const result = normalizeAddresses(input, ["name"]);
    expect(result.name).toBe("test");
  });

  it("should return a shallow clone", () => {
    const input = { creator: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045" };
    const result = normalizeAddresses(input, ["creator"]);
    expect(result).not.toBe(input);
  });

  it("should handle missing fields gracefully", () => {
    const input = { other: "value" };
    const result = normalizeAddresses(input, ["creator"]);
    expect(result).toEqual({ other: "value" });
  });
});
