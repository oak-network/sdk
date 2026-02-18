import { createOakClient } from "../../src";
import { Crowdsplit } from "../../src/products/crowdsplit";
import { getConfigFromEnv } from "../config";

const INTEGRATION_TEST_TIMEOUT = 30000;

describe("WebhookService - Integration", () => {
  let webhooks: ReturnType<typeof Crowdsplit>["webhooks"];

  beforeAll(() => {
    const client = createOakClient({
      ...getConfigFromEnv(),
      retryOptions: {
        maxNumberOfRetries: 2,
        delay: 500,
        backoffFactor: 2,
      },
    });
    webhooks = Crowdsplit(client).webhooks;
  });

  let createdWebhookId: string | undefined;
  const testWebhookUrl = `https://webhook.site/test-${Date.now()}`;

  describe("register", () => {
    it("should register a new webhook", async () => {
      const response = await webhooks.register({
        url: testWebhookUrl,
        description: "Integration test webhook",
      });

      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(response.value.data.id).toBeDefined();
        expect(response.value.data.url).toEqual(testWebhookUrl);
        expect(response.value.data.description).toEqual("Integration test webhook");
        expect(response.value.data.is_active).toBe(true);
        expect(response.value.data.secret).toBeDefined();
        createdWebhookId = response.value.data.id;
      }
    }, INTEGRATION_TEST_TIMEOUT);

    it("should handle duplicate URL registration", async () => {
      if (!createdWebhookId) {
        console.warn("Skipping: createdWebhookId not available from previous test");
        return;
      }

      const response = await webhooks.register({
        url: testWebhookUrl,
        description: "Duplicate webhook",
      });

      expect(response.ok).toBe(false);
    }, INTEGRATION_TEST_TIMEOUT);
  });

  describe("list", () => {
    it("should list all webhooks", async () => {
      const response = await webhooks.list();

      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(Array.isArray(response.value.data)).toBe(true);
        expect(response.value.data.length).toBeGreaterThan(0);
      }
    }, INTEGRATION_TEST_TIMEOUT);
  });

  describe("get", () => {
    it("should get the created webhook", async () => {
      if (!createdWebhookId) {
        console.warn("Skipping: createdWebhookId not available from previous test");
        return;
      }

      const response = await webhooks.get(createdWebhookId);

      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(response.value.data.id).toEqual(createdWebhookId);
        expect(response.value.data.url).toEqual(testWebhookUrl);
      }
    }, INTEGRATION_TEST_TIMEOUT);

    it("should handle invalid webhook ID gracefully", async () => {
      const response = await webhooks.get("non-existent-webhook-id");

      expect(response.ok).toBe(false);
    }, INTEGRATION_TEST_TIMEOUT);
  });

  describe("update", () => {
    it("should update the webhook", async () => {
      if (!createdWebhookId) {
        console.warn("Skipping: createdWebhookId not available from previous test");
        return;
      }

      const response = await webhooks.update(createdWebhookId, {
        description: "Updated integration test webhook",
      });

      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(response.value.data.description).toEqual("Updated integration test webhook");
      }
    }, INTEGRATION_TEST_TIMEOUT);
  });

  describe("toggle", () => {
    it("should toggle webhook status to inactive", async () => {
      if (!createdWebhookId) {
        console.warn("Skipping: createdWebhookId not available from previous test");
        return;
      }

      const response = await webhooks.toggle(createdWebhookId);

      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(response.value.data.is_active).toBe(false);
      }
    }, INTEGRATION_TEST_TIMEOUT);

    it("should toggle webhook status back to active", async () => {
      if (!createdWebhookId) {
        console.warn("Skipping: createdWebhookId not available from previous test");
        return;
      }

      const response = await webhooks.toggle(createdWebhookId);

      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(response.value.data.is_active).toBe(true);
      }
    }, INTEGRATION_TEST_TIMEOUT);
  });

  describe("notifications", () => {
    it("should list notifications with pagination", async () => {
      const response = await webhooks.listNotifications({ limit: 10, offset: 0 });

      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(response.value.data.count).toBeDefined();
        expect(Array.isArray(response.value.data.notification_list)).toBe(true);
      }
    }, INTEGRATION_TEST_TIMEOUT);

    it("should list notifications without params", async () => {
      const response = await webhooks.listNotifications();

      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(response.value.data.count).toBeDefined();
      }
    }, INTEGRATION_TEST_TIMEOUT);

    it("should handle invalid notification ID gracefully", async () => {
      const response = await webhooks.getNotification("non-existent-notification-id");

      expect(response.ok).toBe(false);
    }, INTEGRATION_TEST_TIMEOUT);
  });

  describe("delete", () => {
    it("should delete the webhook", async () => {
      if (!createdWebhookId) {
        console.warn("Skipping: createdWebhookId not available from previous test");
        return;
      }

      const response = await webhooks.delete(createdWebhookId);

      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(response.value.data.success).toBe(true);
      }
    }, INTEGRATION_TEST_TIMEOUT);

    it("should verify webhook is deleted", async () => {
      if (!createdWebhookId) {
        console.warn("Skipping: createdWebhookId not available from previous test");
        return;
      }

      const response = await webhooks.get(createdWebhookId);

      expect(response.ok).toBe(false);
    }, INTEGRATION_TEST_TIMEOUT);
  });
});
