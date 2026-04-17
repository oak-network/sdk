import type { Address, Hex } from "../lib";

/**
 * Options for filtering historical contract event logs.
 *
 * **RPC block range limits:** Public RPCs (e.g. Celo Forno, Infura free tier)
 * typically restrict `eth_getLogs` to a maximum block range per request
 * (commonly 2,000–10,000 blocks). Requesting a range that exceeds this limit
 * will result in an HTTP error or timeout.
 *
 * - If neither `fromBlock` nor `toBlock` is provided, only the **latest block**
 *   is queried (safe for any RPC).
 * - For historical scans across large ranges, split into smaller batches
 *   (e.g. 10,000 blocks per request) or use a dedicated archive/indexing node.
 *
 * @example
 * ```typescript
 * // Latest block only (safe default)
 * const logs = await gp.events.getPlatformEnlistedLogs();
 *
 * // Narrow range (safe for public RPCs)
 * const logs = await gp.events.getPlatformEnlistedLogs({
 *   fromBlock: 48_792_800n,
 *   toBlock:   48_802_800n,
 * });
 * ```
 */
export interface EventFilterOptions {
  /** Block number to start searching from. Omit to query only the latest block. */
  fromBlock?: bigint;
  /** Block number to stop searching at. Omit for the latest block. */
  toBlock?: bigint;
}

/** A decoded contract event log entry. */
export interface DecodedEventLog {
  /** The Solidity event name. */
  eventName: string;
  /** The decoded event arguments keyed by parameter name. */
  args: Record<string, unknown>;
}

/** Raw log shape accepted by decodeLog helpers. */
export interface RawLog {
  /** Log topics (event signature + indexed params). */
  topics: readonly Hex[];
  /** ABI-encoded non-indexed event parameters. */
  data: Hex;
}

/** Callback invoked when a watched event log is received. */
export type EventWatchHandler = (logs: readonly DecodedEventLog[]) => void;

/**
 * Result returned by entity simulate methods. Contains the return value
 * predicted by the simulation and the prepared transaction request that
 * can be used for gas estimation or account-abstraction flows.
 *
 * @typeParam T - Contract function return type (void for most write functions)
 */
export interface SimulationResult<T = unknown> {
  /** The value the contract function would return on-chain. */
  result: T;
  /** Prepared transaction parameters from the simulation. */
  request: {
    /** Target contract address. */
    to: Address;
    /** ABI-encoded calldata. */
    data: Hex;
    /** Native token value to send (wei). */
    value?: bigint;
    /** Estimated gas limit. */
    gas?: bigint;
  };
}
