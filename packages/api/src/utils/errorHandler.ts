export class SDKError extends Error {
  public cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "SDKError";
    this.cause = cause;
  }
}

export class EnvironmentViolationError extends SDKError {
  public readonly methodName: string;
  public readonly environment: string;

  constructor(methodName: string, environment: string) {
    super(
      `Method "${methodName}" is only available in sandbox environment. ` +
        `Current environment: ${environment}. ` +
        `This method cannot be called in production to prevent accidental data corruption.`
    );
    this.name = "EnvironmentViolationError";
    this.methodName = methodName;
    this.environment = environment;
  }
}
