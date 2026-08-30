import { type EnquiryResult } from "@platform/marketing/enquiries";

import { EnquiryField } from "@/components/marketing/EnquiryField";
import { capabilityOptions } from "@/components/marketing/enquiryFormOptions";
import { EnquirySelect } from "@/components/marketing/EnquirySelect";

interface EnquiryFormTopProps {
  t: NamespaceTranslator;
  result: EnquiryResult | null;
}

type NamespaceTranslator = (key: string, values?: Record<string, Date | number | string>) => string;

export function EnquiryFormTop({ t, result }: EnquiryFormTopProps) {
  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2">
        <EnquiryField
          t={t}
          result={result}
          id="companyName"
          name="companyName"
          labelKey="form.companyName"
          required
        />
        <EnquiryField
          t={t}
          result={result}
          id="email"
          name="email"
          labelKey="form.email"
          type="email"
          required
        />
      </div>

      <EnquiryField
        t={t}
        result={result}
        id="website"
        name="website"
        labelKey="form.website"
        type="url"
        placeholder="https://"
      />
      <EnquirySelect
        t={t}
        result={result}
        id="capability"
        name="capability"
        labelKey="form.capability"
        options={capabilityOptions}
        required
      />
      <EnquiryField
        t={t}
        result={result}
        id="description"
        name="description"
        labelKey="form.description"
        multiline
        rows={5}
        required
      />
      <EnquiryField
        t={t}
        result={result}
        id="environment"
        name="environment"
        labelKey="form.environment"
        multiline
        rows={4}
      />
    </>
  );
}
