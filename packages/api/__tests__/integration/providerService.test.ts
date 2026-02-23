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

describe("ProviderService - Integration", () => {
  let providers: ReturnType<typeof Crowdsplit>["providers"];
  let customers: ReturnType<typeof Crowdsplit>["customers"];
  let customerId: string;
  type ProviderName = "mercado_pago" | "pagar_me";
  type SchemaResult = Awaited<
    ReturnType<ReturnType<typeof Crowdsplit>["providers"]["getSchema"]>
  >;
  let schemaResults: Partial<Record<ProviderName, SchemaResult>> = {};

  beforeAll(async () => {
    const client = createOakClient({
      ...getConfigFromEnv(),
      retryOptions: {
        maxNumberOfRetries: 1,
        delay: 200,
        backoffFactor: 2,
      },
    });
    const cs = Crowdsplit(client);
    providers = cs.providers;
    customers = cs.customers;

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
      customerId = response.value.data.id as string;
    }

    const mercadoSchema = await providers.getSchema({
      provider: "mercado_pago",
    });
    const pagarSchema = await providers.getSchema({ provider: "pagar_me" });
    schemaResults = {
      mercado_pago: mercadoSchema,
      pagar_me: pagarSchema,
    };
  });

  const assertSchema = (provider: ProviderName, response: SchemaResult) => {
    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.value.data).toBeDefined();
      expect(typeof response.value.data).toBe("object");
      const schema = response.value.data as {
        required?: unknown;
        properties?: unknown;
        type?: unknown;
      };
      if (schema.required !== undefined) {
        expect(Array.isArray(schema.required)).toBe(true);
      }
      if (schema.properties !== undefined) {
        expect(typeof schema.properties).toBe("object");
      }
      if (schema.type !== undefined) {
        expect(schema.type).toBeDefined();
      }
      console.log(`Using provider schema: ${provider}`);
    }
  };

  it("should get schema for an enabled provider (mercado_pago or pagar_me)", async () => {
    const mercadoSchema = schemaResults.mercado_pago;
    const pagarSchema = schemaResults.pagar_me;
    if (mercadoSchema?.ok) {
      assertSchema("mercado_pago", mercadoSchema);
      return;
    }
    if (pagarSchema?.ok) {
      assertSchema("pagar_me", pagarSchema);
      return;
    }
    expect(mercadoSchema?.ok || pagarSchema?.ok).toBe(true);
  });

  it("should return an error for invalid provider schema request", async () => {
    const response = await providers.getSchema({
      provider: "invalid_provider" as "pagar_me",
    });
    expect(response.ok).toBe(false);
  });

  it("should get registration status for a valid customer", async () => {
    const response = await providers.getRegistrationStatus(customerId);
    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(Array.isArray(response.value.data)).toBe(true);
    }
  });

  it("should return an error for invalid customer registration status", async () => {
    const response = await providers.getRegistrationStatus("non-existent-id");
    expect(response.ok).toBe(false);
  });

  it("should submit a valid registration", async () => {
    const response = await providers.submitRegistration(customerId, {
      provider: "pagar_me",
      target_role: "customer",
    });
    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.value.data.status).toBeDefined();
      expect(response.value.data.provider).toBe("pagar_me");
    }
  });
});
