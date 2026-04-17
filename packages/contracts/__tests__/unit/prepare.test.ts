import type { Address, PublicClient, Chain } from "../../src/lib";
import { prepareContractWrite, toPreparedTransaction } from "../../src/utils/prepare";
import type { SimulationResult } from "../../src/types/events";

const ADDR = "0x0000000000000000000000000000000000000001" as Address;

const TEST_ABI = [
  {
    type: "function" as const,
    name: "transfer",
    stateMutability: "nonpayable" as const,
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

describe("prepareContractWrite", () => {
  it("encodes calldata and estimates gas", async () => {
    const pub = {
      estimateContractGas: jest.fn().mockResolvedValue(50000n),
    } as unknown as PublicClient;

    const mockChain = { id: 1, name: "test" } as Chain;

    const result = await prepareContractWrite(pub, {
      address: ADDR,
      abi: TEST_ABI,
      functionName: "transfer",
      args: [ADDR, 100n],
      account: ADDR,
      chain: mockChain,
    });

    expect(result.to).toBe(ADDR);
    expect(result.data).toMatch(/^0x/);
    expect(result.value).toBe(0n);
    expect(result.gas).toBe(50000n);
    expect(pub.estimateContractGas).toHaveBeenCalled();
  });

  it("propagates error when gas estimation fails", async () => {
    const revertError = new Error("execution reverted: insufficient balance");
    const pub = {
      estimateContractGas: jest.fn().mockRejectedValue(revertError),
    } as unknown as PublicClient;

    const mockChain = { id: 1, name: "test" } as Chain;

    await expect(
      prepareContractWrite(pub, {
        address: ADDR,
        abi: TEST_ABI,
        functionName: "transfer",
        args: [ADDR, 100n],
        account: ADDR,
        chain: mockChain,
      }),
    ).rejects.toThrow("execution reverted: insufficient balance");
  });

  it("passes value through when provided", async () => {
    const pub = {
      estimateContractGas: jest.fn().mockResolvedValue(21000n),
    } as unknown as PublicClient;

    const mockChain = { id: 1, name: "test" } as Chain;

    const result = await prepareContractWrite(pub, {
      address: ADDR,
      abi: TEST_ABI,
      functionName: "transfer",
      args: [ADDR, 100n],
      account: ADDR,
      chain: mockChain,
      value: 500n,
    });

    expect(result.value).toBe(500n);
  });

  it("defaults args to [] when not provided", async () => {
    const NO_ARG_ABI = [
      {
        type: "function" as const,
        name: "ping",
        stateMutability: "nonpayable" as const,
        inputs: [],
        outputs: [],
      },
    ] as const;

    const pub = {
      estimateContractGas: jest.fn().mockResolvedValue(21000n),
    } as unknown as PublicClient;

    const mockChain = { id: 1, name: "test" } as Chain;

    const result = await prepareContractWrite(pub, {
      address: ADDR,
      abi: NO_ARG_ABI,
      functionName: "ping",
      account: ADDR,
      chain: mockChain,
    });

    expect(result.to).toBe(ADDR);
    expect(result.data).toMatch(/^0x/);
    expect(result.value).toBe(0n);
    expect(result.gas).toBe(21000n);
    const callArgs = (pub.estimateContractGas as jest.Mock).mock.calls[0][0];
    expect(callArgs.args).toBeUndefined();
  });
});

describe("toPreparedTransaction", () => {
  it("extracts PreparedTransaction from SimulationResult", () => {
    const simResult: SimulationResult = {
      result: undefined,
      request: {
        to: ADDR,
        data: "0xdeadbeef" as `0x${string}`,
        value: 100n,
        gas: 21000n,
      },
    };

    const prepared = toPreparedTransaction(simResult);
    expect(prepared.to).toBe(ADDR);
    expect(prepared.data).toBe("0xdeadbeef");
    expect(prepared.value).toBe(100n);
    expect(prepared.gas).toBe(21000n);
  });

  it("defaults value to 0n and preserves undefined gas", () => {
    const simResult: SimulationResult = {
      result: undefined,
      request: {
        to: ADDR,
        data: "0x00" as `0x${string}`,
      },
    };

    const prepared = toPreparedTransaction(simResult);
    expect(prepared.value).toBe(0n);
    expect(prepared.gas).toBeUndefined();
  });
});
