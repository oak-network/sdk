import type { Hex } from "../lib";

/** Zero bytes32 sentinel value used as a default or unset marker in contract calls. */
export const BYTES32_ZERO: Hex = `0x${"00".repeat(32)}`;
