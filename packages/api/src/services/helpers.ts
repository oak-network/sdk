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
