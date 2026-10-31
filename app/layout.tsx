import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "The Wedding Invite Co. · More than an invitation.",
  description:
    "Wedding invitation websites from Kerala. Your story, every function, maps, a live countdown and RSVPs in one link, designed for you and sent on WhatsApp.",
  openGraph: {
    title: "The Wedding Invite Co. · More than an invitation.",
    description: "Wedding invitation websites with your story, every function, maps and RSVPs in one link.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "The Wedding Invite Co. More than an invitation." }],
    type: "website",
    siteName: "The Wedding Invite Co.",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Wedding Invite Co. · More than an invitation.",
    description: "Wedding invitation websites with your story, every function, maps and RSVPs in one link.",
    images: ["/og.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F3ED",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Serif+Display&family=Bodoni+Moda:opsz,wght@6..96,400&family=Pinyon+Script&family=Mrs+Saint+Delafield&family=Anton&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
