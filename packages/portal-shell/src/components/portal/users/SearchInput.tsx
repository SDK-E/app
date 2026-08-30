"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function SearchInput({
  placeholder,
  paramName = "q",
  resetParams = ["cursor", "back"],
}: {
  placeholder: string;
  paramName?: string;
  resetParams?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initial = searchParams.get(paramName) ?? "";
  const [value, setValue] = useState(initial);
  const timer = useRef<null | ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    setValue(searchParams.get(paramName) ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString(), paramName]);

  function apply(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set(paramName, next);
    else params.delete(paramName);
    for (const key of resetParams) params.delete(key);
    const suffix = params.toString();
    router.replace(suffix ? `${pathname}?${suffix}` : pathname, { scroll: false });
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => apply(next), 300);
  }

  return (
    <input
      type="search"
      name={paramName}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label={placeholder}
      className="w-full max-w-sm rounded-control border border-input bg-card px-4 py-2 text-body outline-none placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    />
  );
}
