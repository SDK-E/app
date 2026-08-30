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
    __sdkeGtmLoaded?: boolean;
  }
}

const GA_ID = siteConfig.analytics.googleAnalyticsId;
const GTM_ID = siteConfig.analytics.googleTagManagerId;
const GA_SERVICE = siteConfig.analytics.securePrivacyServiceName;
const GTM_SERVICE = siteConfig.analytics.securePrivacyGtmServiceName;
const UNBLOCK_EVENT = (service: string) => `sp_unblock_${service.replaceAll(" ", "_")}`;
const GA_UNBLOCK = UNBLOCK_EVENT(GA_SERVICE);
const GTM_UNBLOCK = UNBLOCK_EVENT(GTM_SERVICE);

function consentGiven(service: string): boolean {
  const sp = window.sp;
  if (sp?.checkConsent) {
    return sp.checkConsent(service);
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

function loadGtm(): void {
  if (window.__sdkeGtmLoaded) return;
  window.__sdkeGtmLoaded = true;

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });

  const element = document.createElement("script");
  element.async = true;
  element.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(element);

  const iframe = document.createElement("iframe");
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
  iframe.height = "0";
  iframe.width = "0";
  iframe.style.display = "none";
  iframe.style.visibility = "hidden";
  const noscript = document.createElement("noscript");
  noscript.appendChild(iframe);
  document.body.prepend(noscript);
}

export function GoogleAnalyticsConsent() {
  useEffect(() => {
    const handleInit = (): void => {
      if (consentGiven(GA_SERVICE)) loadGtag();
      if (consentGiven(GTM_SERVICE)) loadGtm();
    };
    const handleGaUnblock = (): void => {
      loadGtag();
    };
    const handleGtmUnblock = (): void => {
      loadGtm();
    };

    window.addEventListener(GA_UNBLOCK, handleGaUnblock);
    window.addEventListener(GTM_UNBLOCK, handleGtmUnblock);
    window.addEventListener("sp_init", handleInit);
    const timer = window.setTimeout(() => {
      if (window.sp) handleInit();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(GA_UNBLOCK, handleGaUnblock);
      window.removeEventListener(GTM_UNBLOCK, handleGtmUnblock);
      window.removeEventListener("sp_init", handleInit);
    };
  }, []);

  return null;
}
