"use client";

import { Button } from "@platform/ui/Button";
import { useTranslations } from "next-intl";

import { EnquiryFormBottom } from "@/components/marketing/EnquiryFormBottom";
import { EnquiryFormTop } from "@/components/marketing/EnquiryFormTop";
import { useEnquiryForm } from "@/components/marketing/useEnquiryForm";

export function EnquiryForm() {
  const t = useTranslations("enquiry");
  const { isPending, result, handleSubmit } = useEnquiryForm();
  const success = result && result.success;

  return (
    <form
      action={handleSubmit}
      className="grid gap-6"
    >
      <input
        type="text"
        name="honeypot"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <EnquiryFormTop
        t={t}
        result={result}
      />
      <EnquiryFormBottom
        t={t}
        result={result}
      />

      {result && !result.success && result.formError && (
        <p className="text-body text-dark">{result.formError}</p>
      )}

      {success && (
        <div className="rounded-card border border-line bg-paper p-6">
          <p className="text-h3">{t("success.title")}</p>
          <p className="mt-3 text-body">{t("success.body")}</p>
        </div>
      )}

      <div>
        <Button
          type="submit"
          disabled={isPending}
          variant="dark"
        >
          {isPending ? t("form.submitting") : t("form.submit")}
        </Button>
      </div>
    </form>
  );
}
