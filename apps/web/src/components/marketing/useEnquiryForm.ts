import { type EnquiryResult, submitEnquiry } from "@platform/marketing/enquiries";
import { useState, useTransition } from "react";

export function useEnquiryForm() {
  const [result, setResult] = useState<EnquiryResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setResult(null);
    startTransition(async () => {
      const input = extractFormData(formData);
      const res = await submitEnquiry(input);
      setResult(res);
    });
  };

  return { isPending, result, handleSubmit };
}

function extractFormData(formData: FormData) {
  return {
    companyName: getString(formData, "companyName"),
    email: getString(formData, "email"),
    website: getString(formData, "website"),
    capability: getString(formData, "capability"),
    description: getString(formData, "description"),
    environment: getString(formData, "environment"),
    timeline: getString(formData, "timeline"),
    budgetRange: getString(formData, "budgetRange"),
    context: getString(formData, "context"),
    honeypot: getString(formData, "honeypot"),
  };
}

function getString(formData: FormData, name: string): string {
  return (formData.get(name) as string) || "";
}
