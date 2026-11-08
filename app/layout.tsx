import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

const siteUrl = process.env.SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Wedding Invitation Website in Kerala | WhatsApp Invites with RSVP · The Wedding Invite Co.",
    template: "%s · The Wedding Invite Co.",
  },
  description:
    "Custom wedding invitation websites from Kerala, sent on WhatsApp. RSVP for every function, maps, your story and photos in one link. From ₹4,999, designed for you.",
  alternates: { canonical: siteUrl },
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

export const viewport: Viewport = {
  themeColor: "#F8F1EA",
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
      <body>
        {children}
        {process.env.META_PIXEL_ID ? (
          <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${process.env.META_PIXEL_ID.replace(/[^0-9]/g, "")}');fbq('track','PageView');`}</Script>
        ) : null}
      </body>
    </html>
  );
}
