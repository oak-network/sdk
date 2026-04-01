import type { Address, Hex } from "../../lib";
import type { Item } from "../../types/structs";
import type { DecodedEventLog, EventFilterOptions, EventWatchHandler, RawLog } from "../../types/events";
import type { CallSignerOptions } from "../../client/types";

/** Read-only methods for ItemRegistry. */
export interface ItemRegistryReads {
  /** Returns the Item struct registered under the given owner address and item ID. */
  getItem(owner: Address, itemId: Hex): Promise<Item>;
}

/** Write methods for ItemRegistry. */
export interface ItemRegistryWrites {
  /** Registers a single item under the caller's address with the given item ID. */
  addItem(itemId: Hex, item: Item, options?: CallSignerOptions): Promise<Hex>;
  /** Registers multiple items in a single transaction; itemIds and items must be the same length. */
  addItemsBatch(itemIds: readonly Hex[], items: readonly Item[], options?: CallSignerOptions): Promise<Hex>;
}

/** Simulate counterparts for ItemRegistry write methods. */
export interface ItemRegistrySimulate {
  /** Simulates addItem; throws a typed error on revert. */
  addItem(itemId: Hex, item: Item, options?: CallSignerOptions): Promise<void>;
  /** Simulates addItemsBatch; throws a typed error on revert. */
  addItemsBatch(itemIds: readonly Hex[], items: readonly Item[], options?: CallSignerOptions): Promise<void>;
}

/** Event helpers for ItemRegistry. */
export interface ItemRegistryEvents {
  /** Returns decoded ItemAdded event logs. */
  getItemAddedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Decodes a raw log entry against all known ItemRegistry events. */
  decodeLog(log: RawLog): DecodedEventLog;
  /** Watches for ItemAdded events in real time. Returns an unwatch function. */
  watchItemAdded(onLogs: EventWatchHandler): () => void;
}

/** Full ItemRegistry entity (reads, writes, simulate, events). */
export type ItemRegistryEntity = ItemRegistryReads &
  ItemRegistryWrites & {
    simulate: ItemRegistrySimulate;
    events: ItemRegistryEvents;
  };
