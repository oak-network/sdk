import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "utils/index": "src/utils/index.ts",
    "contracts/index": "src/contracts/index.ts",
    "client/index": "src/client/index.ts",
    "preflight/index": "src/preflight/index.ts",
  },
  format: ["esm"],
  dts: true,
  splitting: false,
  clean: true,
  sourcemap: false,
});
