import type { Metadata, Viewport } from "next";
import Script from "next/script";
// Fonts are served from our own server (no render-blocking request to Google).
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/400-italic.css";
import "@fontsource/mrs-saint-delafield/400.css";
import "@fontsource/anton/400.css";
import "@fontsource/dm-serif-display/400.css";
import "@fontsource/bodoni-moda/400.css";
import "@fontsource/pinyon-script/400.css";
import "./globals.css";

/* Built per request, so the real SITE_URL from .env is used (not the build-time default). */
export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kerala Wedding Invitation Websites · The Wedding Invite Co.",
    template: "%s · The Wedding Invite Co.",
  },
  description:
    "Kerala wedding invitation websites sent on WhatsApp: every function, maps, RSVP and your story in one link. Make your own from ₹1,999, or let us design it.",
  openGraph: {
    title: "Wedding Invitation Websites in Kerala · The Wedding Invite Co.",
    description: "Custom wedding invitation websites sent on WhatsApp: every function, maps and RSVP in one link. From ₹4,999.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "The Wedding Invite Co. wedding invitation website on a phone, sealed with the TWIC wax seal" }],
    type: "website",
    siteName: "The Wedding Invite Co.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedding Invitation Websites in Kerala · The Wedding Invite Co.",
    description: "Custom wedding invitation websites sent on WhatsApp: every function, maps and RSVP in one link. From ₹4,999.",
    images: ["/og.jpg"],
  },
  };
}

export const viewport: Viewport = {
  themeColor: "#F8F1EA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        {process.env.META_PIXEL_ID ? (
          <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${process.env.META_PIXEL_ID.replace(/[^0-9]/g, "")}');fbq('track','PageView');`}</Script>
        ) : null}
      </body>
    </html>
  );
}
