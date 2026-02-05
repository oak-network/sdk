import { EnvironmentViolationError } from "../utils/errorHandler";
import type { ResolvedOakClientConfig } from "../types/client";

interface HasConfig {
  config: ResolvedOakClientConfig;
}

interface HasClient {
  client: { config: ResolvedOakClientConfig };
}

function hasConfig(obj: unknown): obj is HasConfig {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "config" in obj &&
    typeof (obj as HasConfig).config === "object" &&
    (obj as HasConfig).config !== null &&
    "environment" in (obj as HasConfig).config
  );
}

function hasClient(obj: unknown): obj is HasClient {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "client" in obj &&
    typeof (obj as HasClient).client === "object" &&
    (obj as HasClient).client !== null &&
    "config" in (obj as HasClient).client
  );
}

export function SandboxOnly<T extends (...args: unknown[]) => unknown>(
  target: object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> | void {
  const originalMethod = descriptor.value;

  if (!originalMethod) {
    return;
  }

  descriptor.value = function (this: unknown, ...args: unknown[]) {
    let environment: string | undefined;

    if (hasConfig(this)) {
      environment = this.config.environment;
    } else if (hasClient(this)) {
      environment = this.client.config.environment;
    }

    if (!environment) {
      throw new Error(
        `@SandboxOnly decorator requires access to environment configuration. ` +
          `Ensure the class has either a 'config' or 'client.config' property with 'environment' field.`
      );
    }

    if (environment === "production") {
      const methodName =
        typeof propertyKey === "symbol"
          ? propertyKey.toString()
          : String(propertyKey);
      throw new EnvironmentViolationError(methodName, environment);
    }

    return originalMethod.apply(this, args);
  } as T;

  return descriptor;
}

export function sandboxOnlyFn<T extends (...args: unknown[]) => unknown>(
  fn: T,
  getEnvironment: () => string,
  methodName: string
): T {
  return ((...args: unknown[]) => {
    const environment = getEnvironment();

    if (environment === "production") {
      throw new EnvironmentViolationError(methodName, environment);
    }

    return fn(...args);
  }) as T;
}
