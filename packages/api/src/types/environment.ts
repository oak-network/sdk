export type OakEnvironment = "sandbox" | "production";

export interface EnvironmentConfig {
  apiUrl: string;
  allowsTestOperations: boolean;
}

const ENVIRONMENT_VAR_NAMES: Record<OakEnvironment, string> = {
  sandbox: "CROWDSPLIT_SANDBOX_URL",
  production: "CROWDSPLIT_PRODUCTION_URL",
};

function getEnvironmentUrl(environment: OakEnvironment): string {
  const envVarName = ENVIRONMENT_VAR_NAMES[environment];
  const url = process.env[envVarName];

  if (!url) {
    throw new Error(
      `Missing required environment variable: ${envVarName} for ${environment} environment`
    );
  }

  return url;
}

export function getEnvironmentConfig(environment: OakEnvironment): EnvironmentConfig {
  return {
    apiUrl: getEnvironmentUrl(environment),
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
  return getEnvironmentUrl(environment);
}

export function isTestEnvironment(environment: OakEnvironment): boolean {
  return environment === "sandbox";
}
