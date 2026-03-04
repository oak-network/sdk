export const mockConnectInstance = {
  create: jest.fn(),
  update: jest.fn(),
  logout: jest.fn().mockResolvedValue(undefined),
};

export const loadConnectAndInitialize = jest.fn(() => mockConnectInstance);
