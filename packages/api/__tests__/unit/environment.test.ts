import {
  resolveBaseUrl,
  isTestEnvironment,
  getEnvironmentConfigs,
  OakEnvironment,
} from "../../src/types/environment";
import {
  EnvironmentViolationError,
  SDKError,
} from "../../src/utils/errorHandler";
import { SandboxOnly, sandboxOnlyFn } from "../../src/decorators/sandboxOnly";
import type { ResolvedOakClientConfig } from "../../src/types/client";

describe("Environment Configuration", () => {
  describe("getEnvironmentConfigs", () => {
    it("should have sandbox config with test operations allowed", () => {
      const configs = getEnvironmentConfigs();
      expect(configs.sandbox).toBeDefined();
      expect(configs.sandbox.allowsTestOperations).toBe(true);
      expect(configs.sandbox.apiUrl).toBe(process.env.CROWDSPLIT_SANDBOX_URL);
    });

    it("should have production config with test operations disallowed", () => {
      const configs = getEnvironmentConfigs();
      expect(configs.production).toBeDefined();
      expect(configs.production.allowsTestOperations).toBe(false);
      expect(configs.production.apiUrl).toBe(process.env.CROWDSPLIT_PRODUCTION_URL);
    });

    it("should throw error when env vars are missing", () => {
      const originalSandbox = process.env.CROWDSPLIT_SANDBOX_URL;
      const originalProd = process.env.CROWDSPLIT_PRODUCTION_URL;
      delete process.env.CROWDSPLIT_SANDBOX_URL;
      delete process.env.CROWDSPLIT_PRODUCTION_URL;

      expect(() => getEnvironmentConfigs()).toThrow(
        "Missing required environment variables"
      );

      process.env.CROWDSPLIT_SANDBOX_URL = originalSandbox;
      process.env.CROWDSPLIT_PRODUCTION_URL = originalProd;
    });
  });

  describe("resolveBaseUrl", () => {
    it("should return sandbox URL for sandbox environment", () => {
      const url = resolveBaseUrl("sandbox");
      expect(url).toBe(process.env.CROWDSPLIT_SANDBOX_URL);
    });

    it("should return production URL for production environment", () => {
      const url = resolveBaseUrl("production");
      expect(url).toBe(process.env.CROWDSPLIT_PRODUCTION_URL);
    });

    it("should return customUrl when provided", () => {
      const customUrl = "http://localhost:3000";
      const url = resolveBaseUrl("sandbox", customUrl);
      expect(url).toBe(customUrl);
    });

    it("should use customUrl over environment URL when both provided", () => {
      const customUrl = "http://localhost:3000";
      const url = resolveBaseUrl("production", customUrl);
      expect(url).toBe(customUrl);
    });
  });

  describe("isTestEnvironment", () => {
    it("should return true for sandbox", () => {
      expect(isTestEnvironment("sandbox")).toBe(true);
    });

    it("should return false for production", () => {
      expect(isTestEnvironment("production")).toBe(false);
    });
  });
});

describe("EnvironmentViolationError", () => {
  it("should be an instance of SDKError", () => {
    const error = new EnvironmentViolationError("testMethod", "production");
    expect(error).toBeInstanceOf(SDKError);
    expect(error).toBeInstanceOf(Error);
  });

  it("should have correct name", () => {
    const error = new EnvironmentViolationError("testMethod", "production");
    expect(error.name).toBe("EnvironmentViolationError");
  });

  it("should store method name and environment", () => {
    const error = new EnvironmentViolationError("resetAccount", "production");
    expect(error.methodName).toBe("resetAccount");
    expect(error.environment).toBe("production");
  });

  it("should have descriptive message", () => {
    const error = new EnvironmentViolationError("resetAccount", "production");
    expect(error.message).toContain("resetAccount");
    expect(error.message).toContain("sandbox");
    expect(error.message).toContain("production");
  });
});

