import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./fonts.css";

const title = "Watermark — Watermark Editor";
const description = "Create a text or logo watermark and export it as a transparent PNG. Edit locally in your browser.";

export const viewport: Viewport = { themeColor: "#171915" };

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL("https://watermark-gen.web.app/"),
  alternates: { canonical: "/" },
  other: { "page-type": "software", "site-kind": "software" },
  openGraph: { type: "website", title, description, url: "/", images: "/og-image.png" },
  twitter: { card: "summary_large_image", title, description, images: "/og-image.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-type="software">
      <body>{children}</body>
    </html>
  );
}
