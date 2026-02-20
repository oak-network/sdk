import { createOakClient } from '../../src';
import { Crowdsplit } from '../../src/products/crowdsplit';
import type { CreatePaymentRequest } from '../../src/types/payment';
import { ApiError } from '../../src/utils/errorHandler';
import { getConfigFromEnv } from '../config';

/**
 * Generate a valid CPF (Brazilian personal tax ID) for test customers.
 */
const generateCpf = (): string => {
  const digits = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 10),
  );
  const calcDigit = (numbers: number[], factor: number): number => {
    const sum = numbers.reduce(
      (total, num, idx) => total + num * (factor - idx),
      0,
    );
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  const first = calcDigit(digits, 10);
  const second = calcDigit([...digits, first], 11);
  return [...digits, first, second].join('');
};

/**
 * Build a PagarMe PIX payment request according to the API documentation.
 *
 * Source fields:
 *   - amount (number, sandbox: min 100 – max 10000)
 *   - currency ('brl')
 *   - customer ({ id })
 *   - payment_method ({ type: 'pix', expiry_date })
 *
 * NOTE: capture_method is NOT allowed for PagarMe PIX (API returns 422).
 */
const buildPagarMePixPaymentRequest = (
  customerId: string,
  confirm = false,
): CreatePaymentRequest =>
  ({
    provider: 'pagar_me',
    source: {
      amount: 100,
      currency: 'brl',
      customer: { id: customerId },
      payment_method: { type: 'pix', expiry_date: '2030-01-01' },
    },
    confirm,
  }) as unknown as CreatePaymentRequest;

/**
 * Build a Stripe card payment request according to the API documentation.
 *
 * Source fields:
 *   - amount (number, sandbox: min 100 – max 10000)
 *   - currency (string, e.g., 'usd')
 *   - payment_method ({ type: 'card', id?: string })
 *   - capture_method ('automatic') — REQUIRED for Stripe
 *
 * Optional top-level fields:
 *   - destination ({ customer: { id }, currency })
 *   - confirm (boolean)
 *   - metadata (Record<string, string>)
 */
const buildStripePaymentRequest = (
  customerId?: string,
  confirm = false,
): CreatePaymentRequest => {
  const stripePaymentMethodId =
    process.env.STRIPE_PAYMENT_METHOD_ID ?? undefined;

  const paymentDestinationCustomerId =
    process.env.PAYMENT_DESTINATION_CUSTOMER_ID ?? undefined;

  const request: Record<string, unknown> = {
    provider: 'stripe',
    source: {
      amount: 1500,
      currency: 'usd',
      payment_method: {
        type: 'card',
        ...(stripePaymentMethodId ? { id: stripePaymentMethodId } : {}),
      },
      capture_method: 'automatic',
      ...(customerId ? { customer: { id: customerId } } : {}),
    },
    confirm,
    metadata: {
      order_id: `test-${Date.now()}`,
      customer_email: 'integration-test@example.com',
    },
  };

  if (paymentDestinationCustomerId) {
    request.destination = {
      customer: { id: paymentDestinationCustomerId },
      currency: 'usd',
    };
  }

  return request as unknown as CreatePaymentRequest;
};

