export type OakEnvironment = "sandbox" | "production";

export interface EnvironmentConfig {
  apiUrl: string;
  allowsTestOperations: boolean;
}

export function getEnvironmentConfigs(): Record<OakEnvironment, EnvironmentConfig> {
  const sandboxUrl = process.env.CROWDSPLIT_SANDBOX_URL;
  const productionUrl = process.env.CROWDSPLIT_PRODUCTION_URL;

  if (!sandboxUrl || !productionUrl) {
    throw new Error(
      "Missing required environment variables: CROWDSPLIT_SANDBOX_URL, CROWDSPLIT_PRODUCTION_URL"
    );
  }

  return {
    sandbox: {
      apiUrl: sandboxUrl,
      allowsTestOperations: true,
    },
    production: {
      apiUrl: productionUrl,
      allowsTestOperations: false,
    },
  };
}

export function resolveBaseUrl(
  environment: OakEnvironment,
  customUrl?: string
): string {
  if (customUrl) {
    return customUrl;
  }
  return getEnvironmentConfigs()[environment].apiUrl;
}

export function isTestEnvironment(environment: OakEnvironment): boolean {
  return getEnvironmentConfigs()[environment].allowsTestOperations;
}
