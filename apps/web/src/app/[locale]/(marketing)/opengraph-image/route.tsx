import { getSiteUrl } from "@platform/marketing/seo";
import { ImageResponse } from "next/og";

export const alt = "SDK Enterprises";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return new ImageResponse(
    <div
      style={{
        fontSize: 64,
        background: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div style={{ fontWeight: "bold", color: "#111" }}>SDK Enterprises</div>
      <div style={{ fontSize: 32, color: "#666", marginTop: 16 }}>
        {locale.toUpperCase()} · {getSiteUrl()}
      </div>
    </div>,
    { ...size },
  );
}