describe("@SandboxOnly Decorator", () => {
  const createMockConfig = (
    environment: OakEnvironment
  ): ResolvedOakClientConfig => ({
    environment,
    clientId: "test-id",
    clientSecret: "test-secret",
    baseUrl: environment === "sandbox" 
      ? process.env.CROWDSPLIT_SANDBOX_URL! 
      : process.env.CROWDSPLIT_PRODUCTION_URL!,
  });

  describe("with missing descriptor value", () => {
    it("should return early if descriptor.value is undefined", () => {
      const descriptor: TypedPropertyDescriptor<() => void> = {
        value: undefined,
      };
      const result = SandboxOnly({}, "testMethod", descriptor);
      expect(result).toBeUndefined();
      expect(descriptor.value).toBeUndefined();
    });
  });

  describe("with class that has config property", () => {
    class TestServiceWithConfig {
      config: ResolvedOakClientConfig;

      constructor(environment: OakEnvironment) {
        this.config = createMockConfig(environment);
      }

      @SandboxOnly
      async destructiveOperation(): Promise<string> {
        return "operation completed";
      }

      @SandboxOnly
      syncOperation(): string {
        return "sync completed";
      }
    }

    it("should allow execution in sandbox environment", async () => {
      const service = new TestServiceWithConfig("sandbox");
      const result = await service.destructiveOperation();
      expect(result).toBe("operation completed");
    });

    it("should allow sync execution in sandbox environment", () => {
      const service = new TestServiceWithConfig("sandbox");
      const result = service.syncOperation();
      expect(result).toBe("sync completed");
    });

    it("should throw EnvironmentViolationError in production", () => {
      const service = new TestServiceWithConfig("production");
      expect(() => service.destructiveOperation()).toThrow(
        EnvironmentViolationError
      );
    });

    it("should throw with correct method name in error", () => {
      const service = new TestServiceWithConfig("production");
      try {
        service.destructiveOperation();
        fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(EnvironmentViolationError);
        expect((error as EnvironmentViolationError).methodName).toBe(
          "destructiveOperation"
        );
        expect((error as EnvironmentViolationError).environment).toBe(
          "production"
        );
      }
    });
  });

  describe("with symbol property key", () => {
    const symbolMethod = Symbol("symbolMethod");

    class TestServiceWithSymbol {
      config: ResolvedOakClientConfig;

      constructor(environment: OakEnvironment) {
        this.config = createMockConfig(environment);
      }

      @SandboxOnly
      [symbolMethod](): string {
        return "symbol method completed";
      }
    }

    it("should allow symbol method execution in sandbox", () => {
      const service = new TestServiceWithSymbol("sandbox");
      const result = service[symbolMethod]();
      expect(result).toBe("symbol method completed");
    });

    it("should throw with symbol.toString() as method name in production", () => {
      const service = new TestServiceWithSymbol("production");
      try {
        service[symbolMethod]();
        fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(EnvironmentViolationError);
        expect((error as EnvironmentViolationError).methodName).toContain("Symbol");
      }
    });
  });

  describe("with class that has client property", () => {
    class TestServiceWithClient {
      client: { config: ResolvedOakClientConfig };

      constructor(environment: OakEnvironment) {
        this.client = { config: createMockConfig(environment) };
      }

      @SandboxOnly
      async resetAccount(): Promise<void> {}
    }

    it("should allow execution in sandbox environment", async () => {
      const service = new TestServiceWithClient("sandbox");
      await expect(service.resetAccount()).resolves.toBeUndefined();
    });

    it("should throw EnvironmentViolationError in production", () => {
      const service = new TestServiceWithClient("production");
      expect(() => service.resetAccount()).toThrow(EnvironmentViolationError);
    });
  });

  describe("with class missing config", () => {
    class TestServiceNoConfig {
      @SandboxOnly
      async noConfigMethod(): Promise<void> {}
    }

    it("should throw error when config is not accessible", () => {
      const service = new TestServiceNoConfig();
      expect(() => service.noConfigMethod()).toThrow(
        "@SandboxOnly decorator requires access to environment configuration"
      );
    });
  });
});

describe("sandboxOnlyFn", () => {
  it("should allow execution when environment is sandbox", () => {
    const fn = jest.fn().mockReturnValue("result");
    const wrapped = sandboxOnlyFn(fn, () => "sandbox", "testFn");

    const result = wrapped();

    expect(result).toBe("result");
    expect(fn).toHaveBeenCalled();
  });

  it("should throw EnvironmentViolationError when environment is production", () => {
    const fn = jest.fn().mockReturnValue("result");
    const wrapped = sandboxOnlyFn(fn, () => "production", "testFn");

    expect(() => wrapped()).toThrow(EnvironmentViolationError);
    expect(fn).not.toHaveBeenCalled();
  });

  it("should pass arguments to wrapped function", () => {
    const fn = jest.fn().mockImplementation((a: number, b: number) => a + b);
    const wrapped = sandboxOnlyFn(fn, () => "sandbox", "addFn");

    const result = wrapped(2, 3);

    expect(result).toBe(5);
    expect(fn).toHaveBeenCalledWith(2, 3);
  });

  it("should include method name in error", () => {
    const fn = jest.fn();
    const wrapped = sandboxOnlyFn(fn, () => "production", "mySpecialMethod");

    try {
      wrapped();
      fail("Should have thrown");
    } catch (error) {
      expect((error as EnvironmentViolationError).methodName).toBe(
        "mySpecialMethod"
      );
    }
  });
});
