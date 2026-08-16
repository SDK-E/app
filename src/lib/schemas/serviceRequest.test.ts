import { describe, expect, it } from "vitest";

import {
  requestDraftSchema,
  requestSubmissionSchema,
  sdkRequestDecisionSchema,
} from "./serviceRequest";

const valid = {
  title: "Modernize the order platform",
  capability: "modernization",
  description:
    "We need to understand the safest path away from the current platform before the next contract renewal.",
  businessContext: "The order workflow supports daily operations across two business teams.",
  supportingInformation: "",
  supportingLinks: ["https://example.com/architecture"],
};

describe("service request validation", () => {
  it("allows partial descriptive content in a draft", () => {
    expect(
      requestDraftSchema.safeParse({ ...valid, description: "Early notes", businessContext: "" })
        .success
    ).toBe(true);
  });

  it("requires complete context for submission", () => {
    expect(requestSubmissionSchema.safeParse({ ...valid, description: "Too short" }).success).toBe(
      false
    );
    expect(requestSubmissionSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts only HTTP(S) supporting links", () => {
    expect(
      requestDraftSchema.safeParse({ ...valid, supportingLinks: ["javascript:alert(1)"] }).success
    ).toBe(false);
  });

  it("requires meaningful SDK decision content", () => {
    expect(
      sdkRequestDecisionSchema.safeParse({ decision: "request-information", content: "Short" })
        .success
    ).toBe(false);
    expect(
      sdkRequestDecisionSchema.safeParse({
        decision: "request-information",
        content: "Which deployment constraint is fixed?",
      }).success
    ).toBe(true);
  });
});
