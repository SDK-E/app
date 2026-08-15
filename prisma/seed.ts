/**
 * ============================================================================
 * DEVELOPMENT SEED DATA
 * ============================================================================
 * WARNING: This file contains DEVELOPMENT-ONLY seed data.
 *
 * This script is intended for local development and testing environments ONLY.
 * Do NOT run this in production. It creates synthetic data with fictional
 * companies, users, and records that do not represent real individuals or
 * organizations.
 *
 * Run with:
 *   npx prisma db seed
 *
 * Prerequisites:
 *   - DATABASE_URL must be set in your .env file
 *   - Prisma client must be generated (npx prisma generate)
 *   - Database schema must be migrated (npx prisma migrate dev)
 * ============================================================================
 */

import { PrismaClient, Prisma } from "@/generated/prisma/client";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEV_EMAILS = [
  "alice@acme-corp.test",
  "bob@acme-corp.test",
  "carol@acme-corp.test",
  "dave@globex.test",
  "eve@globex.test",
  "frank@globex.test",
  "grace@initech.test",
  "henry@initech.test",
  "ivy@initech.test",
  "jack@hooli.test",
  "kate@hooli.test",
  "liam@hooli.test",
];

const DEV_NAMES = [
  "Alice Johnson",
  "Bob Smith",
  "Carol White",
  "Dave Brown",
  "Eve Davis",
  "Frank Miller",
  "Grace Wilson",
  "Henry Moore",
  "Ivy Taylor",
  "Jack Anderson",
  "Kate Thomas",
  "Liam Jackson",
];

const now = new Date();
const pastDate = (daysAgo: number) =>
  new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
const futureDate = (daysFromNow: number) =>
  new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);

const randomEnum = <T>(values: readonly T[]): T =>
  values[Math.floor(Math.random() * values.length)];

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

async function createCompanies() {
  const companies = [
    { name: "Acme Corp", slug: "acme-corp" },
    { name: "Globex", slug: "globex" },
    { name: "Initech", slug: "initech" },
    { name: "Hooli", slug: "hooli" },
  ];

  return prisma.company.createMany({
    data: companies,
    skipDuplicates: true,
  });
}

async function createUsers() {
  const users = DEV_EMAILS.map((email, index) => ({
    auth0Sub: `auth0|dev-seed-${index + 1}`,
    email,
    name: DEV_NAMES[index],
    avatarUrl: email.includes("acme")
      ? "https://api.dicebear.com/7.x/avataaars/svg?seed=acme"
      : email.includes("globex")
        ? "https://api.dicebear.com/7.x/avataaars/svg?seed=globex"
        : email.includes("initech")
          ? "https://api.dicebear.com/7.x/avataaars/svg?seed=initech"
          : "https://api.dicebear.com/7.x/avataaars/svg?seed=hooli",
    isActive: true,
    lastLoginAt: pastDate(Math.floor(Math.random() * 30)),
  }));

  return prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });
}

async function createMemberships(companies: { id: string; slug: string }[], users: { id: string }[]) {
  const memberships: {
    userId: string;
    companyId: string;
    role: ClientRole;
    invitedBy?: string;
    invitedAt?: Date;
    joinedAt: Date;
  }[] = [];

  const companyUsers = companies.reduce<Record<string, string[]>>((acc, company) => {
    const shuffled = [...users].sort(() => Math.random() - 0.5);
    acc[company.id] = shuffled.slice(0, 3).map((u) => u.id);
    return acc;
  }, {});

  for (const company of companies) {
    const userIds = companyUsers[company.id] || [];
    for (const userId of userIds) {
      const role: ClientRole =
        company.slug === "acme-corp" && userId === users[0].id
          ? "COMPANY_ADMIN"
          : Math.random() > 0.7
            ? "VIEWER"
            : "MEMBER";

      memberships.push({
        userId,
        companyId: company.id,
        role,
        invitedBy: users[0].id,
        invitedAt: pastDate(Math.floor(Math.random() * 14)),
        joinedAt: pastDate(Math.floor(Math.random() * 10)),
      });
    }
  }

  return prisma.membership.createMany({
    data: memberships,
    skipDuplicates: true,
  });
}

