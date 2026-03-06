/**
 * All protocol types are defined in client.ts and re-exported here.
 * Struct types (CampaignData, TieredReward, LineItem, etc.) live alongside
 * the entity interfaces so they can reference each other without circular imports.
 */
export * from "./client";
export * from "./config-options";
