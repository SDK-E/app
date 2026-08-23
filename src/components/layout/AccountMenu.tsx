"use client";

import Image from "next/image";
import Link from "next/link";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

export function AccountMenu({
  locale,
  name,
  email,
  avatarUrl,
  profileLabel,
  logoutLabel,
  languageLabel,
  themeLabel,
  updateLocale,
  variant = "header",
  collapsed = false,
  onExpand,
}: {
  locale: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  profileLabel: string;
  logoutLabel: string;
  languageLabel: string;
  themeLabel: string;
  updateLocale: (locale: string) => Promise<{ ok: boolean }>;
  variant?: "header" | "sidebar";
  collapsed?: boolean;
  onExpand?: () => void;
}) {
  const inSidebar = variant === "sidebar";
  const actsAsExpandToggle = collapsed && Boolean(onExpand);

  if (actsAsExpandToggle) {
    return (
      <button
        type="button"
        onClick={() => onExpand?.()}
        aria-label={name}
        title={name}
        className="flex min-h-11 w-full items-center justify-center rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
      >
        <Avatar avatarUrl={avatarUrl} name={name} />
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className={`flex min-h-11 w-full items-center gap-3 rounded-control px-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${
          collapsed ? "lg:justify-center lg:gap-0 lg:px-0" : ""
        }`}
      >
        <button type="button" aria-label={name}>
          <Avatar avatarUrl={avatarUrl} name={name} />
          {!collapsed && (
            <span className={`min-w-0 flex-1 ${inSidebar ? "block" : "hidden sm:block"}`}>
              <span
                className={`block truncate text-body font-semibold ${inSidebar ? "text-light" : ""}`}
              >
                {name}
              </span>
              <span
                className={`block truncate text-micro ${inSidebar ? "text-fog" : "text-muted-foreground"}`}
              >
                {email}
              </span>
            </span>
          )}
          {!collapsed && (
            <span aria-hidden className="ml-auto shrink-0">
              ⌄
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={inSidebar ? "top" : "bottom"}
        align={inSidebar ? "start" : "end"}
        sideOffset={8}
        className="w-64 rounded-card p-3"
      >
        <DropdownMenuLabel>{languageLabel}</DropdownMenuLabel>
        <div className="px-2 pb-2">
          <LanguageSwitcher updateLocale={updateLocale} />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{themeLabel}</DropdownMenuLabel>
        <div className="px-2 pb-2">
          <ThemeSwitcher />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/app/profile`}>{profileLabel}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/auth/logout">{logoutLabel}</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Avatar({ avatarUrl, name }: { avatarUrl: string | null; name: string }) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={36}
        height={36}
        className="size-9 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-label text-primary-foreground">
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
