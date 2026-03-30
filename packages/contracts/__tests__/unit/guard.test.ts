import { isSimpleConfig } from "../../src/client/guard";
import type { OakContractsClientConfig } from "../../src/client/types";

describe("isSimpleConfig", () => {
  const valid: OakContractsClientConfig = {
    chainId: 11142220,
    rpcUrl: "https://rpc.example.com",
    privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  };

  it("returns true for a valid simple config", () => {
    expect(isSimpleConfig(valid)).toBe(true);
  });

  it("returns false when chainId is missing", () => {
    const { chainId, ...rest } = valid as unknown as Record<string, unknown>;
    expect(isSimpleConfig(rest as unknown as OakContractsClientConfig)).toBe(false);
  });

  it("returns false when rpcUrl is missing", () => {
    const { rpcUrl, ...rest } = valid as unknown as Record<string, unknown>;
    expect(isSimpleConfig(rest as unknown as OakContractsClientConfig)).toBe(false);
  });

  it("returns false when privateKey is missing", () => {
    const { privateKey, ...rest } = valid as unknown as Record<string, unknown>;
    expect(isSimpleConfig(rest as unknown as OakContractsClientConfig)).toBe(false);
  });

  it("returns false when chainId is not a number", () => {
    expect(
      isSimpleConfig({ ...valid, chainId: "11142220" } as unknown as OakContractsClientConfig),
    ).toBe(false);
  });

  it("returns false when rpcUrl is not a string", () => {
    expect(
      isSimpleConfig({ ...valid, rpcUrl: 123 } as unknown as OakContractsClientConfig),
    ).toBe(false);
  });

  it("returns false when rpcUrl is empty", () => {
    expect(
      isSimpleConfig({ ...valid, rpcUrl: "" } as unknown as OakContractsClientConfig),
    ).toBe(false);
  });

  it("returns false when privateKey is not a string", () => {
    expect(
      isSimpleConfig({ ...valid, privateKey: 42 } as unknown as OakContractsClientConfig),
    ).toBe(false);
  });

  it("returns false when privateKey does not start with 0x", () => {
    expect(
      isSimpleConfig({
        ...valid,
        privateKey: "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      } as unknown as OakContractsClientConfig),
    ).toBe(false);
  });

  it("returns false for a full config shape", () => {
    const full: OakContractsClientConfig = {
      chain: 11142220,
      provider: {} as never,
      signer: {} as never,
    };
    expect(isSimpleConfig(full)).toBe(false);
  });
});
