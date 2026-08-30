"use client";

import { Button } from "@platform/ui/Button";
import { useEffect, useRef, useState } from "react";

export function ConfirmButton({
  label,
  confirmLabel,
  variant = "outline",
  size = "sm",
}: {
  label: string;
  confirmLabel: string;
  variant?: "dark" | "default" | "destructive" | "outline";
  size?: "default" | "icon-lg" | "icon-sm" | "icon-xs" | "icon" | "lg" | "sm" | "xs";
}) {
  const [confirming, setConfirming] = useState(false);
  const timer = useRef<null | ReturnType<typeof setTimeout>>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function onClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (!confirming) {
      event.preventDefault();
      setConfirming(true);
      timer.current = setTimeout(() => setConfirming(false), 4000);
    }
  }

  return (
    <Button
      type="submit"
      variant={confirming ? "destructive" : variant}
      size={size}
      onClick={onClick}
      onBlur={() => setConfirming(false)}
    >
      {confirming ? confirmLabel : label}
    </Button>
  );
}
