/**
 * Public client surface. createOakContractsClient lives in create.ts; resolve, guard,
 * transport, and account are used internally by create/resolve.
 */
export { createOakContractsClient } from "./create";
export { isSimpleConfig } from "./guard";
export type * from "./types";
