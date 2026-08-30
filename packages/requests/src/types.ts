import type { Prisma } from "@sdk-e/db/client";
import type { requestDetailInclude } from "@sdk-e/requests/queries";

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
