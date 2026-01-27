export class SDKError extends Error {
  public cause?: any;

  constructor(message: string, cause?: any) {
    super(message);
    this.name = "SDKError";
    this.cause = cause;
  }
}
