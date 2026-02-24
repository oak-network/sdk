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

