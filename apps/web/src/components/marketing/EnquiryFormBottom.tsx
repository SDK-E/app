import { type EnquiryResult } from "@platform/marketing/enquiries";

import { EnquiryField } from "@/components/marketing/EnquiryField";
import { budgetOptions, timelineOptions } from "@/components/marketing/enquiryFormOptions";
import { EnquirySelect } from "@/components/marketing/EnquirySelect";

interface EnquiryFormBottomProps {
  t: NamespaceTranslator;
  result: EnquiryResult | null;
}

type NamespaceTranslator = (key: string, values?: Record<string, Date | number | string>) => string;

export function EnquiryFormBottom({ t, result }: EnquiryFormBottomProps) {
  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2">
        <EnquirySelect
          t={t}
          result={result}
          id="timeline"
          name="timeline"
          labelKey="form.timeline"
          options={timelineOptions}
        />
        <EnquirySelect
          t={t}
          result={result}
          id="budgetRange"
          name="budgetRange"
          labelKey="form.budgetRange"
          options={budgetOptions}
        />
      </div>

      <EnquiryField
        t={t}
        result={result}
        id="context"
        name="context"
        labelKey="form.context"
        multiline
        rows={4}
      />
    </>
  );
}
