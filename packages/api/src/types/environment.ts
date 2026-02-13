export type OakEnvironment = "sandbox" | "production";

export interface EnvironmentConfig {
  apiUrl: string;
  allowsTestOperations: boolean;
}

const ENVIRONMENT_URLS: Record<OakEnvironment, string> = {
  sandbox: "https://api-stage.usecrowdpay.xyz",
  production: "https://app.usecrowdpay.xyz",
};

export function getEnvironmentConfig(environment: OakEnvironment): EnvironmentConfig {
  return {
    apiUrl: ENVIRONMENT_URLS[environment],
    allowsTestOperations: environment === "sandbox",
  };
}

export function resolveBaseUrl(
  environment: OakEnvironment,
  customUrl?: string
): string {
  if (customUrl) {
    return customUrl;
  }
  return ENVIRONMENT_URLS[environment];
}

export function isTestEnvironment(environment: OakEnvironment): boolean {
  return environment === "sandbox";
}
