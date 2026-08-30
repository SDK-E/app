import { type EnquiryResult } from "@platform/marketing/enquiries";

import { getErrorFromResult, getFieldClass } from "@/components/marketing/enquiryFormOptions";

interface EnquirySelectProps {
  t: NamespaceTranslator;
  result: EnquiryResult | null;
  id: string;
  name: string;
  labelKey: string;
  options: { value: string; labelKey: string }[];
  required?: boolean;
}

type NamespaceTranslator = (key: string, values?: Record<string, Date | number | string>) => string;

export function EnquirySelect({
  t,
  result,
  id,
  name,
  labelKey,
  options,
  required = false,
}: EnquirySelectProps) {
  const selectClass = getFieldClass(result, name);

  return (
    <div className="grid gap-2">
      <label
        htmlFor={id}
        className="text-label font-bold uppercase tracking-eyebrow"
      >
        {t(labelKey)} {required && <span className="text-dark">*</span>}
      </label>
      <select
        id={id}
        name={name}
        className={selectClass}
        required={required}
      >
        <option value="">{t(labelKey)}</option>
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
          >
            {t(opt.labelKey)}
          </option>
        ))}
      </select>
      <ErrorMessage
        result={result}
        name={name}
      />
    </div>
  );
}

function ErrorMessage({ result, name }: { result: EnquiryResult | null; name: string }) {
  const error = getErrorFromResult(result, name);
  if (!error) return null;
  return <p className="text-body text-dark">{error}</p>;
}