async function createRequests(
  companies: { id: string }[],
  users: { id: string }[]
) {
  const requests: {
    companyId: string;
    title: string;
    description: string;
    status: RequestStatus;
    priority: Priority;
    submittedBy: string;
    reviewedBy?: string;
    reviewedAt?: Date;
    closedAt?: Date;
  }[] = [];

  const requestTitles = [
    "Upgrade cloud infrastructure",
    "New mobile application",
    "Security audit",
    "Data migration project",
    "Customer portal redesign",
    "API integration",
    "Employee training program",
    "Office renovation",
    "Marketing campaign",
    "Compliance review",
    "Software license renewal",
    "Vendor onboarding",
  ];

  for (const company of companies) {
    const companyUsers = users.slice(0, 4);
    const numRequests = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numRequests; i++) {
      const submittedBy = companyUsers[Math.floor(Math.random() * companyUsers.length)].id;
      const statuses: RequestStatus[] = [
        "DRAFT",
        "SUBMITTED",
        "IN_REVIEW",
        "APPROVED",
        "REJECTED",
        "CLOSED",
      ];
      const status = randomEnum(statuses);
      const priorities: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
      const priority = randomEnum(priorities);

      const reviewedBy =
        status === "APPROVED" || status === "REJECTED" || status === "IN_REVIEW"
          ? companyUsers[Math.floor(Math.random() * companyUsers.length)].id
          : undefined;

      const reviewedAt =
        reviewedBy !== undefined ? pastDate(Math.floor(Math.random() * 20)) : undefined;

      const closedAt = status === "CLOSED" ? pastDate(Math.floor(Math.random() * 5)) : undefined;

      requests.push({
        companyId: company.id,
        title: `${requestTitles[i % requestTitles.length]} - ${company.id.slice(0, 8)}`,
        description: `Development seed data: ${requestTitles[i % requestTitles.length]} for ${company.id}.`,
        status,
        priority,
        submittedBy,
        reviewedBy,
        reviewedAt,
        closedAt,
      });
    }
  }

  return prisma.request.createMany({
    data: requests,
    skipDuplicates: true,
  });
}

async function createProjects(
  companies: { id: string }[],
  requests: { id: string; companyId: string; submittedBy: string }[],
  users: { id: string }[]
) {
  const projects: {
    companyId: string;
    requestId?: string;
    name: string;
    description: string;
    status: ProjectStatus;
    startDate?: Date;
    dueDate?: Date;
    completedAt?: Date;
    createdBy: string;
  }[] = [];

  const projectNames = [
    "Platform migration",
    "Q4 initiative",
    "Customer experience",
    "Backend overhaul",
    "Frontend refresh",
    "DevOps pipeline",
    "Analytics dashboard",
    "Mobile app v2",
  ];

  const projectStatuses: ProjectStatus[] = [
    "PLANNING",
    "ACTIVE",
    "ON_HOLD",
    "COMPLETED",
    "CANCELLED",
  ];

  for (const company of companies) {
    const companyRequests = requests.filter((r) => r.companyId === company.id);
    const companyUsers = users.slice(0, 4);
    const numProjects = 2 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numProjects; i++) {
      const status = randomEnum(projectStatuses);
      const request =
        companyRequests.length > 0 && Math.random() > 0.5
          ? companyRequests[Math.floor(Math.random() * companyRequests.length)]
          : undefined;

      const startDate = status !== "CANCELLED" ? pastDate(Math.floor(Math.random() * 30)) : undefined;
      const dueDate = status === "ACTIVE" || status === "PLANNING" ? futureDate(14 + Math.floor(Math.random() * 30)) : undefined;
      const completedAt = status === "COMPLETED" ? pastDate(Math.floor(Math.random() * 10)) : undefined;

      projects.push({
        companyId: company.id,
        requestId: request?.id,
        name: `${projectNames[i % projectNames.length]} - ${company.id.slice(0, 8)}`,
        description: `Development seed data: ${projectNames[i % projectNames.length]} for ${company.id}.`,
        status,
        startDate,
        dueDate,
        completedAt,
        createdBy: companyUsers[Math.floor(Math.random() * companyUsers.length)].id,
      });
    }
  }

  return prisma.project.createMany({
    data: projects,
    skipDuplicates: true,
  });
}

