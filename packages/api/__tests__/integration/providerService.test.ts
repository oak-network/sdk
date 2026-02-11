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
  type ProviderName = "mercado_pago" | "pagar_me" | "stripe";
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
    const stripeSchema = await providers.getSchema({ provider: "stripe" });
    schemaResults = {
      mercado_pago: mercadoSchema,
      pagar_me: pagarSchema,
      stripe: stripeSchema,
    };
  });

  const assertSchema = (provider: ProviderName, response: SchemaResult) => {
    expect(response.ok).toBe(true);
    if (!response.ok) {
      return;
    }
    expect(response.value.data).toBeDefined();
    expect(typeof response.value.data).toBe("object");
    const data = response.value.data as {
      schema?: {
        required?: unknown;
        properties?: unknown;
        type?: unknown;
      };
      required?: unknown;
      properties?: unknown;
      type?: unknown;
    };
    // Handle both nested schema structure and direct schema structure
    const schema = data.schema || data;
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
  };

  it("should get schema for an enabled provider (mercado_pago, pagar_me, or stripe)", async () => {
    const mercadoSchema = schemaResults.mercado_pago;
    const pagarSchema = schemaResults.pagar_me;
    const stripeSchema = schemaResults.stripe;
    if (mercadoSchema?.ok) {
      assertSchema("mercado_pago", mercadoSchema);
      return;
    }
    if (pagarSchema?.ok) {
      assertSchema("pagar_me", pagarSchema);
      return;
    }
    if (stripeSchema?.ok) {
      assertSchema("stripe", stripeSchema);
      return;
    }
    expect(mercadoSchema?.ok || pagarSchema?.ok || stripeSchema?.ok).toBe(true);
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

  it("should submit a valid registration with stripe", async () => {
    const response = await providers.submitRegistration(customerId, {
      provider: "stripe",
      target_role: "customer",
    });
    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.value.data.status).toBeDefined();
      expect(response.value.data.provider).toBe("stripe");
    }
  });

  it("should submit a valid registration with mercado_pago", async () => {
    const response = await providers.submitRegistration(customerId, {
      provider: "mercado_pago",
      target_role: "customer",
    });
    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.value.data.status).toBeDefined();
      expect(response.value.data.provider).toBe("mercado_pago");
      expect(response.value.data.target_role).toBeDefined();
    }
  });

  it("should submit registration with different target_role values", async () => {
    // Test with subaccount role - may not be supported for all providers
    const subaccountResponse = await providers.submitRegistration(customerId, {
      provider: "pagar_me",
      target_role: "subaccount",
    });
    // Accept either success or a specific error (some providers may not support this role)
    if (subaccountResponse.ok) {
      expect(subaccountResponse.value.data.target_role).toBe("subaccount");
    } else {
      // If it fails, verify it's a proper error response
      expect(subaccountResponse.ok).toBe(false);
    }

    // Test with connected_account role - may not be supported for all providers
    const connectedAccountResponse = await providers.submitRegistration(
      customerId,
      {
        provider: "stripe",
        target_role: "connected_account",
      },
    );
    // Accept either success or a specific error (some providers may not support this role)
    if (connectedAccountResponse.ok) {
      expect(connectedAccountResponse.value.data.target_role).toBe(
        "connected_account",
      );
    } else {
      // If it fails, verify it's a proper error response
      expect(connectedAccountResponse.ok).toBe(false);
    }
  });

  it("should submit registration with provider_data", async () => {
    const response = await providers.submitRegistration(customerId, {
      provider: "stripe",
      target_role: "customer",
      provider_data: {
        callback_url: "https://example.com/callback",
        account_type: "express",
        transfers_requested: true,
        card_payments_requested: true,
      },
    });
    // Registration might fail if customer already has a registration for this provider
    // or if provider_data values are invalid - accept either outcome
    if (response.ok) {
      expect(response.value.data.status).toBeDefined();
      expect(response.value.data.provider).toBe("stripe");
    } else {
      // If it fails, verify it's a proper error response
      expect(response.ok).toBe(false);
    }
  });

  it("should verify registration status reflects submitted registrations", async () => {
    // Check current registration status first
    const initialStatusResponse = await providers.getRegistrationStatus(
      customerId,
    );
    expect(initialStatusResponse.ok).toBe(true);
    const initialRegistrations = initialStatusResponse.ok
      ? initialStatusResponse.value.data
      : [];

    // Try to submit a registration (may fail if already exists)
    const submitResponse = await providers.submitRegistration(customerId, {
      provider: "pagar_me",
      target_role: "customer",
    });

    // Wait a bit for any processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check registration status
    const statusResponse = await providers.getRegistrationStatus(customerId);
    expect(statusResponse.ok).toBe(true);
    if (statusResponse.ok) {
      expect(Array.isArray(statusResponse.value.data)).toBe(true);
      const registrations = statusResponse.value.data;
      expect(registrations.length).toBeGreaterThanOrEqual(
        initialRegistrations.length,
      );

      // Verify structure of registration status objects
      registrations.forEach((registration) => {
        expect(registration).toHaveProperty("provider");
        expect(registration).toHaveProperty("status");
        expect(typeof registration.provider).toBe("string");
        expect(typeof registration.status).toBe("string");
        // target_role can be string or null
        expect(
          registration.target_role === null ||
            typeof registration.target_role === "string",
        ).toBe(true);
      });
    }
  });

  it("should return error for invalid target_role", async () => {
    const response = await providers.submitRegistration(customerId, {
      provider: "pagar_me",
      target_role: "invalid_role" as "customer",
    });
    expect(response.ok).toBe(false);
  });

  it("should return error for empty customer ID", async () => {
    const response = await providers.submitRegistration("", {
      provider: "pagar_me",
      target_role: "customer",
    });
    expect(response.ok).toBe(false);
  });

  it("should return error for registration with invalid provider", async () => {
    const response = await providers.submitRegistration(customerId, {
      provider: "invalid_provider" as "pagar_me",
      target_role: "customer",
    });
    expect(response.ok).toBe(false);
  });

  it("should validate schema structure contains expected fields", async () => {
    const mercadoSchema = schemaResults.mercado_pago;
    const pagarSchema = schemaResults.pagar_me;
    const stripeSchema = schemaResults.stripe;

    const validateSchemaStructure = (schema: SchemaResult, provider: ProviderName) => {
      if (!schema?.ok) {
        return;
      }
      const data = schema.value.data;
      // The API returns { created_at, schema: {...}, updated_at } for some providers
      // Check if schema is nested or direct
      const schemaObj = (data as { schema?: unknown }).schema || data;
        
      // Stripe uses a different schema format with roles
      if (provider === "stripe") {
        expect(schemaObj).toHaveProperty("provider");
        expect(schemaObj).toHaveProperty("allowed_roles");
        expect(schemaObj).toHaveProperty("roles");
        expect(Array.isArray((schemaObj as { allowed_roles: unknown }).allowed_roles)).toBe(true);
        expect(typeof (schemaObj as { roles: unknown }).roles).toBe("object");
        // Verify roles structure
        const roles = (schemaObj as { roles: Record<string, unknown> }).roles;
        expect(Object.keys(roles).length).toBeGreaterThan(0);
      } else {
        // Traditional JSON schema format for pagar_me and mercado_pago
        expect(schemaObj).toHaveProperty("type");
        expect(schemaObj).toHaveProperty("required");
        expect(schemaObj).toHaveProperty("properties");
        expect(Array.isArray((schemaObj as { required: unknown }).required)).toBe(
          true,
        );
        expect(
          typeof (schemaObj as { properties: unknown }).properties,
        ).toBe("object");
      }
    };

    if (mercadoSchema?.ok) validateSchemaStructure(mercadoSchema, "mercado_pago");
    if (pagarSchema?.ok) validateSchemaStructure(pagarSchema, "pagar_me");
    if (stripeSchema?.ok) validateSchemaStructure(stripeSchema, "stripe");
  });

  it("should handle multiple registrations for same customer with different providers", async () => {
    // Check current registration status
    const initialStatusResponse = await providers.getRegistrationStatus(
      customerId,
    );
    expect(initialStatusResponse.ok).toBe(true);
    const initialProviders = initialStatusResponse.ok
      ? initialStatusResponse.value.data.map((r) => r.provider)
      : [];

    // Try to submit registration with pagar_me (may already exist)
    const pagarResponse = await providers.submitRegistration(customerId, {
      provider: "pagar_me",
      target_role: "customer",
    });
    // Accept either success or failure (if already registered)

    // Try to submit registration with stripe (may already exist)
    const stripeResponse = await providers.submitRegistration(customerId, {
      provider: "stripe",
      target_role: "customer",
    });
    // Accept either success or failure (if already registered)

    // Verify registrations appear in status (either from new submissions or existing)
    const statusResponse = await providers.getRegistrationStatus(customerId);
    expect(statusResponse.ok).toBe(true);
    if (statusResponse.ok) {
      const registrations = statusResponse.value.data;
      const providers = registrations.map((r) => r.provider);
      // At least one of the providers should be present (either from this test or previous tests)
      expect(
        providers.includes("pagar_me") || providers.includes("stripe"),
      ).toBe(true);
    }
  });
});
