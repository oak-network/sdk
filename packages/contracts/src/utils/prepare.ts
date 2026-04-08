import type { Address, Hex, PublicClient, Chain } from "../lib";
import { encodeFunctionData } from "../lib";
import type { SimulationResult } from "../types/events";

/**
 * Options for preparing a contract write transaction.
 *
 * @typeParam TAbi - ABI type (inferred from the contract ABI constant)
 */
export interface PrepareWriteOptions<TAbi extends readonly unknown[] = readonly unknown[]> {
  /** Target contract address. */
  address: Address;
  /** Contract ABI (use an exported ABI constant, e.g. GLOBAL_PARAMS_ABI). */
  abi: TAbi;
  /** The contract function name to call. */
  functionName: string;
  /** Arguments to pass to the contract function. */
  args?: readonly unknown[];
  /** Native token value to send (wei). Defaults to 0. */
  value?: bigint;
  /** Account address that would send the transaction — required for gas estimation. */
  account: Address;
  /** Chain for gas estimation. */
  chain: Chain;
}

/**
 * Raw transaction parameters returned by prepareContractWrite.
 * Suitable for account-abstraction UserOps, Safe multisig batching,
 * or any flow that needs calldata without actually sending a transaction.
 */
export interface PreparedTransaction {
  /** Target contract address. */
  to: Address;
  /** ABI-encoded calldata. */
  data: Hex;
  /** Native token value to send (wei). */
  value: bigint;
  /** Estimated gas limit. */
  gas: bigint;
}

/**
 * Encodes calldata and estimates gas for a contract write without sending it.
 * Combines `encodeFunctionData` and `estimateContractGas` into a single call
 * that returns the raw transaction parameters needed for account-abstraction
 * wallets, Safe multisig batching, or any custom signing flow.
 *
 * @param publicClient - Viem PublicClient for gas estimation
 * @param options - Contract call parameters (address, abi, functionName, args, account, chain)
 * @returns PreparedTransaction with to, data, value, and gas
 *
 * @example
 * ```typescript
 * import { prepareContractWrite, GLOBAL_PARAMS_ABI } from "@oaknetwork/contracts";
 *
 * const tx = await prepareContractWrite(oak.publicClient, {
 *   address: "0x...",
 *   abi: GLOBAL_PARAMS_ABI,
 *   functionName: "enlistPlatform",
 *   args: [platformHash, adminAddress, feePercent, adapterAddress],
 *   account: "0xMyWallet...",
 *   chain: oak.config.chain,
 * });
 * // tx = { to, data, value, gas }
 * ```
 */
export async function prepareContractWrite(
  publicClient: PublicClient,
  options: PrepareWriteOptions,
): Promise<PreparedTransaction> {
  const data = encodeFunctionData({
    abi: options.abi,
    functionName: options.functionName,
    args: options.args as unknown[],
  });

  const gas = await publicClient.estimateContractGas({
    address: options.address,
    abi: options.abi,
    functionName: options.functionName,
    args: options.args as unknown[],
    account: options.account,
    chain: options.chain,
    value: options.value,
  } as Parameters<PublicClient["estimateContractGas"]>[0]);

  return {
    to: options.address,
    data,
    value: options.value ?? 0n,
    gas,
  };
}

/**
 * Extracts a PreparedTransaction from a SimulationResult.
 * Convenient when you already have a simulation result and want the raw
 * transaction params for account-abstraction or multisig flows.
 *
 * @param result - SimulationResult returned from an entity simulate method
 * @returns PreparedTransaction with to, data, value, and gas
 */
export function toPreparedTransaction(result: SimulationResult): PreparedTransaction {
  return {
    to: result.request.to,
    data: result.request.data,
    value: result.request.value ?? 0n,
    gas: result.request.gas ?? 0n,
  };
}
