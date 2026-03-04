import { render, screen } from "@testing-library/react";
import { StripeConnectProvider } from "@/stripe-connect";
import {
  loadConnectAndInitialize,
  mockConnectInstance,
} from "@test-mocks/@stripe/connect-js";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("StripeConnectProvider", () => {
  it("calls loadConnectAndInitialize with publishableKey and fetchClientSecret", async () => {
    const fetchClientSecret = jest.fn().mockResolvedValue("sk_test_secret");

    render(
      <StripeConnectProvider
        publishableKey="pk_test_123"
        fetchClientSecret={fetchClientSecret}
      />
    );

    expect(loadConnectAndInitialize).toHaveBeenCalledTimes(1);
    const call = (loadConnectAndInitialize as jest.Mock).mock.calls[0];
    const initParams = call?.[0] as { publishableKey: string; fetchClientSecret: () => Promise<string> } | undefined;
    expect(initParams).toBeDefined();
    expect(initParams!.publishableKey).toBe("pk_test_123");
    expect(typeof initParams!.fetchClientSecret).toBe("function");
    await expect(initParams!.fetchClientSecret()).resolves.toBe("sk_test_secret");
    expect(fetchClientSecret).toHaveBeenCalled();
  });

  it("passes connectOptions through to loadConnectAndInitialize", () => {
    const fetchClientSecret = jest.fn().mockResolvedValue("sk_test_secret");
    const appearance = {
      overlays: "dialog" as const,
      variables: { colorPrimary: "#000000" },
    };

    render(
      <StripeConnectProvider
        publishableKey="pk_test_456"
        fetchClientSecret={fetchClientSecret}
        connectOptions={{ appearance }}
      />
    );

    const call = (loadConnectAndInitialize as jest.Mock).mock.calls[0];
    const initParams = call?.[0] as { publishableKey: string; appearance?: unknown } | undefined;
    expect(initParams).toBeDefined();
    expect(initParams!.publishableKey).toBe("pk_test_456");
    expect(initParams!.appearance).toEqual(appearance);
  });

  it("calls instance.update when connectOptions.appearance or locale changes", () => {
    const fetchClientSecret = jest.fn().mockResolvedValue("sk_test_secret");

    const { rerender } = render(
      <StripeConnectProvider
        publishableKey="pk_test"
        fetchClientSecret={fetchClientSecret}
        connectOptions={{
          appearance: { variables: { colorPrimary: "#111" } },
        }}
      />
    );

    rerender(
      <StripeConnectProvider
        publishableKey="pk_test"
        fetchClientSecret={fetchClientSecret}
        connectOptions={{
          appearance: { variables: { colorPrimary: "#222" } },
        }}
      />
    );

    expect(mockConnectInstance.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        appearance: { variables: { colorPrimary: "#222" } },
      })
    );
  });

  it("renders children when provided", () => {
    const fetchClientSecret = jest.fn().mockResolvedValue("sk_test_secret");

    render(
      <StripeConnectProvider
        publishableKey="pk_test"
        fetchClientSecret={fetchClientSecret}
      >
        <span>Child content</span>
      </StripeConnectProvider>
    );

    expect(screen.getByText("Child content")).toBeTruthy();
  });
});
