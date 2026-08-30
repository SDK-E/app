import type { Prisma } from "@platform/db/client";
import type { requestDetailInclude } from "@platform/requests/queries";

export type RequestDetail = Prisma.RequestGetPayload<{
  include: typeof requestDetailInclude;
}>;

export interface RequestListEntry {
  id: string;
  title: string;
  capability: string;
  status: string;
  projects: { id: string }[];
}

export type Translator = (key: string, values?: Record<string, Date | number | string>) => string;
