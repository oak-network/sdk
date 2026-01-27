// tests/integration/customerService.integration.test.ts
import { CustomerService } from "../../src/services/customerService";
import { AuthService } from "../../src/services/authService";
import { SDKConfig } from "../../src/types";
import { getConfigFromEnv } from "../config";

describe("CustomerService - Integration", () => {
  let customerService: CustomerService;
  let config: SDKConfig;
  let authService: AuthService;

  beforeAll(() => {
    authService = new AuthService(getConfigFromEnv(), {
      maxNumberOfRetries: 1,
      delay: 200,
      backoffFactor: 2,
    });
    customerService = new CustomerService(getConfigFromEnv(), authService, {
      maxNumberOfRetries: 1,
      delay: 200,
      backoffFactor: 2,
    });
  });

  let createdCustomerId: string;

  it("should create a customer", async () => {
    const formData = new URLSearchParams();
    formData.append("acao", "gerar_cpf");
    formData.append("pontuacao", "N");
    formData.append("cpf_estado", "SP"); // replace 'SP' or set '' if indifferent

    const res = await fetch("https://www.4devs.com.br/ferramentas_online.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // sometimes you may need: 'X-Requested-With': 'XMLHttpRequest'
      },
      body: formData.toString(),
    });

    const document_number = (await res.json()).toString();

    const email = `test_${Date.now()}@example.com`;
    const response = await customerService.createCustomer({
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
    const response = await customerService.getCustomer(createdCustomerId);
    expect(response.data.id).toEqual(createdCustomerId);
  });

  it("should update the customer", async () => {
    const response = await customerService.updateCustomer(createdCustomerId, {
      first_name: "UpdatedName",
    });
    expect(response.data.first_name).toEqual("UpdatedName");
  });

  it("should list customers", async () => {
    const response = await customerService.getAllCustomers({ limit: 5 });
    expect(Array.isArray(response.data.customer_list)).toBe(true);
    expect(response.data.customer_list.length).toBeGreaterThan(0);
  });

  it("should handle invalid customer ID gracefully", async () => {
    await expect(
      customerService.getCustomer("non-existent-id")
    ).rejects.toThrow();
  });
});
