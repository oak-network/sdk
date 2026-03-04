export const mockOpen = jest.fn();
export const mockReady = true;

/** Last config passed to usePlaidLink (so tests can invoke onSuccess/onExit). */
export let lastPlaidConfig: {
  onSuccess: (publicToken: string) => void;
  onExit: () => void;
  token: string | null;
} | null = null;

export const usePlaidLink = jest.fn((config: unknown) => {
  lastPlaidConfig = config as typeof lastPlaidConfig;
  return {
    open: mockOpen,
    ready: mockReady,
    exit: jest.fn(),
    submit: jest.fn(),
    error: null,
  };
});
