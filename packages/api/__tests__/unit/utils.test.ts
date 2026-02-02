import { buildQueryString, getErrorBodyMessage } from "../../src/services/helpers";
import { SDKError } from "../../src/utils/errorHandler";
import { httpClient } from "../../src/utils/httpClient";
import { withRetry } from "../../src/utils/retryHandler";
import { DEFAULT_RETRY_OPTIONS } from "../../src/utils/defaultRetryConfig";
import "../../src/utils";

describe("SDKError", () => {
  it("stores message and cause", () => {
    const cause = new Error("root");
    const error = new SDKError("message", cause);
    expect(error.name).toBe("SDKError");
    expect(error.message).toBe("message");
    expect(error.cause).toBe(cause);
  });
});

describe("DEFAULT_RETRY_OPTIONS", () => {
  it("uses retryOnError for network errors", () => {
    expect(DEFAULT_RETRY_OPTIONS.retryOnError?.({ isNetworkError: true })).toBe(
      true
    );
    expect(DEFAULT_RETRY_OPTIONS.retryOnError?.({})).toBe(false);
    expect(DEFAULT_RETRY_OPTIONS.retryOnError?.(undefined)).toBe(false);
  });

  it("onRetry logs warning", () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {});
    DEFAULT_RETRY_OPTIONS.onRetry?.(1, { message: "boom" });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("service helpers", () => {
  it("buildQueryString handles empty inputs", () => {
    expect(buildQueryString()).toBe("");
    expect(buildQueryString({})).toBe("");
    expect(buildQueryString({ a: undefined })).toBe("");
  });

  it("buildQueryString encodes values", () => {
    expect(buildQueryString({ a: "b c", count: 2 })).toBe("?a=b%20c&count=2");
  });

  it("getErrorBodyMessage extracts error body", () => {
    expect(getErrorBodyMessage(null)).toBeUndefined();
    expect(getErrorBodyMessage("boom")).toBeUndefined();
    expect(getErrorBodyMessage({})).toBeUndefined();
    expect(getErrorBodyMessage({ body: undefined })).toBeUndefined();
    expect(getErrorBodyMessage({ body: null })).toBeUndefined();
    expect(getErrorBodyMessage({ body: {} })).toBeUndefined();
    expect(getErrorBodyMessage({ body: { msg: "bad" } })).toBe("bad");
  });
});

describe("httpClient", () => {
  const retryOptions = { maxNumberOfRetries: 0, delay: 0 };
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    (globalThis as any).fetch = fetchMock;
  });

  it("post returns response body", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    const result = await httpClient.post(
      "https://api.test/post",
      { data: 1 },
      { retryOptions }
    );

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith("https://api.test/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: 1 }),
    });
  });

  it("post merges custom headers", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    await httpClient.post(
      "https://api.test/post",
      { data: 1 },
      { retryOptions, headers: { "X-Test": "yes" } }
    );

    expect(fetchMock).toHaveBeenCalledWith("https://api.test/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Test": "yes",
      },
      body: JSON.stringify({ data: 1 }),
    });
  });

  it("post throws error for non-ok response", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({ msg: "bad" }),
    });

    await expect(
      httpClient.post("https://api.test/post", { data: 1 }, { retryOptions })
    ).rejects.toMatchObject({
      status: 400,
      body: { msg: "bad" },
    });
  });

  it("get returns response body", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    const result = await httpClient.get("https://api.test/get", {
      retryOptions,
    });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith("https://api.test/get", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("get merges custom headers", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    await httpClient.get("https://api.test/get", {
      retryOptions,
      headers: { "X-Test": "yes" },
    });

    expect(fetchMock).toHaveBeenCalledWith("https://api.test/get", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Test": "yes",
      },
    });
  });

  it("get throws error for non-ok response", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      json: jest.fn().mockResolvedValue({ msg: "missing" }),
    });

    await expect(
      httpClient.get("https://api.test/get", { retryOptions })
    ).rejects.toMatchObject({
      status: 404,
      body: { msg: "missing" },
    });
  });

  it("get uses fallback error message when missing", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue(null),
    });

    await expect(
      httpClient.get("https://api.test/get", { retryOptions })
    ).rejects.toThrow("HTTP error");
  });

  it("put returns response body", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    const result = await httpClient.put(
      "https://api.test/put",
      { data: 2 },
      { retryOptions }
    );

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith("https://api.test/put", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: 2 }),
    });
  });

  it("put merges custom headers", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    await httpClient.put(
      "https://api.test/put",
      { data: 2 },
      { retryOptions, headers: { "X-Test": "yes" } }
    );

    expect(fetchMock).toHaveBeenCalledWith("https://api.test/put", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Test": "yes",
      },
      body: JSON.stringify({ data: 2 }),
    });
  });

  it("put throws error for non-ok response", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue({ msg: "boom" }),
    });

    await expect(
      httpClient.put("https://api.test/put", { data: 2 }, { retryOptions })
    ).rejects.toMatchObject({
      status: 500,
      body: { msg: "boom" },
    });
  });

  it("put uses fallback error message when missing", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue(null),
    });

    await expect(
      httpClient.put("https://api.test/put", { data: 2 }, { retryOptions })
    ).rejects.toThrow("HTTP error");
  });

  it("patch returns response body and omits body when undefined", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    const result = await httpClient.patch(
      "https://api.test/patch",
      undefined,
      { retryOptions }
    );

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith("https://api.test/patch", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: undefined,
    });
  });

  it("patch sends body when provided", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    await httpClient.patch("https://api.test/patch", { data: 9 }, { retryOptions });

    expect(fetchMock).toHaveBeenCalledWith("https://api.test/patch", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: 9 }),
    });
  });

  it("patch merges custom headers", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    await httpClient.patch(
      "https://api.test/patch",
      { data: 9 },
      { retryOptions, headers: { "X-Test": "yes" } }
    );

    expect(fetchMock).toHaveBeenCalledWith("https://api.test/patch", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Test": "yes",
      },
      body: JSON.stringify({ data: 9 }),
    });
  });

  it("patch throws error for non-ok response", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 422,
      json: jest.fn().mockResolvedValue({ msg: "invalid" }),
    });

    await expect(
      httpClient.patch("https://api.test/patch", { data: 3 }, { retryOptions })
    ).rejects.toMatchObject({
      status: 422,
      body: { msg: "invalid" },
    });
  });

  it("patch uses fallback error message when missing", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 422,
      json: jest.fn().mockResolvedValue(null),
    });

    await expect(
      httpClient.patch("https://api.test/patch", { data: 3 }, { retryOptions })
    ).rejects.toThrow("HTTP error");
  });

  it("delete returns response body", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    const result = await httpClient.delete("https://api.test/delete", {
      retryOptions,
    });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith("https://api.test/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("delete merges custom headers", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    await httpClient.delete("https://api.test/delete", {
      retryOptions,
      headers: { "X-Test": "yes" },
    });

    expect(fetchMock).toHaveBeenCalledWith("https://api.test/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Test": "yes",
      },
    });
  });

  it("delete throws error for non-ok response", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({ msg: "unauthorized" }),
    });

    await expect(
      httpClient.delete("https://api.test/delete", { retryOptions })
    ).rejects.toMatchObject({
      status: 401,
      body: { msg: "unauthorized" },
    });
  });

  it("delete uses fallback error message when missing", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue(null),
    });

    await expect(
      httpClient.delete("https://api.test/delete", { retryOptions })
    ).rejects.toThrow("HTTP error");
  });

  it("post uses fallback error message when missing", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue(null),
    });

    await expect(
      httpClient.post("https://api.test/post", { data: 1 }, { retryOptions })
    ).rejects.toThrow("HTTP error");
  });
});

