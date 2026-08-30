import type { Metadata } from "next";
import Script from "next/script";
import { JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { HtmlLang } from "@/components/layout/HtmlLang";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SDK Enterprises",
  description: "Software design & engineering partner for regulated industries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable} suppressHydrationWarning>
      <body className="antialiased">
        <Script
          src="https://app.secureprivacy.ai/script/6a93a2f7c62d5b186f5b65bd.js"
          strategy="afterInteractive"
        />
        <HtmlLang />
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