const formatError = (error: unknown): string => {
  if (error instanceof ApiError) {
    let body = 'unknown body';
    try {
      body = JSON.stringify(error.body);
    } catch {
      body = 'unserializable body';
    }
    return `ApiError ${error.status}: ${error.message} - ${body}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
};

const isCustomerNotFoundError = (error: unknown): boolean => {
  const check = (e: unknown): boolean => {
    if (e instanceof ApiError)
      return (
        (e.status === 400 || e.status === 404) &&
        (String(e.message).toLowerCase().includes('customer not found') ||
          String(e.body ?? '')
            .toLowerCase()
            .includes('customer not found'))
      );
    if (e instanceof Error)
      return (
        e.message.toLowerCase().includes('customer not found') ||
        check((e as Error & { cause?: unknown }).cause)
      );
    return false;
  };
  return check(error);
};

/**
 * Returns true if the error indicates a customer is not approved for
 * the requested provider (sandbox registration timing issue).
 */
const isProviderNotApprovedError = (error: unknown): boolean => {
  const check = (e: unknown): boolean => {
    if (e instanceof ApiError)
      return (
        e.status === 400 &&
        (String(e.message).toLowerCase().includes('not approved') ||
          String(e.body ?? '')
            .toLowerCase()
            .includes('not approved'))
      );
    if (e instanceof Error)
      return (
        e.message.toLowerCase().includes('not approved') ||
        check((e as Error & { cause?: unknown }).cause)
      );
    return false;
  };
  return check(error);
};

describe('PaymentService - Integration', () => {
  let payments: ReturnType<typeof Crowdsplit>['payments'];
  let customers: ReturnType<typeof Crowdsplit>['customers'];
  let providers: ReturnType<typeof Crowdsplit>['providers'];
  let customerId: string;
  let hasValidPaymentCustomer = false;
  let setupFailureReason = '';

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
    customers = cs.customers;
    payments = cs.payments;
    providers = cs.providers;
    // Always create a fresh customer so tests are self-contained
    // and don't depend on pre-existing sandbox data.
    const cpf = generateCpf();
    const email = `payment_test_${Date.now()}@example.com`;
    const createRes = await customers.create({
      document_number: cpf,
      document_type: 'personal_tax_id',
      email,
      first_name: 'Test',
      last_name: 'Payment',
      dob: '1997-04-01',
      phone_country_code: '55',
      phone_area_code: '18',
      phone_number: '998121211',
    });

    if (createRes.ok) {
      customerId = (createRes.value.data.id ??
        createRes.value.data.customer_id) as string;
      hasValidPaymentCustomer = true;
    } else {
      setupFailureReason = `Failed to create test customer: ${formatError(createRes.error)}`;
    }

    // Per the API documentation, customers must be registered with
    // the provider before payments can be created.
    if (hasValidPaymentCustomer) {
      await Promise.allSettled([
        providers.submitRegistration(customerId, {
          provider: 'stripe',
          target_role: 'customer',
        }),
        providers.submitRegistration(customerId, {
          provider: 'pagar_me',
          target_role: 'customer',
        }),
      ]);
    }

    // Log setup outcome so it's clear in test output.
    if (!hasValidPaymentCustomer) {
      console.warn(
        `⚠️  Customer-dependent tests will FAIL: ${setupFailureReason}`,
      );
    }
  });

  /**
   * Asserts the test has a valid customer, otherwise fails with a
   * clear message instead of silently passing.
   */
  const requireCustomerOrFail = () => {
    if (!hasValidPaymentCustomer) {
      throw new Error(
        `Test cannot run: no valid customer available. ${setupFailureReason}`,
      );
    }
  };

  /**
   * Attempt to register the customer with a provider.
   * This is required before creating payments per the API docs.
   */
  const ensureProviderRegistration = async (
    provider: 'stripe' | 'pagar_me',
  ) => {
    if (!customerId) {
      return false;
    }
    const response = await providers.submitRegistration(customerId, {
      provider,
      target_role: 'customer',
    });
    return response.ok;
  };

  /**
   * Helper to create a payment, trying multiple providers/strategies
   * until one succeeds.  Throws on failure — never silently swallows.
   */
  const createPaymentForTests = async ({
    confirm = false,
    requireCustomer = false,
  }: {
    confirm?: boolean;
    requireCustomer?: boolean;
  } = {}) => {
    const paymentCustomerId = customerId || process.env.PAYMENT_CUSTOMER_ID;
    if (requireCustomer && !paymentCustomerId) {
      throw new Error(
        'PAYMENT_CUSTOMER_ID is required to run customer-specific payment tests.',
      );
    }

    const requests: CreatePaymentRequest[] = requireCustomer
      ? [
          ...(paymentCustomerId
            ? [
                buildStripePaymentRequest(paymentCustomerId, confirm),
                buildPagarMePixPaymentRequest(paymentCustomerId, confirm),
              ]
            : []),
        ]
      : [
          buildStripePaymentRequest(undefined, confirm),
          ...(paymentCustomerId
            ? [
                buildStripePaymentRequest(paymentCustomerId, confirm),
                buildPagarMePixPaymentRequest(paymentCustomerId, confirm),
              ]
            : []),
        ];

    let lastError: unknown;
    for (const request of requests) {
      const response = await payments.create(request);
      if (response.ok) {
        return response.value;
      }
      lastError = response.error;

      // If customer is not found or not approved at the provider,
      // try registering and retry once.
      if (
        response.error instanceof ApiError &&
        (isCustomerNotFoundError(response.error) ||
          isProviderNotApprovedError(response.error))
      ) {
        const provider =
          request.provider === 'pagar_me' ? 'pagar_me' : 'stripe';
        await ensureProviderRegistration(provider);
        const retry = await payments.create(request);
        if (retry.ok) {
          return retry.value;
        }
        lastError = retry.error;
      }
    }
    throw new Error(
      `Unable to create payment for integration tests. ${formatError(lastError)}`,
    );
  };

  // ---------------------------------------------------------------
  // Payment creation tests
  // ---------------------------------------------------------------
  it('should create a payment with a valid customer', async () => {
    requireCustomerOrFail();

    const response = await createPaymentForTests({
      confirm: false,
      requireCustomer: true,
    });

    expect(response.data.id).toBeDefined();
    expect(response.data.provider).toBeDefined();
  });

  it('should return an error for an invalid customer', async () => {
    const response = await payments.create(
      buildPagarMePixPaymentRequest('non-existent-id'),
    );
    expect(response.ok).toBe(false);
  });

  // ---------------------------------------------------------------
  // Customer validation tests
  // ---------------------------------------------------------------
  it('should validate that an invalid client ID returns an error', async () => {
    const invalidCustomerId = 'invalid-customer-id-123';
    const customerResponse = await customers.get(invalidCustomerId);
    expect(customerResponse.ok).toBe(false);
    if (!customerResponse.ok) {
      expect(customerResponse.error).toBeDefined();
    }
  });

  it('should validate that the client of the client ID is valid', async () => {
    requireCustomerOrFail();

    expect(customerId).toBeDefined();

    const customerResponse = await customers.get(customerId);
    expect(customerResponse.ok).toBe(true);

    if (customerResponse.ok) {
      const id =
        customerResponse.value.data.id ??
        customerResponse.value.data.customer_id;
      expect(id).toEqual(customerId);
      expect(customerResponse.value.data).toBeDefined();
      expect(customerResponse.value.data.email).toBeDefined();
    } else {
      throw new Error(
        `Customer ID ${customerId} is not valid. Error: ${formatError(customerResponse.error)}`,
      );
    }
  });

  // ---------------------------------------------------------------
  // Payment confirm tests
  // ---------------------------------------------------------------
  it('should confirm a payment with a valid ID', async () => {
    requireCustomerOrFail();

    const createResponse = await createPaymentForTests({ confirm: false });

    const paymentId = createResponse.data.id;
    const response = await payments.confirm(paymentId);
    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.value.data.id).toEqual(paymentId);
    }
  });

  it('should return an error for an invalid confirm ID', async () => {
    const response = await payments.confirm('non-existent-id');
    expect(response.ok).toBe(false);
  });

  // ---------------------------------------------------------------
  // Payment cancel tests
  // ---------------------------------------------------------------
  it('should cancel a payment with a valid ID', async () => {
    requireCustomerOrFail();

    const createResponse = await createPaymentForTests({ confirm: false });

    const paymentId = createResponse.data.id;
    const response = await payments.cancel(paymentId);
    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.value.data.id).toEqual(paymentId);
    }
  });

  it('should return an error for an invalid cancel ID', async () => {
    const response = await payments.cancel('non-existent-id');
    expect(response.ok).toBe(false);
  });
});
