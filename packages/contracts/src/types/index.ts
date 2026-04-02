/**
 * Cross-contract type definitions only — no logic, no client dependencies.
 *
 * - structs.ts  — on-chain struct mirrors (e.g. reward tuples, item tuples).
 * - params.ts   — SDK-level input types used by write/simulate methods.
 */
export * from "./structs";
export * from "./params";