async function createMilestones(
  companies: { id: string }[],
  projects: { id: string; companyId: string }[]
) {
  const milestones: {
    projectId: string;
    companyId: string;
    name: string;
    description: string;
    status: MilestoneStatus;
    dueDate?: Date;
    completedAt?: Date;
  }[] = [];

  const milestoneNames = [
    "Requirements finalization",
    "Design review",
    "Development complete",
    "QA sign-off",
    "Deployment",
    "User acceptance testing",
    "Documentation",
    "Retrospective",
  ];

  const milestoneStatuses: MilestoneStatus[] = [
    "PENDING",
    "IN_PROGRESS",
    "COMPLETED",
    "OVERDUE",
    "CANCELLED",
  ];

  for (const project of projects) {
    const numMilestones = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numMilestones; i++) {
      const status = randomEnum(milestoneStatuses);
      const dueDate = status !== "CANCELLED" ? futureDate(7 + Math.floor(Math.random() * 30)) : undefined;
      const completedAt = status === "COMPLETED" ? pastDate(Math.floor(Math.random() * 10)) : undefined;

      milestones.push({
        projectId: project.id,
        companyId: project.companyId,
        name: `${milestoneNames[i % milestoneNames.length]} - ${project.id.slice(0, 8)}`,
        description: `Development seed data: ${milestoneNames[i % milestoneNames.length]} for project ${project.id}.`,
        status,
        dueDate,
        completedAt,
      });
    }
  }

  return prisma.milestone.createMany({
    data: milestones,
    skipDuplicates: true,
  });
}

async function createDocuments(
  companies: { id: string }[],
  users: { id: string }[],
  projects: { id: string; companyId: string }[],
  milestones: { id: string; projectId: string; companyId: string }[],
  requests: { id: string; companyId: string }[]
) {
  const documents: {
    companyId: string;
    projectId?: string;
    milestoneId?: string;
    requestId?: string;
    name: string;
    storageKey: string;
    mimeType: string;
    sizeBytes: number;
    status: DocumentStatus;
    uploadedBy: string;
  }[] = [];

  const docNames = [
    "Project proposal",
    "Technical specification",
    "Budget estimate",
    "Contract",
    "Invoice",
    "Design mockup",
    "Test plan",
    "Deployment guide",
  ];

  const mimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/png",
  ];

  const docStatuses: DocumentStatus[] = ["DRAFT", "UPLOADED", "ARCHIVED"];

  for (const company of companies) {
    const companyUsers = users.slice(0, 4);
    const companyProjects = projects.filter((p) => p.companyId === company.id);
    const companyMilestones = milestones.filter((m) => m.companyId === company.id);
    const companyRequests = requests.filter((r) => r.companyId === company.id);
    const numDocs = 4 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numDocs; i++) {
      const project = companyProjects[Math.floor(Math.random() * companyProjects.length)];
      const projectMilestones = companyMilestones.filter((m) => m.projectId === project.id);
      const milestone =
        project && projectMilestones.length > 0
          ? projectMilestones[Math.floor(Math.random() * projectMilestones.length)]
          : undefined;
      const request =
        companyRequests.length > 0 && Math.random() > 0.5
          ? companyRequests[Math.floor(Math.random() * companyRequests.length)]
          : undefined;

      documents.push({
        companyId: company.id,
        projectId: project?.id,
        milestoneId: milestone?.id,
        requestId: request?.id,
        name: `${docNames[i % docNames.length]} - ${company.id.slice(0, 8)}`,
        storageKey: `dev-seed/${company.id}/${Date.now()}-${i}.bin`,
        mimeType: randomEnum(mimeTypes),
        sizeBytes: 1024 + Math.floor(Math.random() * 1024 * 1024),
        status: randomEnum(docStatuses),
        uploadedBy: companyUsers[Math.floor(Math.random() * companyUsers.length)].id,
      });
    }
  }

  return prisma.document.createMany({
    data: documents,
    skipDuplicates: true,
  });
}

