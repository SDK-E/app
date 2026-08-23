"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@sdk-e/ui/Button";

export function ConfirmButton({
  label,
  confirmLabel,
  variant = "outline",
  size = "sm",
}: {
  label: string;
  confirmLabel: string;
  variant?: "default" | "outline" | "dark" | "destructive";
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
}) {
  const [confirming, setConfirming] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
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
