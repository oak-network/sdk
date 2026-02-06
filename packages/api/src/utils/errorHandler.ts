export class OakError extends Error {
  public cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "OakError";
    this.cause = cause;
  }
}

export class SDKError extends OakError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = "SDKError";
  }
}

export class ApiError extends OakError {
  public readonly status: number;
  public readonly body: unknown;
  public readonly headers?: Record<string, string>;

  constructor(
    message: string,
    status: number,
    body: unknown,
    headers?: Record<string, string>,
    cause?: unknown
  ) {
    super(message, cause);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.headers = headers;
  }
}

export class NetworkError extends OakError {
  public readonly isNetworkError = true;

  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = "NetworkError";
  }
}

export class AbortError extends OakError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = "AbortError";
  }
}

export class ParseError extends OakError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = "ParseError";
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
