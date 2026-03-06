import { createIssue } from "../../src/preflight/issue";

describe("createIssue", () => {
  it("should create a minimal issue with required fields", () => {
    const issue = createIssue("OAK-PF-COMMON-ZERO_ADDRESS", "error", "Address is zero.");
    expect(issue).toEqual({
      code: "OAK-PF-COMMON-ZERO_ADDRESS",
      severity: "error",
      message: "Address is zero.",
    });
  });

  it("should include optional fields when provided", () => {
    const issue = createIssue("OAK-PF-TEST-CODE", "warn", "Test message", {
      fieldPath: "creator",
      suggestion: "Fix it.",
      normalized: true,
    });
    expect(issue).toEqual({
      code: "OAK-PF-TEST-CODE",
      severity: "warn",
      message: "Test message",
      fieldPath: "creator",
      suggestion: "Fix it.",
      normalized: true,
    });
  });

  it("should omit undefined optional fields", () => {
    const issue = createIssue("OAK-PF-TEST-CODE", "error", "Msg", { fieldPath: "x" });
    expect(issue).toEqual({
      code: "OAK-PF-TEST-CODE",
      severity: "error",
      message: "Msg",
      fieldPath: "x",
    });
    expect(issue).not.toHaveProperty("suggestion");
    expect(issue).not.toHaveProperty("normalized");
  });
});
