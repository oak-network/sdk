export class OakError extends Error {
  public cause?: unknown;

  /**
   * @param message - Error description
   * @param cause - Original error that caused this error
   */
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "OakError";
    this.cause = cause;
  }
}

export class SDKError extends OakError {
  /**
   * @param message - Error description
   * @param cause - Original error that caused this error
   */
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = "SDKError";
  }
}

export class ApiError extends OakError {
  public readonly status: number;
  public readonly body: unknown;
  public readonly headers?: Record<string, string>;

  /**
   * @param message - Error description
   * @param status - HTTP status code
   * @param body - Parsed response body
   * @param headers - Response headers
   * @param cause - Original error that caused this error
   */
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

  /**
   * @param message - Error description
   * @param cause - Original error that caused this error
   */
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = "NetworkError";
  }
}

export class AbortError extends OakError {
  /**
   * @param message - Error description
   * @param cause - Original error that caused this error
   */
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = "AbortError";
  }
}

export class ParseError extends OakError {
  /**
   * @param message - Error description
   * @param cause - Original error that caused this error
   */
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = "ParseError";
  }
}

export class EnvironmentViolationError extends SDKError {
  public readonly methodName: string;
  public readonly environment: string;

  /**
   * @param methodName - Name of the restricted method
   * @param environment - Current environment
   */
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
