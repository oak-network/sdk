import { runPreflight } from "../../src/preflight/pipeline";
import type { MethodValidator, PreflightContext, PreflightIssue, StateReader } from "../../src/preflight/types";
import type { Address, PublicClient } from "viem";

function createMockContext(overrides?: Partial<PreflightContext>): PreflightContext {
  return {
    publicClient: {} as PublicClient,
    contractAddress: "0x0000000000000000000000000000000000000001" as Address,
    options: {
      mode: "warn",
      stateful: "enabled",
      collect: true,
      blockTag: "latest",
    },
    stateReader: {} as StateReader,
    addresses: {},
    ...overrides,
  };
}

describe("runPreflight", () => {
  it("should return ok: true when no issues found", async () => {
    const validator: MethodValidator<{ value: string }> = {
      structural: [],
      semantic: [],
      stateful: [],
    };

    const result = await runPreflight({ value: "test" }, validator, createMockContext());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings).toHaveLength(0);
      expect(result.normalized).toEqual({ value: "test" });
    }
  });

  it("should collect structural errors and return ok: false", async () => {
    const validator: MethodValidator<{ value: string }> = {
      structural: [
        () => [{ code: "TEST-ERR", severity: "error", message: "bad value" }],
      ],
      semantic: [],
      stateful: [],
    };

    const result = await runPreflight({ value: "test" }, validator, createMockContext());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].code).toBe("TEST-ERR");
    }
  });

  it("should pass warnings through in warn mode", async () => {
    const validator: MethodValidator<{ value: string }> = {
      structural: [
        () => [{ code: "TEST-WARN", severity: "warn", message: "heads up" }],
      ],
      semantic: [],
      stateful: [],
    };

    const result = await runPreflight({ value: "test" }, validator, createMockContext());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].code).toBe("TEST-WARN");
    }
  });

  it("should block on warnings in strict mode", async () => {
    const validator: MethodValidator<{ value: string }> = {
      structural: [
        () => [{ code: "TEST-WARN", severity: "warn", message: "heads up" }],
      ],
      semantic: [],
      stateful: [],
    };

    const ctx = createMockContext({ options: { mode: "strict", stateful: "enabled", collect: true, blockTag: "latest" } });
    const result = await runPreflight({ value: "test" }, validator, ctx);
    expect(result.ok).toBe(false);
  });

  it("should skip stateful checks when stateful is local-only", async () => {
    let statefulCalled = false;
    const validator: MethodValidator<{ value: string }> = {
      structural: [],
      semantic: [],
      stateful: [
        () => {
          statefulCalled = true;
          return [{ code: "STATE-ERR", severity: "error", message: "fail" }];
        },
      ],
    };

    const ctx = createMockContext({
      options: { mode: "warn", stateful: "local-only", collect: true, blockTag: "latest" },
    });
    const result = await runPreflight({ value: "test" }, validator, ctx);
    expect(statefulCalled).toBe(false);
    expect(result.ok).toBe(true);
  });

  it("should apply normalizer in normalize mode", async () => {
    const validator: MethodValidator<{ name: string }> = {
      structural: [],
      semantic: [],
      stateful: [],
      normalize: (input) => ({ ...input, name: input.name.toUpperCase() }),
    };

    const ctx = createMockContext({
      options: { mode: "normalize", stateful: "enabled", collect: true, blockTag: "latest" },
    });
    const result = await runPreflight({ name: "test" }, validator, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.normalized.name).toBe("TEST");
    }
  });

  it("should not apply normalizer in warn mode", async () => {
    const validator: MethodValidator<{ name: string }> = {
      structural: [],
      semantic: [],
      stateful: [],
      normalize: (input) => ({ ...input, name: input.name.toUpperCase() }),
    };

    const result = await runPreflight({ name: "test" }, validator, createMockContext());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.normalized.name).toBe("test");
    }
  });

  it("should short-circuit on first blocking issue when collect is false", async () => {
    let secondCalled = false;
    const validator: MethodValidator<{ value: string }> = {
      structural: [
        () => [{ code: "FIRST", severity: "error", message: "first" }],
        () => {
          secondCalled = true;
          return [{ code: "SECOND", severity: "error", message: "second" }];
        },
      ],
      semantic: [],
      stateful: [],
    };

    const ctx = createMockContext({
      options: { mode: "warn", stateful: "enabled", collect: false, blockTag: "latest" },
    });
    const result = await runPreflight({ value: "test" }, validator, ctx);
    expect(result.ok).toBe(false);
    expect(secondCalled).toBe(false);
    if (!result.ok) {
      expect(result.issues).toHaveLength(1);
    }
  });

  it("should handle async validation rules", async () => {
    const validator: MethodValidator<{ value: string }> = {
      structural: [],
      semantic: [],
      stateful: [
        async () => [{ code: "ASYNC-ERR", severity: "error", message: "async error" }],
      ],
    };

    const result = await runPreflight({ value: "test" }, validator, createMockContext());
    expect(result.ok).toBe(false);
  });

  it("should emit STATE_UNAVAILABLE warning when stateful rule throws", async () => {
    const validator: MethodValidator<{ value: string }> = {
      structural: [],
      semantic: [],
      stateful: [
        async () => {
          throw new Error("RPC failed");
        },
      ],
    };

    const result = await runPreflight({ value: "test" }, validator, createMockContext());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].code).toBe("OAK-PF-COMMON-STATE_UNAVAILABLE");
    }
  });

  it("should aggregate issues from all phases", async () => {
    const validator: MethodValidator<{ value: string }> = {
      structural: [() => [{ code: "S1", severity: "warn", message: "structural" }]],
      semantic: [() => [{ code: "S2", severity: "warn", message: "semantic" }]],
      stateful: [async () => [{ code: "S3", severity: "warn", message: "stateful" }]],
    };

    const result = await runPreflight({ value: "test" }, validator, createMockContext());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings).toHaveLength(3);
      expect(result.warnings.map((w) => w.code)).toEqual(["S1", "S2", "S3"]);
    }
  });
});
