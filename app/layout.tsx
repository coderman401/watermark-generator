import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Video Watermark — Add Watermarks to Videos Easily",
  description: "Create and apply watermarks to videos quickly. Free tool to add text or image watermarks and export your watermarked videos.",
  viewport: "width=device-width, initial-scale=1.0",
  keywords: "video watermark, add watermark to video, watermark maker, watermark online, video editor",
  robots: "index, follow",
  openGraph: {
    type: "website",
    title: "Video Watermark — Add Watermarks to Videos Easily",
    description: "Create and apply watermarks to videos quickly. Free tool to add text or image watermarks and export your watermarked videos.",
    url: "https://watermark-gen.web.app/",
    images: "https://watermark-gen.web.app/og-image.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Watermark — Add Watermarks to Videos Easily",
    description: "Create and apply watermarks to videos quickly. Free tool to add text or image watermarks and export your watermarked videos.",
    images: "https://watermark-gen.web.app/og-image.png",
  },
  alternates: {
    canonical: "https://watermark-gen.web.app/",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://watermark-gen.web.app/",
            "name": "Video Watermark",
            "description": "Create and apply watermarks to videos quickly.",
            "publisher": {
              "@type": "Organization",
              "name": "Video Watermark"
            }
          })}
        </script>
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
