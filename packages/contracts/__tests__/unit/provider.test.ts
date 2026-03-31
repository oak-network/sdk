import {
  createJsonRpcProvider,
  createWallet,
  createBrowserProvider,
  getSigner,
} from "../../src/lib/viem/provider";
import { sepolia } from "../../src/lib/viem/index";
import type { EIP1193Provider } from "viem";
import { TEST_PRIVATE_KEY, TEST_RPC_URL } from "../setup/constant";

describe("createJsonRpcProvider", () => {
  it("returns a PublicClient with readContract method", () => {
    const provider = createJsonRpcProvider(TEST_RPC_URL, sepolia);
    expect(provider).toBeDefined();
    expect(typeof provider.readContract).toBe("function");
  });

  it("accepts an optional timeout", () => {
    const provider = createJsonRpcProvider(TEST_RPC_URL, sepolia, 60000);
    expect(provider).toBeDefined();
  });
});

describe("createWallet", () => {
  it("returns a Wallet with an account", () => {
    const wallet = createWallet(TEST_PRIVATE_KEY, TEST_RPC_URL, sepolia);
    expect(wallet.account).toBeDefined();
    expect(wallet.account.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it("accepts an optional timeout", () => {
    const wallet = createWallet(TEST_PRIVATE_KEY, TEST_RPC_URL, sepolia, 60000);
    expect(wallet.account).toBeDefined();
  });
});

describe("createBrowserProvider", () => {
  it("returns a PublicClient from an EIP-1193 provider", () => {
    const mockEthereum = {
      request: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
    } as unknown as EIP1193Provider;

    const provider = createBrowserProvider(mockEthereum, sepolia);
    expect(provider).toBeDefined();
    expect(typeof provider.readContract).toBe("function");
  });
});

describe("getSigner", () => {
  it("returns a Wallet when accounts are available", async () => {
    const mockEthereum = {
      request: jest
        .fn()
        .mockResolvedValue(["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"]),
      on: jest.fn(),
      removeListener: jest.fn(),
    } as unknown as EIP1193Provider;

    const signer = await getSigner(mockEthereum, sepolia);
    expect(signer).toBeDefined();
    expect(signer.account).toBeDefined();
  });

  it("throws when no accounts are returned", async () => {
    const mockEthereum = {
      request: jest.fn().mockResolvedValue([]),
      on: jest.fn(),
      removeListener: jest.fn(),
    } as unknown as EIP1193Provider;

    await expect(getSigner(mockEthereum, sepolia)).rejects.toThrow(
      "No accounts found",
    );
  });

  it("throws when accounts is null", async () => {
    const mockEthereum = {
      request: jest.fn().mockResolvedValue(null),
      on: jest.fn(),
      removeListener: jest.fn(),
    } as unknown as EIP1193Provider;

    await expect(getSigner(mockEthereum, sepolia)).rejects.toThrow(
      "No accounts found",
    );
  });
});
