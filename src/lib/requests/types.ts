import type { Prisma } from "@/generated/prisma/client";
import type { requestDetailInclude } from "@/lib/requests/queries";

export type RequestDetail = Prisma.RequestGetPayload<{
  include: typeof requestDetailInclude;
}>;

export type RequestListEntry = {
  id: string;
  title: string;
  capability: string;
  status: string;
  projects: Array<{ id: string }>;
};

export type Translator = (key: string, values?: Record<string, string | number | Date>) => string;
