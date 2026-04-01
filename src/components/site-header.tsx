import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex min-h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-[0.2em] uppercase"
        >
          Budget for Two
        </Link>

        <nav className="flex items-center gap-2 text-sm text-muted">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 transition-colors hover:bg-brand-soft hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
