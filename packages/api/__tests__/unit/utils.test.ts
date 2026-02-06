import { buildQueryString, getErrorBodyMessage } from "../../src/services/helpers";
import {
  ApiError,
  NetworkError,
  ParseError,
  SDKError,
} from "../../src/utils/errorHandler";
import { httpClient } from "../../src/utils/httpClient";
import * as retryHandler from "../../src/utils/retryHandler";
import { DEFAULT_RETRY_OPTIONS } from "../../src/utils/defaultRetryConfig";
import "../../src/utils";

const packageVersion = require("../../package.json").version as string;
const expectedHeaders = (headers?: Record<string, string>) => ({
  "Content-Type": "application/json",
  "Oak-Version": packageVersion,
  ...(headers ?? {}),
});

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

    expect(result).toEqual({ ok: true, value: { ok: true } });
    expect(fetchMock).toHaveBeenCalledWith("https://api.test/post", {
      method: "POST",
      headers: expectedHeaders(),
      body: JSON.stringify({ data: 1 }),
    });
  });

  it("post merges custom headers", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    const result = await httpClient.post(
      "https://api.test/post",
      { data: 1 },
      { retryOptions, headers: { "X-Test": "yes" } }
    );

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith("https://api.test/post", {
      method: "POST",
      headers: expectedHeaders({ "X-Test": "yes" }),
      body: JSON.stringify({ data: 1 }),
    });
  });

  it("post throws error for non-ok response", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({ msg: "bad" }),
    });

    const result = await httpClient.post("https://api.test/post", { data: 1 }, {
      retryOptions,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ApiError);
      expect((result.error as ApiError).status).toBe(400);
      expect((result.error as ApiError).body).toEqual({ msg: "bad" });
    }
  });

  it("post includes response headers in ApiError", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers({ "retry-after": "1" }),
      json: jest.fn().mockResolvedValue({ msg: "bad" }),
    });

    const result = await httpClient.post("https://api.test/post", { data: 1 }, {
      retryOptions,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ApiError);
      expect((result.error as ApiError).headers).toEqual({ "retry-after": "1" });
    }
  });

  it("get returns response body", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    const result = await httpClient.get("https://api.test/get", {
      retryOptions,
    });

    expect(result).toEqual({ ok: true, value: { ok: true } });
    expect(fetchMock).toHaveBeenCalledWith("https://api.test/get", {
      method: "GET",
      headers: expectedHeaders(),
    });
  });

  it("get merges custom headers", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    const result = await httpClient.get("https://api.test/get", {
      retryOptions,
      headers: { "X-Test": "yes" },
    });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith("https://api.test/get", {
      method: "GET",
      headers: expectedHeaders({ "X-Test": "yes" }),
    });
  });

  it("get throws error for non-ok response", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      json: jest.fn().mockResolvedValue({ msg: "missing" }),
    });

    const result = await httpClient.get("https://api.test/get", {
      retryOptions,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ApiError);
      expect((result.error as ApiError).status).toBe(404);
      expect((result.error as ApiError).body).toEqual({ msg: "missing" });
    }
  });

  it("get uses fallback error message when missing", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue(null),
    });

    const result = await httpClient.get("https://api.test/get", {
      retryOptions,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ApiError);
      expect(result.error.message).toBe("HTTP error");
    }
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

    expect(result).toEqual({ ok: true, value: { ok: true } });
    expect(fetchMock).toHaveBeenCalledWith("https://api.test/put", {
      method: "PUT",
      headers: expectedHeaders(),
      body: JSON.stringify({ data: 2 }),
    });
  });

  it("put merges custom headers", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    const result = await httpClient.put(
      "https://api.test/put",
      { data: 2 },
      { retryOptions, headers: { "X-Test": "yes" } }
    );

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith("https://api.test/put", {
      method: "PUT",
      headers: expectedHeaders({ "X-Test": "yes" }),
      body: JSON.stringify({ data: 2 }),
    });
  });

  it("put throws error for non-ok response", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue({ msg: "boom" }),
    });

    const result = await httpClient.put("https://api.test/put", { data: 2 }, {
      retryOptions,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ApiError);
      expect((result.error as ApiError).status).toBe(500);
      expect((result.error as ApiError).body).toEqual({ msg: "boom" });
    }
  });

  it("put uses fallback error message when missing", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue(null),
    });

    const result = await httpClient.put("https://api.test/put", { data: 2 }, {
      retryOptions,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ApiError);
      expect(result.error.message).toBe("HTTP error");
    }
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

    expect(result).toEqual({ ok: true, value: { ok: true } });
    expect(fetchMock).toHaveBeenCalledWith("https://api.test/patch", {
      method: "PATCH",
      headers: expectedHeaders(),
      body: undefined,
    });
  });

  it("patch sends body when provided", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    const result = await httpClient.patch("https://api.test/patch", { data: 9 }, { retryOptions });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith("https://api.test/patch", {
      method: "PATCH",
      headers: expectedHeaders(),
      body: JSON.stringify({ data: 9 }),
    });
  });

  it("patch merges custom headers", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    const result = await httpClient.patch(
      "https://api.test/patch",
      { data: 9 },
      { retryOptions, headers: { "X-Test": "yes" } }
    );

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith("https://api.test/patch", {
      method: "PATCH",
      headers: expectedHeaders({ "X-Test": "yes" }),
      body: JSON.stringify({ data: 9 }),
    });
  });

  it("patch throws error for non-ok response", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 422,
      json: jest.fn().mockResolvedValue({ msg: "invalid" }),
    });

    const result = await httpClient.patch("https://api.test/patch", { data: 3 }, {
      retryOptions,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ApiError);
      expect((result.error as ApiError).status).toBe(422);
      expect((result.error as ApiError).body).toEqual({ msg: "invalid" });
    }
  });

  it("patch uses fallback error message when missing", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 422,
      json: jest.fn().mockResolvedValue(null),
    });

    const result = await httpClient.patch("https://api.test/patch", { data: 3 }, {
      retryOptions,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ApiError);
      expect(result.error.message).toBe("HTTP error");
    }
  });

  it("delete returns response body", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    const result = await httpClient.delete("https://api.test/delete", {
      retryOptions,
    });

    expect(result).toEqual({ ok: true, value: { ok: true } });
    expect(fetchMock).toHaveBeenCalledWith("https://api.test/delete", {
      method: "DELETE",
      headers: expectedHeaders(),
    });
  });

  it("delete merges custom headers", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    const result = await httpClient.delete("https://api.test/delete", {
      retryOptions,
      headers: { "X-Test": "yes" },
    });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith("https://api.test/delete", {
      method: "DELETE",
      headers: expectedHeaders({ "X-Test": "yes" }),
    });
  });

  it("falls back to 'unknown' when require and OAK_VERSION both fail", async () => {
    const previousVersion = process.env.OAK_VERSION;
    delete process.env.OAK_VERSION;

    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    let isolatedClient: typeof httpClient;
    jest.isolateModules(() => {
      jest.mock("../../package.json", () => {
        throw new Error("not found");
      });
      isolatedClient = require("../../src/utils/httpClient").httpClient;
    });

    await isolatedClient!.get("https://api.test/get", { retryOptions });

    expect(fetchMock).toHaveBeenCalledWith("https://api.test/get", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Oak-Version": "unknown",
      },
    });

    if (previousVersion !== undefined) {
      process.env.OAK_VERSION = previousVersion;
    }
  });

  it("uses OAK_VERSION when provided", async () => {
    const previousVersion = process.env.OAK_VERSION;
    process.env.OAK_VERSION = "9.9.9";

    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    let isolatedClient: typeof httpClient;
    jest.isolateModules(() => {
      isolatedClient = require("../../src/utils/httpClient").httpClient;
    });

    await isolatedClient!.get("https://api.test/get", { retryOptions });

    expect(fetchMock).toHaveBeenCalledWith("https://api.test/get", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Oak-Version": "9.9.9",
      },
    });

    if (previousVersion === undefined) {
      delete process.env.OAK_VERSION;
    } else {
      process.env.OAK_VERSION = previousVersion;
    }
  });

  it("delete throws error for non-ok response", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({ msg: "unauthorized" }),
    });

    const result = await httpClient.delete("https://api.test/delete", {
      retryOptions,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ApiError);
      expect((result.error as ApiError).status).toBe(401);
      expect((result.error as ApiError).body).toEqual({ msg: "unauthorized" });
    }
  });

  it("delete uses fallback error message when missing", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue(null),
    });

    const result = await httpClient.delete("https://api.test/delete", {
      retryOptions,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ApiError);
      expect(result.error.message).toBe("HTTP error");
    }
  });

  it("post uses fallback error message when missing", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue(null),
    });

    const result = await httpClient.post("https://api.test/post", { data: 1 }, {
      retryOptions,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ApiError);
      expect(result.error.message).toBe("HTTP error");
    }
  });

  it("post returns ParseError when response body parsing fails", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockRejectedValue(new Error("bad json")),
    });

    const result = await httpClient.post("https://api.test/post", { data: 1 }, {
      retryOptions,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ParseError);
      expect(result.error.message).toBe("Failed to parse response body");
    }
  });

  it("post returns NetworkError when fetch fails", async () => {
    fetchMock.mockRejectedValue(new Error("socket hang up"));

    const result = await httpClient.post("https://api.test/post", { data: 1 }, {
      retryOptions: { maxNumberOfRetries: 0, delay: 0 },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(NetworkError);
      expect(result.error.message).toBe("Network error");
    }
  });

  it("post wraps unexpected errors as OakError", async () => {
    const spy = jest
      .spyOn(retryHandler, "withRetry")
      .mockRejectedValueOnce("boom");

    const result = await httpClient.post("https://api.test/post", { data: 1 }, {
      retryOptions,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("Unknown error");
    }

    spy.mockRestore();
  });

  it("post wraps Error values as OakError", async () => {
    const result = await httpClient.post("https://api.test/post", { data: 1 }, {
      retryOptions: { maxNumberOfRetries: -1, delay: 0 },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("Retry failed after maximum attempts");
    }
  });
});

describe("withRetry", () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("returns on first try", async () => {
    const fn = jest.fn().mockResolvedValue("ok");
    const result = await retryHandler.withRetry(fn, {
      maxNumberOfRetries: 1,
      delay: 1,
    });
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

    const promise = retryHandler.withRetry(fn, {
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

    const promise = retryHandler.withRetry(fn, {
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

    const promise = retryHandler.withRetry(fn, {
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
      retryHandler.withRetry(fn, {
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
      retryHandler.withRetry(fn, {
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

    const promise = retryHandler.withRetry(fn, {
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
      retryHandler.withRetry(fn, {
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

    const promise = retryHandler.withRetry(fn, {
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
      retryHandler.withRetry(fn, {
        maxNumberOfRetries: 0,
        delay: 1,
        retryOnStatus: [400],
      })
    ).rejects.toMatchObject({ status: 400 });
  });

  it("handles undefined error values", async () => {
    const fn = jest.fn().mockRejectedValueOnce(undefined);
    await expect(
      retryHandler.withRetry(fn, {
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
      retryHandler.withRetry(fn, {
        maxNumberOfRetries: 1,
        delay: 1,
        signal: controller.signal,
        retryOnError: () => false,
      })
    ).rejects.toThrow("Retry aborted");
  });

  it("throws final error when retries are negative", async () => {
    await expect(
      retryHandler.withRetry(async () => "ok", {
        maxNumberOfRetries: -1,
        delay: 1,
      })
    ).rejects.toThrow("Retry failed after maximum attempts");
  });
});
