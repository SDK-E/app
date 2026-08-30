"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function FilterSelect({
  paramName,
  options,
  ariaLabel,
}: {
  paramName: string;
  options: { value: string; label: string }[];
  ariaLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramName) ?? "";

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    const next = event.target.value;
    if (next) params.set(paramName, next);
    else params.delete(paramName);
    params.delete("cursor");
    params.delete("back");
    const suffix = params.toString();
    router.replace(suffix ? `${pathname}?${suffix}` : pathname, { scroll: false });
  }

  return (
    <select
      value={current}
      onChange={onChange}
      aria-label={ariaLabel}
      className="rounded-control border border-input bg-card px-4 py-2 text-body outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}
