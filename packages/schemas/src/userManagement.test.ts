import { describe, expect, it } from "vitest";

import {
  approveAccessRequestSchema,
  clientInvitationSchema,
  declineAccessRequestSchema,
  idSchema,
  localeSchema,
  membershipUpdateSchema,
  requestAccessSchema,
  staffInvitationSchema,
  staffUpdateSchema,
} from "@sdk-e/schemas/userManagement";
import { companyCreationSchema } from "@sdk-e/schemas/company";

const uuid = "123e4567-e89b-12d3-a456-426614174000";

describe("localeSchema", () => {
  it.each(["en", "fr"])("accepts %s", (locale) => {
    expect(localeSchema.safeParse(locale).success).toBe(true);
  });

  it("rejects unsupported locales", () => {
    expect(localeSchema.safeParse("xx").success).toBe(false);
  });
});

describe("clientInvitationSchema", () => {
  it("trims and lowercases the invite email", () => {
    const result = clientInvitationSchema.parse({
      email: "  New.User@Example.com ",
      role: "PROJECT_MEMBER",
    });
    expect(result.email).toBe("new.user@example.com");
  });

  it.each(["ADMINISTRATOR", "PROJECT_MEMBER", "BILLING", "VIEWER"])("accepts role %s", (role) => {
    expect(clientInvitationSchema.safeParse({ email: "a@b.com", role }).success).toBe(true);
  });

  it("rejects invalid emails and non-manageable roles", () => {
    expect(clientInvitationSchema.safeParse({ email: "nope", role: "OWNER" }).success).toBe(false);
    expect(clientInvitationSchema.safeParse({ email: "a@b.com", role: "OWNER" }).success).toBe(
      false
    );
  });
});

describe("manageable role schemas", () => {
  it("accepts client and staff roles in invitations", () => {
    expect(staffInvitationSchema.safeParse({ email: "a@b.com", role: "DELIVERY" }).success).toBe(
      true
    );
    expect(staffInvitationSchema.safeParse({ email: "a@b.com", role: "OWNER" }).success).toBe(
      false
    );
  });

  it("validates membership updates against client roles", () => {
    expect(
      membershipUpdateSchema.safeParse({ membershipId: uuid, role: "PROJECT_MEMBER" }).success
    ).toBe(true);
    expect(membershipUpdateSchema.safeParse({ membershipId: "nope", role: "OWNER" }).success).toBe(
      false
    );
  });
});

describe("staffUpdateSchema", () => {
  it("accepts a standalone role change", () => {
    expect(staffUpdateSchema.safeParse({ userId: uuid, role: "DELIVERY" }).success).toBe(true);
  });

  it("accepts a standalone active flag", () => {
    expect(staffUpdateSchema.safeParse({ userId: uuid, isActive: "false" }).success).toBe(true);
  });

  it("requires at least one field", () => {
    expect(staffUpdateSchema.safeParse({ userId: uuid }).success).toBe(false);
  });

  it("rejects invalid user ids and role values", () => {
    expect(staffUpdateSchema.safeParse({ userId: "nope", role: "OWNER" }).success).toBe(false);
  });
});

describe("access request schemas", () => {
  it("validates company access codes", () => {
    expect(requestAccessSchema.safeParse({ code: "abcd" }).success).toBe(true);
    expect(requestAccessSchema.safeParse({ code: "ab" }).success).toBe(false);
    expect(requestAccessSchema.safeParse({ code: "  " }).success).toBe(false);
  });

  it("validates access request resolution", () => {
    expect(approveAccessRequestSchema.safeParse({ requestId: uuid, role: "VIEWER" }).success).toBe(
      true
    );
    expect(declineAccessRequestSchema.safeParse({ requestId: uuid }).success).toBe(true);
    expect(approveAccessRequestSchema.safeParse({ requestId: "nope", role: "OWNER" }).success).toBe(
      false
    );
  });
});

describe("idSchema and companyCreationSchema", () => {
  it("requires a uuid for ids", () => {
    expect(idSchema.safeParse(uuid).success).toBe(true);
    expect(idSchema.safeParse("request-1").success).toBe(false);
  });

  it("trims company names and enforces length", () => {
    expect(companyCreationSchema.safeParse({ name: "  Acme  " }).success).toBe(true);
    expect(companyCreationSchema.safeParse({ name: "A" }).success).toBe(false);
    expect(companyCreationSchema.safeParse({ name: "" }).success).toBe(false);
  });
});
