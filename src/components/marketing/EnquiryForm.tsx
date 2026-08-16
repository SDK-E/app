"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { submitEnquiry, type EnquiryResult } from "@/lib/enquiries";
import { Button } from "@/components/ui/Button";

export function EnquiryForm() {
  const t = useTranslations("enquiry");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<EnquiryResult | null>(null);

  const handleSubmit = (formData: FormData) => {
    setResult(null);
    startTransition(async () => {
      const input = {
        companyName: (formData.get("companyName") as string) || "",
        email: (formData.get("email") as string) || "",
        website: (formData.get("website") as string) || "",
        capability: (formData.get("capability") as string) || "",
        description: (formData.get("description") as string) || "",
        environment: (formData.get("environment") as string) || "",
        timeline: (formData.get("timeline") as string) || "",
        budgetRange: (formData.get("budgetRange") as string) || "",
        context: (formData.get("context") as string) || "",
        honeypot: (formData.get("honeypot") as string) || "",
      };

      const res = await submitEnquiry(input);
      setResult(res);
    });
  };

  const fieldClass = (name: string) =>
    `w-full rounded-control border bg-paper px-4 py-3 text-body transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark ${
      result && !result.success && result.errors[name] ? "border-dark" : "border-muted-foreground"
    }`;

  return (
    <form action={handleSubmit} className="grid gap-6">
      <input type="text" name="honeypot" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="companyName" className="text-label font-bold uppercase tracking-eyebrow">
            {t("form.companyName")} <span className="text-dark">*</span>
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            className={fieldClass("companyName")}
            required
          />
          {result && !result.success && result.errors.companyName && (
            <p className="text-body text-dark">{result.errors.companyName}</p>
          )}
        </div>

        <div className="grid gap-2">
          <label htmlFor="email" className="text-label font-bold uppercase tracking-eyebrow">
            {t("form.email")} <span className="text-dark">*</span>
          </label>
          <input id="email" name="email" type="email" className={fieldClass("email")} required />
          {result && !result.success && result.errors.email && (
            <p className="text-body text-dark">{result.errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="website" className="text-label font-bold uppercase tracking-eyebrow">
          {t("form.website")}
        </label>
        <input
          id="website"
          name="website"
          type="url"
          placeholder="https://"
          className={fieldClass("website")}
        />
        {result && !result.success && result.errors.website && (
          <p className="text-body text-dark">{result.errors.website}</p>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="capability" className="text-label font-bold uppercase tracking-eyebrow">
          {t("form.capability")} <span className="text-dark">*</span>
        </label>
        <select id="capability" name="capability" className={fieldClass("capability")} required>
          <option value="">{t("form.capability")}</option>
          <option value="aiEngineering">{t("capabilities.aiEngineering")}</option>
          <option value="softwareEngineering">{t("capabilities.softwareEngineering")}</option>
          <option value="frontendProduct">{t("capabilities.frontendProduct")}</option>
          <option value="cloudInfrastructure">{t("capabilities.cloudInfrastructure")}</option>
          <option value="dataCacheSearch">{t("capabilities.dataCacheSearch")}</option>
          <option value="modernization">{t("capabilities.modernization")}</option>
          <option value="other">{t("capabilities.other")}</option>
        </select>
        {result && !result.success && result.errors.capability && (
          <p className="text-body text-dark">{result.errors.capability}</p>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="description" className="text-label font-bold uppercase tracking-eyebrow">
          {t("form.description")} <span className="text-dark">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          className={fieldClass("description")}
          required
        />
        {result && !result.success && result.errors.description && (
          <p className="text-body text-dark">{result.errors.description}</p>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="environment" className="text-label font-bold uppercase tracking-eyebrow">
          {t("form.environment")}
        </label>
        <textarea
          id="environment"
          name="environment"
          rows={4}
          className={fieldClass("environment")}
        />
        {result && !result.success && result.errors.environment && (
          <p className="text-body text-dark">{result.errors.environment}</p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="timeline" className="text-label font-bold uppercase tracking-eyebrow">
            {t("form.timeline")}
          </label>
          <select id="timeline" name="timeline" className={fieldClass("timeline")}>
            <option value="">{t("form.timeline")}</option>
            <option value="asap">{t("timelines.asap")}</option>
            <option value="oneToThreeMonths">{t("timelines.oneToThreeMonths")}</option>
            <option value="threeToSixMonths">{t("timelines.threeToSixMonths")}</option>
            <option value="sixPlusMonths">{t("timelines.sixPlusMonths")}</option>
            <option value="notSure">{t("timelines.notSure")}</option>
          </select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="budgetRange" className="text-label font-bold uppercase tracking-eyebrow">
            {t("form.budgetRange")}
          </label>
          <select id="budgetRange" name="budgetRange" className={fieldClass("budgetRange")}>
            <option value="">{t("form.budgetRange")}</option>
            <option value="under10k">{t("budgets.under10k")}</option>
            <option value="tenToTwentyFiveK">{t("budgets.tenToTwentyFiveK")}</option>
            <option value="twentyFiveToFiftyK">{t("budgets.twentyFiveToFiftyK")}</option>
            <option value="fiftyPlusK">{t("budgets.fiftyPlusK")}</option>
            <option value="notSure">{t("budgets.notSure")}</option>
          </select>
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="context" className="text-label font-bold uppercase tracking-eyebrow">
          {t("form.context")}
        </label>
        <textarea id="context" name="context" rows={4} className={fieldClass("context")} />
      </div>

      {result && !result.success && result.formError && (
        <p className="text-body text-dark">{result.formError}</p>
      )}

      {result && result.success && (
        <div className="rounded-card border border-line bg-paper p-6">
          <p className="text-h3">{t("success.title")}</p>
          <p className="mt-3 text-body text-muted-foreground">{t("success.body")}</p>
        </div>
      )}

      <div>
        <Button type="submit" disabled={isPending} variant="dark">
          {isPending ? t("form.submit") : t("form.submit")}
        </Button>
      </div>
    </form>
  );
}
