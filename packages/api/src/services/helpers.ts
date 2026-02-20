/**
 * @typeParam T - Query parameters object type
 * @param params - Optional query parameters
 * @returns URL query string or empty string
 */
export const buildQueryString = <T extends object>(params?: T): string => {
  if (!params) {
    return "";
  }
  const entries = Object.entries(params as Record<string, unknown>).filter(
    ([, value]) => value !== undefined
  );
  if (!entries.length) {
    return "";
  }
  return `?${entries
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join("&")}`;
};

/**
 * @param error - Error object to extract message from
 * @returns Error message from body.msg or undefined
 */
export const getErrorBodyMessage = (error: unknown): string | undefined => {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }
  if (!("body" in error)) {
    return undefined;
  }
  const body = (error as { body?: { msg?: string } }).body;
  return body?.msg;
};
