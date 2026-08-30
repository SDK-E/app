"use client";

import { useEffect } from "react";
import { siteConfig } from "@sdk-e/config/site";

interface SecurePrivacy {
  checkConsent?: (serviceName: string) => boolean;
  allGivenConsents?: Record<string, unknown>;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    sp?: SecurePrivacy;
    __sdkeGtagLoaded?: boolean;
  }
}

const GA_ID = siteConfig.analytics.googleAnalyticsId;
const SP_SERVICE = siteConfig.analytics.securePrivacyServiceName;
const SP_UNBLOCK_EVENT = `sp_unblock_${SP_SERVICE.replaceAll(" ", "_")}`;

function consentGiven(): boolean {
  const sp = window.sp;
  if (sp?.checkConsent) {
    return sp.checkConsent(SP_SERVICE);
  }
  return Boolean(sp?.allGivenConsents && Object.keys(sp.allGivenConsents).length > 0);
}

function loadGtag(): void {
  if (window.__sdkeGtagLoaded) return;
  window.__sdkeGtagLoaded = true;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    function gtag(...args: unknown[]): void {
      window.dataLayer?.push(args);
    };

  const element = document.createElement("script");
  element.async = true;
  element.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  element.onload = () => {
    window.gtag?.("js", new Date());
    window.gtag?.("config", GA_ID);
  };
  document.head.appendChild(element);
}

export function GoogleAnalyticsConsent() {
  useEffect(() => {
    const handleInit = (): void => {
      if (consentGiven()) loadGtag();
    };
    const handleUnblock = (): void => {
      loadGtag();
    };

    window.addEventListener(SP_UNBLOCK_EVENT, handleUnblock);
    window.addEventListener("sp_init", handleInit);
    const timer = window.setTimeout(() => {
      if (window.sp) handleInit();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(SP_UNBLOCK_EVENT, handleUnblock);
      window.removeEventListener("sp_init", handleInit);
    };
  }, []);

  return null;
}
