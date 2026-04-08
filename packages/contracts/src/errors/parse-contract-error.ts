import type { Address, Hex } from "../lib";
import { isHex } from "../utils";
import type { ContractErrorBase } from "./base";
import type { SimulationResult } from "../types/events";
import { parseGlobalParamsError } from "./parse/global-params";
import { parseCampaignInfoFactoryError } from "./parse/campaign-info-factory";
import { parseCampaignInfoError } from "./parse/campaign-info";
import { parseAllOrNothingError } from "./parse/all-or-nothing";
import { parseKeepWhatsRaisedError } from "./parse/keep-whats-raised";
import { parseItemRegistryError } from "./parse/item-registry";
import { parsePaymentTreasuryError } from "./parse/payment-treasury";
import { parseTreasuryFactoryError } from "./parse/treasury-factory";

/**
 * Parses raw revert data from a contract call and returns a typed SDK error if the error
 * is recognized. Supports: GlobalParams, CampaignInfoFactory, CampaignInfo, AllOrNothing,
 * KeepWhatsRaised, ItemRegistry, PaymentTreasury, TreasuryFactory.
 * Returns null if the data is not valid or not from a known contract.
 *
 * Use this when you have raw revert data (e.g. from a provider or estimateGas) and want
 * to get a typed, discriminable error with decoded args and optional recovery hints.
 *
 * @param revertData - Hex string (0x + selector + encoded args), e.g. from catch (e) \{ e.data \}
 * @returns Typed ContractErrorBase instance or null
 */
export function parseContractError(revertData: string): ContractErrorBase | null {
  if (!revertData || !isHex(revertData) || revertData.length < 10) {
    return null;
  }

  const data = revertData as Hex;

  return (
    parseGlobalParamsError(data) ??
    parseCampaignInfoFactoryError(data) ??
    parseCampaignInfoError(data) ??
    parseAllOrNothingError(data) ??
    parseKeepWhatsRaisedError(data) ??
    parseItemRegistryError(data) ??
    parsePaymentTreasuryError(data) ??
    parseTreasuryFactoryError(data) ??
    null
  );
}

/**
 * Extracts raw revert hex data by walking the error cause chain.
 * Returns the first `0x`-prefixed hex string found in `error.data` or `error.data.data`,
 * or null if none is present.
 *
 * @param error - Unknown thrown value from a viem contract call
 * @returns Hex revert data string or null
 */
export function getRevertData(error: unknown): string | null {
  let current: unknown = error;
  while (current && typeof current === "object") {
    const e = current as Record<string, unknown>;
    if (typeof e["data"] === "string" && (e["data"] as string).startsWith("0x")) {
      return e["data"] as string;
    }
    if (typeof e["raw"] === "string" && (e["raw"] as string).startsWith("0x")) {
      return e["raw"] as string;
    }
    if (
      e["data"] &&
      typeof e["data"] === "object" &&
      typeof (e["data"] as Record<string, unknown>)["data"] === "string"
    ) {
      return (e["data"] as Record<string, unknown>)["data"] as string;
    }
    current = e["cause"];
  }
  return null;
}

/**
 * Wraps a simulateContract call, catches reverts, decodes them via parseContractError,
 * and re-throws as a typed SDK error. On success, returns the raw simulation response
 * from viem (`{ result, request }`).
 *
 * @param operation - Async function that calls simulateContract
 * @returns The raw viem simulation response
 * @throws Typed ContractErrorBase subclass on revert, or the original error if not decodable
 */
export async function simulateWithErrorDecode<T = unknown>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error: unknown) {
    const revertData = getRevertData(error);
    const parsed = parseContractError(revertData ?? "");
    if (parsed) {
      throw parsed;
    }
    throw error;
  }
}

/**
 * Converts the raw viem simulateContract response into the SDK's SimulationResult shape.
 *
 * @param response - Raw response from publicClient.simulateContract
 * @returns SimulationResult with the contract return value and prepared transaction params
 */
export function toSimulationResult<T>(response: { result: T; request: Record<string, unknown> }): SimulationResult<T> {
  const req = response.request;
  return {
    result: response.result,
    request: {
      to: req["to"] as Address,
      data: req["data"] as Hex,
      value: req["value"] as bigint | undefined,
      gas: req["gas"] as bigint | undefined,
    },
  };
}
