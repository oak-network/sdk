// tests/integration/customerService.integration.test.ts
import { createOakClient } from "../../src";
import { Crowdsplit } from "../../src/products/crowdsplit";
import { getConfigFromEnv } from "../config";

const generateCpf = (): string => {
  const digits = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 10)
  );
  const calcDigit = (numbers: number[], factor: number): number => {
    const sum = numbers.reduce(
      (total, num, idx) => total + num * (factor - idx),
      0
    );
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  const first = calcDigit(digits, 10);
  const second = calcDigit([...digits, first], 11);
  return [...digits, first, second].join("");
};

describe("CustomerService - Integration", () => {
  let customers: ReturnType<typeof Crowdsplit>["customers"];

  beforeAll(() => {
    const client = createOakClient({
      ...getConfigFromEnv(),
      retryOptions: {
        maxNumberOfRetries: 1,
        delay: 200,
        backoffFactor: 2,
      },
    });
    customers = Crowdsplit(client).customers;
  });

  let createdCustomerId: string;

  it("should create a stripe customer", async () => {
    const email = `test_${Date.now()}@example.com`;
    const response = await customers.create({
      email,
    });
    expect(response.ok).toBeTruthy();
    if (response.ok) {
      expect(response.value.data.id).toBeDefined();
      expect(response.value.data.email).toEqual(email);
      createdCustomerId = response.value.data.id as string;
    }
  });

  it(
    "should create a stripe connected account",
    async () => {
      const email = `test_${Date.now()}@example.com`;
      const country_code = "US";
      const response = await customers.create({
        email,
        country_code,
      });
      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(response.value.data.id).toBeDefined();
        expect(response.value.data.email).toEqual(email);
        expect(response.value.data.country_code).toEqual(
          country_code.toLowerCase(),
        );
        createdCustomerId = response.value.data.id as string;
      }
    },
  );

  it("should update the customer", async () => {
    const response = await customers.update(createdCustomerId, {
      first_name: "UpdatedName",
    });
    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.value.data.first_name).toEqual("UpdatedName");
    }
  });

  it(
    "should list customers",
    async () => {
      const response = await customers.list({ limit: 5 });
      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(Array.isArray(response.value.data.customer_list)).toBe(true);
        expect(response.value.data.customer_list.length).toBeGreaterThan(0);
      }
    },
  );

  it("should handle invalid customer ID gracefully", async () => {
    await expect(
      customers.get("non-existent-id")
    ).rejects.toThrow();
  });
});
