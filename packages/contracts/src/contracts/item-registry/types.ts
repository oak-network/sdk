import type { Address, Hex } from "../../lib";
import type { Item } from "../../types/structs";

/** Read-only methods for ItemRegistry. */
export interface ItemRegistryReads {
  /** Returns the Item struct registered under the given owner address and item ID. */
  getItem(owner: Address, itemId: Hex): Promise<Item>;
}

/** Write methods for ItemRegistry. */
export interface ItemRegistryWrites {
  /** Registers a single item under the caller's address with the given item ID. */
  addItem(itemId: Hex, item: Item): Promise<Hex>;
  /** Registers multiple items in a single transaction; itemIds and items must be the same length. */
  addItemsBatch(itemIds: readonly Hex[], items: readonly Item[]): Promise<Hex>;
}

/** Simulate counterparts for ItemRegistry write methods. */
export interface ItemRegistrySimulate {
  /** Simulates addItem; throws a typed error on revert. */
  addItem(itemId: Hex, item: Item): Promise<void>;
  /** Simulates addItemsBatch; throws a typed error on revert. */
  addItemsBatch(itemIds: readonly Hex[], items: readonly Item[]): Promise<void>;
}

/** Event helpers for ItemRegistry. */
export interface ItemRegistryEvents {}

/** Full ItemRegistry entity (reads, writes, simulate, events). */
export type ItemRegistryEntity = ItemRegistryReads &
  ItemRegistryWrites & {
    simulate: ItemRegistrySimulate;
    events: ItemRegistryEvents;
  };
