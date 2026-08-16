import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { listProviderProjects } from "@/lib/data/providers";
import { getCurrentPrincipal } from "@/lib/identity";

export const metadata: Metadata = { title: "Assigned projects | SDK Enterprises", robots: { index: false, follow: false } };

export default async function ProviderProjectsPage() {
  const principal = await getCurrentPrincipal();
  if (!principal) return null;
  const assignments = await listProviderProjects(principal);
  return <section><p className="text-label font-extrabold uppercase tracking-eyebrow text-muted-foreground">Assigned work</p><h1 className="mt-4 text-[32px] font-extrabold md:text-h1">Projects you can work on.</h1><p className="mt-5 max-w-[65ch] text-body text-muted-foreground">Only projects explicitly assigned to you appear here.</p><div className="mt-10 grid gap-4 lg:grid-cols-2">{assignments.map(item => <Card key={item.id}><div className="flex items-start justify-between gap-4"><div><h2 className="text-h3 font-extrabold">{item.project.name}</h2><p className="mt-2 text-body text-muted-foreground">{item.company.name} · {item.roleTitle}</p></div><Badge>{item.status}</Badge></div><p className="mt-5 text-body">{item.project.description}</p><div className="mt-6 space-y-3">{item.project.milestones.map(milestone => <div key={milestone.id} className="border-t border-line pt-3"><p className="text-body font-semibold">{milestone.name}</p><p className="mt-1 text-body text-muted-foreground">{milestone.description}</p></div>)}</div></Card>)}</div>{!assignments.length ? <p className="mt-10 text-body text-muted-foreground">No projects are assigned to you.</p> : null}</section>;
}
