/**
 * Cross-contract type definitions only — no logic, no client dependencies.
 *
 * - structs.ts — on-chain struct mirrors (e.g. reward tuples, item tuples).
 * - params.ts  — SDK-level input types used by write/simulate methods (e.g. campaign creation params, treasury config).
 * - events.ts  — shared event helper types used across all contract event layers (e.g. filter options, decoded logs, watchers).
 */
export * from "./structs";
export * from "./params";
export * from "./events";
