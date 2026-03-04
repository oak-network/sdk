import { act, fireEvent, render, screen } from "@testing-library/react";
import { usePlaidBankConnect } from "@/plaid";
import {
  lastPlaidConfig,
  mockOpen,
  usePlaidLink,
} from "@test-mocks/react-plaid-link";

beforeEach(() => {
  jest.clearAllMocks();
});

function TestComponent({
  getLinkToken,
  onSubmitPublicToken,
  onExit,
  onError,
}: {
  getLinkToken: () => Promise<string>;
  onSubmitPublicToken: (token: string) => Promise<void>;
  onExit?: () => void;
  onError?: (err: Error) => void;
}) {
  const { open, ready, isPending, error } = usePlaidBankConnect({
    getLinkToken,
    onSubmitPublicToken,
    plaidEnv: "sandbox",
    onExit,
    onError,
  });
  return (
    <div>
      <button type="button" onClick={() => open()} disabled={isPending || !ready}>
        Connect bank
      </button>
      {error && <span role="alert">{error.message}</span>}
    </div>
  );
}

describe("usePlaidBankConnect", () => {
  it("calls getLinkToken when open() is invoked from user button", async () => {
    const getLinkToken = jest.fn().mockResolvedValue("link-token-123");
    const onSubmitPublicToken = jest.fn().mockResolvedValue(undefined);

    render(
      <TestComponent
        getLinkToken={getLinkToken}
        onSubmitPublicToken={onSubmitPublicToken}
      />
    );

    const button = screen.getByRole("button", { name: /connect bank/i });
    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });

    expect(getLinkToken).toHaveBeenCalledTimes(1);
  });

  it("passes token and callbacks to usePlaidLink config", async () => {
    const getLinkToken = jest.fn().mockResolvedValue("link-token-456");
    const onSubmitPublicToken = jest.fn().mockResolvedValue(undefined);

    render(
      <TestComponent
        getLinkToken={getLinkToken}
        onSubmitPublicToken={onSubmitPublicToken}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /connect bank/i }));
      await Promise.resolve();
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(usePlaidLink).toHaveBeenCalled();
    const config = lastPlaidConfig;
    expect(config).not.toBeNull();
    expect(config?.token).toBe("link-token-456");
    expect(typeof config?.onSuccess).toBe("function");
    expect(typeof config?.onExit).toBe("function");
  });

  it("calls onSubmitPublicToken when Plaid onSuccess is invoked", async () => {
    const getLinkToken = jest.fn().mockResolvedValue("link-token-789");
    const onSubmitPublicToken = jest.fn().mockResolvedValue(undefined);

    render(
      <TestComponent
        getLinkToken={getLinkToken}
        onSubmitPublicToken={onSubmitPublicToken}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /connect bank/i }));
      await Promise.resolve();
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(lastPlaidConfig?.onSuccess).toBeDefined();
    await act(async () => {
      lastPlaidConfig!.onSuccess("public-token-abc");
      await Promise.resolve();
    });

    expect(onSubmitPublicToken).toHaveBeenCalledWith("public-token-abc");
  });

  it("calls onExit when Plaid onExit is invoked", async () => {
    const onExit = jest.fn();
    const getLinkToken = jest.fn().mockResolvedValue("link-token");
    const onSubmitPublicToken = jest.fn().mockResolvedValue(undefined);

    render(
      <TestComponent
        getLinkToken={getLinkToken}
        onSubmitPublicToken={onSubmitPublicToken}
        onExit={onExit}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /connect bank/i }));
      await Promise.resolve();
    });
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      lastPlaidConfig!.onExit();
    });
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it("sets error and calls onError when getLinkToken rejects", async () => {
    const onError = jest.fn();
    const getLinkToken = jest
      .fn()
      .mockRejectedValue(new Error("Failed to get link token"));
    const onSubmitPublicToken = jest.fn().mockResolvedValue(undefined);

    render(
      <TestComponent
        getLinkToken={getLinkToken}
        onSubmitPublicToken={onSubmitPublicToken}
        onError={onError}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /connect bank/i }));
      await Promise.resolve();
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByRole("alert").textContent).toBe("Failed to get link token");
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Failed to get link token" })
    );
  });
});
