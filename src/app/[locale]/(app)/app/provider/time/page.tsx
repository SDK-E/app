import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getPrisma } from "@/lib/db";
import { requireActiveServiceProvider } from "@/lib/authorization";
import { getCurrentPrincipal } from "@/lib/identity";

import { createTimeEntryAction, submitTimeEntryAction } from "../actions";

export const metadata: Metadata = { title: "Time | SDK Enterprises", robots: { index: false, follow: false } };
const inputClass = "mt-2 min-h-11 w-full rounded-control border border-dark/40 bg-paper px-4 py-3 text-body focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark";

export default async function ProviderTimePage({ params }: { params: Promise<{ locale: string }> }) {
  const [{ locale }, principal] = await Promise.all([params, getCurrentPrincipal()]);
  if (!principal) return null;
  const provider = requireActiveServiceProvider(principal);
  const [assignments, entries] = await Promise.all([
    getPrisma().providerAssignment.findMany({ where: { providerId: provider.providerId, status: "ACTIVE" }, select: { id: true, roleTitle: true, project: { select: { name: true, milestones: { select: { id: true, name: true } } } } } }),
    getPrisma().timeEntry.findMany({ where: { assignment: { providerId: provider.providerId } }, include: { assignment: { include: { project: { select: { name: true } } } } }, orderBy: [{ workDate: "desc" }, { createdAt: "desc" }], take: 100 }),
  ]);
  return <section><p className="text-label font-extrabold uppercase tracking-eyebrow text-muted-foreground">Time records</p><h1 className="mt-4 text-[32px] font-extrabold md:text-h1">Record the work completed.</h1><div className="mt-10 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]"><Card><h2 className="text-h3 font-extrabold">New time entry</h2><form action={createTimeEntryAction.bind(null, locale)} className="mt-6 space-y-5"><label className="block text-label font-extrabold uppercase tracking-eyebrow">Assignment<select className={inputClass} name="assignmentId" required>{assignments.map(item => <option key={item.id} value={item.id}>{item.project.name} — {item.roleTitle}</option>)}</select></label><label className="block text-label font-extrabold uppercase tracking-eyebrow">Work date<input className={inputClass} name="workDate" type="date" required /></label><label className="block text-label font-extrabold uppercase tracking-eyebrow">Minutes worked<input className={inputClass} name="durationMinutes" type="number" min="1" max="1440" required /></label><label className="block text-label font-extrabold uppercase tracking-eyebrow">Work completed<textarea className={inputClass} name="description" rows={5} required /></label><Button disabled={!assignments.length} type="submit">Save draft</Button></form></Card><Card><h2 className="text-h3 font-extrabold">Recent entries</h2><div className="mt-6 space-y-4">{entries.map(entry => <div key={entry.id} className="border-t border-line pt-4"><div className="flex justify-between gap-4"><p className="text-body font-semibold">{entry.assignment.project.name}</p><span className="text-micro uppercase tracking-eyebrow">{entry.status.replaceAll("_", " ")}</span></div><p className="mt-1 text-body text-muted-foreground">{entry.workDate.toLocaleDateString(locale)} · {entry.durationMinutes} min</p><p className="mt-2 text-body">{entry.description}</p>{["DRAFT", "CHANGES_REQUIRED"].includes(entry.status) ? <form action={submitTimeEntryAction.bind(null, locale)} className="mt-3"><input type="hidden" name="timeEntryId" value={entry.id} /><Button size="sm" type="submit">Submit for review</Button></form> : null}</div>)}{!entries.length ? <p className="text-body text-muted-foreground">No time has been recorded.</p> : null}</div></Card></div></section>;
}
