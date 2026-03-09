import type { Address, Hex } from "viem";
import type {
  OakContractsClient,
} from "../types/index.js";
import type { ContractErrorBase } from "../errors/contract-error.js";
import { parseContractError } from "../errors/parse-contract-error.js";
import type {
  PreflightOptions,
  SafeResult,
  SafeMethodDescriptor,
  ResolvedPreflightOptions,
  PreflightContext,
} from "./types.js";
import { runPreflight } from "./pipeline.js";
import { createStateReader } from "./state-reader.js";
import { MissingSignerError } from "./errors.js";

// ─── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Attempts to extract revert data from a viem error and parse it into a typed contract error.
 * Viem errors nest revert data in cause chains; this walks up to 3 levels deep.
 */
function tryExtractContractError(error: unknown): ContractErrorBase | undefined {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current != null; depth++) {
    const err = current as Record<string, unknown>;
    if (typeof err.data === "string" && err.data.startsWith("0x")) {
      const parsed = parseContractError(err.data);
      if (parsed) return parsed;
    }
    current = err.cause ?? err.error;
  }
  return undefined;
}

function resolveOptions(
  defaults: PreflightOptions | undefined,
  overrides: PreflightOptions | undefined,
): ResolvedPreflightOptions {
  return {
    mode: overrides?.mode ?? defaults?.mode ?? "warn",
    stateful: overrides?.stateful ?? defaults?.stateful ?? "enabled",
    collect: overrides?.collect ?? defaults?.collect ?? true,
    blockTag: overrides?.blockTag ?? defaults?.blockTag ?? "latest",
    effectiveSender: overrides?.effectiveSender ?? defaults?.effectiveSender,
  };
}

function buildContext(
  client: OakContractsClient,
  contractAddress: Address,
  options: ResolvedPreflightOptions,
  addresses: Record<string, Address>,
): PreflightContext {
  const stateReader = createStateReader(client.publicClient, options.blockTag);

  const resolvedOptions = options.effectiveSender
    ? options
    : {
        ...options,
        effectiveSender: client.walletClient.account?.address,
      };

  return {
    publicClient: client.publicClient,
    contractAddress,
    options: resolvedOptions,
    stateReader,
    addresses,
  };
}

// ─── Public ────────────────────────────────────────────────────────────────────

/**
 * Creates a safe() function for a single contract method.
 *
 * The safe() flow:
 * 1. Check signer exists → throw `MissingSignerError` if absent
 * 2. Run preflight validation → return `{ ok: false, stage: 'preflight' }` on failure
 * 3. Simulate the contract call → return `{ ok: false, stage: 'simulation' }` on revert
 * 4. Send the transaction → return `{ ok: true, txHash, warnings }`
 *
 * @param client - The base OakContractsClient
 * @param contractAddress - The target contract address
 * @param descriptor - Method descriptor with validator, ABI, functionName, and toArgs mapper
 * @param defaultOptions - Default preflight options
 * @param addresses - Named addresses needed by validators
 * @returns A function `(input, options?) => Promise<SafeResult>`
 */
export function createSafeFn<TInput>(
  client: OakContractsClient,
  contractAddress: Address,
  descriptor: SafeMethodDescriptor<TInput>,
  defaultOptions: PreflightOptions | undefined,
  addresses: Record<string, Address>,
): (input: TInput, options?: PreflightOptions) => Promise<SafeResult> {
  return async (input: TInput, options?: PreflightOptions): Promise<SafeResult> => {
    // 1. Signer check — fail fast before any async work
    const account = client.walletClient.account;
    if (!account) {
      throw new MissingSignerError();
    }

    // 2. Preflight validation
    const resolved = resolveOptions(defaultOptions, options);
    const ctx = buildContext(client, contractAddress, resolved, addresses);
    const preflightResult = await runPreflight(input, descriptor.validator, ctx);

    if (!preflightResult.ok) {
      return { ok: false, stage: "preflight", issues: preflightResult.issues };
    }

    // Use normalized input (when mode: 'normalize') for simulation
    const normalizedInput = preflightResult.normalized;
    const args = descriptor.toArgs(normalizedInput);

    // 3. Simulation via publicClient.simulateContract
    let request: unknown;
    try {
      const simulationResult = await (client.publicClient as Record<string, unknown> & typeof client.publicClient).simulateContract({
        address: contractAddress,
        abi: descriptor.abi as readonly Record<string, unknown>[],
        functionName: descriptor.functionName,
        args: args as unknown[],
        account,
        chain: client.config.chain,
      });
      request = (simulationResult as { request: unknown }).request;
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : String(error);
      const contractError = tryExtractContractError(error);
      return { ok: false, stage: "simulation", reason, cause: error, contractError };
    }

    // 4. Send transaction
    let txHash: Hex;
    try {
      txHash = await client.walletClient.writeContract(
        request as {
          address: Address;
          abi: readonly unknown[];
          functionName: string;
          args: readonly unknown[];
          account: typeof account;
          chain: typeof client.config.chain;
        },
      ) as Hex;
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : String(error);
      const contractError = tryExtractContractError(error);
      return { ok: false, stage: "send", reason, cause: error, contractError };
    }

    return {
      ok: true,
      txHash,
      warnings: preflightResult.warnings,
    };
  };
}