describe("withRetry", () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("returns on first try", async () => {
    const fn = jest.fn().mockResolvedValue("ok");
    const result = await withRetry(fn, { maxNumberOfRetries: 1, delay: 1 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries with retry-after header", async () => {
    jest.useFakeTimers();
    const fn = jest
      .fn()
      .mockRejectedValueOnce({ status: 500, headers: { "retry-after": "1" } })
      .mockResolvedValueOnce("ok");
    const onRetry = jest.fn();

    const promise = withRetry(fn, {
      maxNumberOfRetries: 1,
      delay: 10,
      retryOnStatus: [500],
      onRetry,
    });

    await jest.runAllTimersAsync();
    await expect(promise).resolves.toBe("ok");
    expect(onRetry).toHaveBeenCalledWith(1, expect.anything());
  });

  it("retries with backoff when no retry-after", async () => {
    jest.useFakeTimers();
    jest.spyOn(Math, "random").mockReturnValue(0);
    const fn = jest
      .fn()
      .mockRejectedValueOnce({ status: 500 })
      .mockResolvedValueOnce("ok");

    const promise = withRetry(fn, {
      maxNumberOfRetries: 1,
      delay: 100,
      retryOnStatus: [500],
    });

    await jest.runAllTimersAsync();
    await expect(promise).resolves.toBe("ok");
  });

  it("retries with default retryOnError when network error", async () => {
    jest.useFakeTimers();
    const fn = jest
      .fn()
      .mockRejectedValueOnce({ isNetworkError: true })
      .mockResolvedValueOnce("ok");

    const promise = withRetry(fn, {
      maxNumberOfRetries: 1,
      delay: 10,
      retryOnStatus: [],
    });

    await jest.runAllTimersAsync();
    await expect(promise).resolves.toBe("ok");
  });

  it("does not retry with default retryOnError when no network flag", async () => {
    const fn = jest.fn().mockRejectedValueOnce({ status: 500 });
    await expect(
      withRetry(fn, {
        maxNumberOfRetries: 1,
        delay: 1,
        retryOnStatus: [],
      })
    ).rejects.toMatchObject({ status: 500 });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does not retry with default retryOnError when error is undefined", async () => {
    const fn = jest.fn().mockRejectedValueOnce(undefined);
    await expect(
      withRetry(fn, {
        maxNumberOfRetries: 0,
        delay: 1,
        retryOnStatus: [],
      })
    ).rejects.toBeUndefined();
  });

  it("retries on network error when retryOnError returns true", async () => {
    jest.useFakeTimers();
    const fn = jest
      .fn()
      .mockRejectedValueOnce({ isNetworkError: true })
      .mockResolvedValueOnce("ok");

    const promise = withRetry(fn, {
      maxNumberOfRetries: 1,
      delay: 10,
      retryOnStatus: [],
      retryOnError: (err) => Boolean(err?.isNetworkError),
    });

    await jest.runAllTimersAsync();
    await expect(promise).resolves.toBe("ok");
  });

  it("does not retry when retryOnError returns false", async () => {
    const fn = jest.fn().mockRejectedValueOnce({ status: 500 });
    await expect(
      withRetry(fn, {
        maxNumberOfRetries: 1,
        delay: 1,
        retryOnStatus: [],
        retryOnError: () => false,
      })
    ).rejects.toMatchObject({ status: 500 });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries when retryOnError is true with undefined error", async () => {
    jest.useFakeTimers();
    const fn = jest
      .fn()
      .mockRejectedValueOnce(undefined)
      .mockResolvedValueOnce("ok");

    const promise = withRetry(fn, {
      maxNumberOfRetries: 1,
      delay: 10,
      retryOnStatus: [],
      retryOnError: () => true,
    });

    await jest.runAllTimersAsync();
    await expect(promise).resolves.toBe("ok");
  });

  it("throws when max retries reached", async () => {
    const fn = jest.fn().mockRejectedValue({ status: 400 });
    await expect(
      withRetry(fn, {
        maxNumberOfRetries: 0,
        delay: 1,
        retryOnStatus: [400],
      })
    ).rejects.toMatchObject({ status: 400 });
  });

  it("handles undefined error values", async () => {
    const fn = jest.fn().mockRejectedValueOnce(undefined);
    await expect(
      withRetry(fn, {
        maxNumberOfRetries: 0,
        delay: 1,
        retryOnStatus: [],
        retryOnError: () => false,
      })
    ).rejects.toBeUndefined();
  });

  it("throws when aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const fn = jest.fn().mockResolvedValue("ok");

    await expect(
      withRetry(fn, {
        maxNumberOfRetries: 1,
        delay: 1,
        signal: controller.signal,
        retryOnError: () => false,
      })
    ).rejects.toThrow("Retry aborted");
  });

  it("throws final error when retries are negative", async () => {
    await expect(
      withRetry(async () => "ok", {
        maxNumberOfRetries: -1,
        delay: 1,
      })
    ).rejects.toThrow("Retry failed after maximum attempts");
  });
});
