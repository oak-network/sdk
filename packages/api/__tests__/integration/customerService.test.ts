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

  it("should create a customer", async () => {
    const document_number = generateCpf();

    const email = `test_${Date.now()}@example.com`;
    const response = await customers.create({
      document_number,
      document_type: "personal_tax_id",
      email,
      first_name: "Adr",
      last_name: "Cius",
      dob: "1997-04-01",
      phone_country_code: "55",
      phone_area_code: "18",
      phone_number: "998121211",
    });
    expect(response.data.id).toBeDefined();
    expect(response.data.email).toEqual(email);
    createdCustomerId = response.data.id as string;
  });

  it("should get the created customer", async () => {
    const response = await customers.get(createdCustomerId);
    expect(response.data.id).toEqual(createdCustomerId);
  });

  it("should update the customer", async () => {
    const response = await customers.update(createdCustomerId, {
      first_name: "UpdatedName",
    });
    expect(response.data.first_name).toEqual("UpdatedName");
  });

  it("should list customers", async () => {
    const response = await customers.list({ limit: 5 });
    expect(Array.isArray(response.data.customer_list)).toBe(true);
    expect(response.data.customer_list.length).toBeGreaterThan(0);
  });

  it("should handle invalid customer ID gracefully", async () => {
    await expect(
      customers.get("non-existent-id")
    ).rejects.toThrow();
  });
});
