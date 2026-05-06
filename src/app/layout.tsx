import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { siteConfig } from "@/lib/site-config";
import { ClientProviders } from "@/components/client-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7efde" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1218" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.name,
  },
  keywords: [
    "expense tracker",
    "budget planner",
    "shared finances",
    "couples budget",
  ],
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    locale: "uk_UA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
};

import { THEME_PRESETS } from "@/lib/theme-presets";

// Tiny script injected into <head> that runs synchronously *before* React
// hydrates. Reads theme + preset from localStorage and applies them to the
// <html> element so there's no flash of unthemed content (FOUC).
//
// We serialize the same palette data the React provider uses so the two
// stay in sync — single source of truth in `theme-presets.ts`.
function buildThemeBootstrapScript(): string {
  const palettes: Record<string, { l: Record<string, string>; d: Record<string, string> }> = {};
  for (const p of THEME_PRESETS) {
    if (p.id === "default") continue;
    palettes[p.id] = {
      l: p.light as Record<string, string>,
      d: p.dark as Record<string, string>,
    };
  }
  const PALETTES_JSON = JSON.stringify(palettes);
  return `(function(){try{
var d=document.documentElement,s=localStorage;
var t=s.getItem('theme');t=(t==='dark'||t==='light')?t:'light';
if(t==='dark')d.classList.add('dark');
d.style.colorScheme=t;
var P=${PALETTES_JSON};
var p=s.getItem('theme-preset');
if(p&&P[p]){
  var pal=P[p][t==='dark'?'d':'l'];
  for(var k in pal){d.style.setProperty(k,pal[k]);}
}
}catch(e){}})();`;
}

const themeBootstrapScript = buildThemeBootstrapScript();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: themeBootstrapScript }}
        />
      </head>
      <body className="flex min-h-dvh flex-col overflow-x-hidden bg-background text-foreground">
        <div className="ambient-bg" />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