async function createMessages(
  companies: { id: string }[],
  users: { id: string }[],
  projects: { id: string; companyId: string }[],
  milestones: { id: string; projectId: string; companyId: string }[],
  requests: { id: string; companyId: string }[]
) {
  const messages: {
    companyId: string;
    projectId?: string;
    milestoneId?: string;
    requestId?: string;
    content: string;
    authorId: string;
    parentMessageId?: string;
    status: MessageStatus;
  }[] = [];

  const messageSnippets = [
    "Let's schedule a review for this.",
    "Can you share the latest update?",
    "Approved. Great work team.",
    "We need to adjust the timeline.",
    "Blocked by dependency on the API team.",
    "Updated the requirements doc.",
    "Please review and provide feedback.",
    "This looks good to me.",
  ];

  const messageStatuses: MessageStatus[] = ["SENT", "READ", "ARCHIVED"];

  for (const company of companies) {
    const companyUsers = users.slice(0, 4);
    const companyProjects = projects.filter((p) => p.companyId === company.id);
    const companyMilestones = milestones.filter((m) => m.companyId === company.id);
    const companyRequests = requests.filter((r) => r.companyId === company.id);
    const numMessages = 5 + Math.floor(Math.random() * 5);

    for (let i = 0; i < numMessages; i++) {
      const project = companyProjects[Math.floor(Math.random() * companyProjects.length)];
      const projectMilestones = companyMilestones.filter((m) => m.projectId === project.id);
      const milestone =
        project && projectMilestones.length > 0
          ? projectMilestones[Math.floor(Math.random() * projectMilestones.length)]
          : undefined;
      const request =
        companyRequests.length > 0 && Math.random() > 0.5
          ? companyRequests[Math.floor(Math.random() * companyRequests.length)]
          : undefined;

      messages.push({
        companyId: company.id,
        projectId: project?.id,
        milestoneId: milestone?.id,
        requestId: request?.id,
        content: `[DEV SEED] ${randomEnum(messageSnippets)}`,
        authorId: companyUsers[Math.floor(Math.random() * companyUsers.length)].id,
        status: randomEnum(messageStatuses),
      });
    }
  }

  const uniqueMessages = messages.filter(
    (m, index, self) =>
      index ===
      self.findIndex(
        (other) =>
          other.content === m.content &&
          other.authorId === m.authorId &&
          other.parentMessageId === m.parentMessageId &&
          other.companyId === m.companyId &&
          other.projectId === m.projectId &&
          other.milestoneId === m.milestoneId &&
          other.requestId === m.requestId
      )
  );

  await prisma.message.createMany({
    data: uniqueMessages,
    skipDuplicates: true,
  });

  const allCreatedMessages = await prisma.message.findMany({
    where: { content: { startsWith: "[DEV SEED]" } },
    take: 10,
  });

  const replies = [];
  for (const msg of allCreatedMessages.slice(0, 5)) {
    replies.push({
      companyId: msg.companyId,
      projectId: msg.projectId ?? undefined,
      milestoneId: msg.milestoneId ?? undefined,
      requestId: msg.requestId ?? undefined,
      content: `[DEV SEED REPLY] Thanks for the update!`,
      authorId: users[Math.floor(Math.random() * users.length)].id,
      parentMessageId: msg.id,
      status: randomEnum(messageStatuses),
    });
  }

  await prisma.message.createMany({
    data: replies,
    skipDuplicates: true,
  });
}

