import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "utils/index": "src/utils/index.ts",
    "constants/index": "src/constants/index.ts",
    "contracts/index": "src/contracts/index.ts",
    "client/index": "src/client/index.ts",
    "errors/index": "src/errors/index.ts",
    "metrics/index": "src/metrics/index.ts",
    "lib/privy/index": "src/lib/privy/index.ts",
  },
  format: ["esm"],
  dts: true,
  splitting: false,
  clean: true,
  sourcemap: false,
});
