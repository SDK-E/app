import { type EnquiryResult } from "@platform/marketing/enquiries";

import { getErrorFromResult, getFieldClass } from "@/components/marketing/enquiryFormOptions";

interface EnquiryFieldProps {
  t: NamespaceTranslator;
  result: EnquiryResult | null;
  id: string;
  name: string;
  labelKey: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}

type NamespaceTranslator = (key: string, values?: Record<string, Date | number | string>) => string;

export function EnquiryField({
  t,
  result,
  id,
  name,
  labelKey,
  required = false,
  type = "text",
  placeholder,
  multiline = false,
  rows = 4,
}: EnquiryFieldProps) {
  const inputClass = getFieldClass(result, name);

  return (
    <div className="grid gap-2">
      <label
        htmlFor={id}
        className="text-label font-bold uppercase tracking-eyebrow"
      >
        {t(labelKey)} {required && <span className="text-dark">*</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          className={inputClass}
          required={required}
          placeholder={placeholder}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          className={inputClass}
          required={required}
          placeholder={placeholder}
        />
      )}
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