async function createInvoices(
  companies: { id: string }[],
  users: { id: string }[],
  projects: { id: string; companyId: string }[],
  milestones: { id: string; projectId: string; companyId: string }[],
  requests: { id: string; companyId: string }[]
) {
  const invoices: {
    companyId: string;
    projectId?: string;
    milestoneId?: string;
    requestId?: string;
    amount: Prisma.Decimal;
    currency: string;
    status: InvoiceStatus;
    dueDate?: Date;
    paidAt?: Date;
    createdBy: string;
  }[] = [];

  const invoiceStatuses: InvoiceStatus[] = [
    "DRAFT",
    "SENT",
    "PAID",
    "OVERDUE",
    "CANCELLED",
    "REFUNDED",
  ];

  for (const company of companies) {
    const companyUsers = users.slice(0, 4);
    const companyProjects = projects.filter((p) => p.companyId === company.id);
    const companyMilestones = milestones.filter((m) => m.companyId === company.id);
    const companyRequests = requests.filter((r) => r.companyId === company.id);
    const numInvoices = 2 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numInvoices; i++) {
      const project = companyProjects[Math.floor(Math.random() * companyProjects.length)];
      const projectMilestones = companyMilestones.filter((m) => m.projectId === project.id);
      const milestone =
        project && projectMilestones.length > 0
          ? projectMilestones[Math.floor(Math.random() * projectMilestones.length)]
          : undefined;
      const request =
        companyRequests.length > 0 && Math.random() > 0.5
          ? companyRequests[Math.floor(Math.random() * companyRequests.length)]
          : undefined;

      const status = randomEnum(invoiceStatuses);
      const amount = new Prisma.Decimal((100 + Math.floor(Math.random() * 9900)).toFixed(2));

      const dueDate = status !== "CANCELLED" && status !== "PAID" ? futureDate(7 + Math.floor(Math.random() * 21)) : undefined;
      const paidAt = status === "PAID" ? pastDate(Math.floor(Math.random() * 10)) : undefined;

      invoices.push({
        companyId: company.id,
        projectId: project?.id,
        milestoneId: milestone?.id,
        requestId: request?.id,
        amount,
        currency: "USD",
        status,
        dueDate,
        paidAt,
        createdBy: companyUsers[Math.floor(Math.random() * companyUsers.length)].id,
      });
    }
  }

  return prisma.invoice.createMany({
    data: invoices,
    skipDuplicates: true,
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("[DEV SEED] Starting development seed data population...");
  console.log("[DEV SEED] WARNING: Do NOT run this in production.\n");

  // Clear existing seed data
  console.log("[DEV SEED] Cleaning existing development data...");

  const seedUsers = await prisma.user.findMany({
    where: { email: { in: DEV_EMAILS } },
    select: { id: true },
  });
  const seedUserIds = seedUsers.map((u) => u.id);

  await prisma.invoice.deleteMany({ where: { createdBy: { startsWith: "auth0|dev-seed" } } });
  await prisma.message.deleteMany({ where: { content: { startsWith: "[DEV SEED]" } } });
  await prisma.document.deleteMany({ where: { storageKey: { startsWith: "dev-seed/" } } });
  await prisma.milestone.deleteMany({ where: { name: { startsWith: "Requirements finalization" } } });
  await prisma.project.deleteMany({ where: { name: { startsWith: "Platform migration" } } });
  await prisma.request.deleteMany({ where: { title: { startsWith: "Upgrade cloud infrastructure" } } });
  await prisma.membership.deleteMany({ where: { userId: { in: seedUserIds } } });
  await prisma.user.deleteMany({ where: { email: { in: DEV_EMAILS } } });
  await prisma.company.deleteMany({ where: { slug: { in: ["acme-corp", "globex", "initech", "hooli"] } } });

  console.log("[DEV SEED] Creating companies...");
  await createCompanies();

  console.log("[DEV SEED] Creating users...");
  await createUsers();

  const companies = await prisma.company.findMany({
    where: { slug: { in: ["acme-corp", "globex", "initech", "hooli"] } },
  });
  const users = await prisma.user.findMany({
    where: { email: { in: DEV_EMAILS } },
  });

  console.log("[DEV SEED] Creating memberships...");
  await createMemberships(companies, users);

  console.log("[DEV SEED] Creating requests...");
  await createRequests(companies, users);
  const requests = await prisma.request.findMany({
    where: { companyId: { in: companies.map((c) => c.id) } },
  });

  console.log("[DEV SEED] Creating projects...");
  await createProjects(companies, requests, users);
  const projects = await prisma.project.findMany({
    where: { companyId: { in: companies.map((c) => c.id) } },
  });

  console.log("[DEV SEED] Creating milestones...");
  await createMilestones(companies, projects);
  const milestones = await prisma.milestone.findMany({
    where: { companyId: { in: companies.map((c) => c.id) } },
  });

  console.log("[DEV SEED] Creating documents...");
  await createDocuments(companies, users, projects, milestones, requests);

  console.log("[DEV SEED] Creating messages...");
  await createMessages(companies, users, projects, milestones, requests);

  console.log("[DEV SEED] Creating invoices...");
  await createInvoices(companies, users, projects, milestones, requests);

  console.log("\n[DEV SEED] Development seed data population complete.");
  console.log(`[DEV SEED] Created ${companies.length} companies, ${users.length} users, and related records.`);
}

main()
  .catch((e) => {
    console.error("[DEV SEED] Failed to populate seed data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
