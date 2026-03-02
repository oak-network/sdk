export type OakEnvironment = "sandbox" | "production";

export interface EnvironmentConfig {
  apiUrl: string;
  allowsTestOperations: boolean;
}

export const ENVIRONMENT_URLS: Record<OakEnvironment, string> = {
  sandbox: "https://api-stage.usecrowdpay.xyz",
  production: "https://app.usecrowdpay.xyz",
};

/**
 * @param environment - Target environment
 * @returns Configuration for the specified environment
 */
export function getEnvironmentConfig(environment: OakEnvironment): EnvironmentConfig {
  return {
    apiUrl: ENVIRONMENT_URLS[environment],
    allowsTestOperations: environment === "sandbox",
  };
}

/**
 * @param environment - Target environment
 * @param customUrl - Optional custom URL override
 * @returns The resolved API base URL
 */
export function resolveBaseUrl(
  environment: OakEnvironment,
  customUrl?: string
): string {
  if (customUrl) {
    return customUrl;
  }
  return ENVIRONMENT_URLS[environment];
}

/**
 * @param environment - Environment to check
 * @returns True if environment allows test operations
 */
export function isTestEnvironment(environment: OakEnvironment): boolean {
  return environment === "sandbox";
}
