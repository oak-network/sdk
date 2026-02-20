import { withAuth } from "../../src/utils/withAuth";
import { createOakClient } from "../../src/client";
import { err, ok } from "../../src/types";
import { OakError } from "../../src/utils/errorHandler";
import type { OakClient } from "../../src/types";

describe("withAuth", () => {
  let mockClient: OakClient;

  beforeEach(() => {
    mockClient = createOakClient({
      environment: "sandbox",
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
    });
  });

  it("should execute operation with valid token", async () => {
    // Mock successful token fetch
    const mockToken = "valid-access-token";
    jest.spyOn(mockClient, "getAccessToken").mockResolvedValue(ok(mockToken));

    // Mock operation
    const mockOperation = jest.fn().mockResolvedValue(ok({ data: "success" }));

    const result = await withAuth(mockClient, mockOperation);

    expect(mockClient.getAccessToken).toHaveBeenCalled();
    expect(mockOperation).toHaveBeenCalledWith(mockToken);
    expect(result).toEqual(ok({ data: "success" }));
  });

  it("should return error if token fetch fails", async () => {
    // Mock failed token fetch
    const tokenError = new OakError("Token fetch failed");
    jest.spyOn(mockClient, "getAccessToken").mockResolvedValue(err(tokenError));

    // Mock operation (should not be called)
    const mockOperation = jest.fn();

    const result = await withAuth(mockClient, mockOperation);

    expect(mockClient.getAccessToken).toHaveBeenCalled();
    expect(mockOperation).not.toHaveBeenCalled();
    expect(result).toEqual(err(tokenError));
  });

  it("should propagate operation errors", async () => {
    // Mock successful token fetch
    jest.spyOn(mockClient, "getAccessToken").mockResolvedValue(ok("token"));

    // Mock operation that returns error
    const operationError = new OakError("Operation failed");
    const mockOperation = jest.fn().mockResolvedValue(err(operationError));

    const result = await withAuth(mockClient, mockOperation);

    expect(result).toEqual(err(operationError));
  });

  it("should handle async operations correctly", async () => {
    jest.spyOn(mockClient, "getAccessToken").mockResolvedValue(ok("token"));

    // Simulate async operation with delay
    const mockOperation = jest.fn().mockImplementation(async (token) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return ok({ token });
    });

    const result = await withAuth(mockClient, mockOperation);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ token: "token" });
    }
  });
});
