import { createOakClient } from "../../src";
import { Crowdsplit } from "../../src/products/crowdsplit";
import { getConfigFromEnv } from "../config";

const INTEGRATION_TEST_TIMEOUT = 30000;

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
        maxNumberOfRetries: 2,
        delay: 500,
        backoffFactor: 2,
      },
    });
    customers = Crowdsplit(client).customers;
  });

  let createdCustomerId: string | undefined;

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
    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.value.data.id).toBeDefined();
      expect(response.value.data.email).toEqual(email);
      createdCustomerId = response.value.data.id as string;
    }
  }, INTEGRATION_TEST_TIMEOUT);

  it("should get the created customer", async () => {
    if (!createdCustomerId) {
      console.warn("Skipping: createdCustomerId not available from previous test");
      return;
    }
    const response = await customers.get(createdCustomerId);
    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.value.data.id).toEqual(createdCustomerId);
    }
  }, INTEGRATION_TEST_TIMEOUT);

  it("should update the customer", async () => {
    if (!createdCustomerId) {
      console.warn("Skipping: createdCustomerId not available from previous test");
      return;
    }
    const response = await customers.update(createdCustomerId, {
      first_name: "UpdatedName",
    });
    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.value.data.first_name).toEqual("UpdatedName");
    }
  }, INTEGRATION_TEST_TIMEOUT);

  it("should list customers", async () => {
    const response = await customers.list({ limit: 5 });
    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(Array.isArray(response.value.data.customer_list)).toBe(true);
      expect(response.value.data.customer_list.length).toBeGreaterThan(0);
    }
  }, INTEGRATION_TEST_TIMEOUT);

  it("should handle invalid customer ID gracefully", async () => {
    const response = await customers.get("non-existent-id");
    expect(response.ok).toBe(false);
  }, INTEGRATION_TEST_TIMEOUT);
});
