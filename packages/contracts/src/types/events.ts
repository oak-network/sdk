import type { Hex } from "../lib";

/** Options for filtering historical contract event logs. */
export interface EventFilterOptions {
  /** Block number to start searching from. */
  fromBlock?: bigint;
  /** Block number to stop searching at. */
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
