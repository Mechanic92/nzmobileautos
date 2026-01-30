import type { Metadata } from "next";
import "./globals.css";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSession } from "@/server/adminSession";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "https://www.mobileautoworksnz.com"),
  title: {
    default: "Mobile Autoworks NZ | #1 Mobile Mechanic Auckland",
    template: "%s | Mobile Autoworks NZ",
  },
  description: "Auckland's trusted mobile mechanic. Expert car diagnostics, pre-purchase inspections, and mechanical repairs at your door. Fixed pricing, same-day reports.",
  keywords: ["mobile mechanic auckland", "car diagnostics auckland", "pre-purchase inspection auckland", "mobile car repair", "west auckland mechanic", "north shore mechanic", "auckland mobile car servicing"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Mobile Autoworks NZ",
    url: "https://www.mobileautoworksnz.com",
    title: "Mobile Autoworks NZ | Expert Mobile Mechanic Auckland",
    description: "Expert automotive care delivered to your home or office. Diagnostics, inspections, and repairs across Auckland.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const secret = process.env.ADMIN_AUTH_SECRET;
  const token = (await cookies()).get(adminCookieName())?.value;
  const isAdmin = secret && token ? Boolean(await verifyAdminSession(token, secret)) : false;

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-black/60 backdrop-blur">
            <div className="container py-4 flex items-center justify-between gap-4">
              <a href="/" className="flex items-center gap-3 no-underline">
                <div className="h-9 w-9 rounded-lg bg-brand-yellow/15 border border-brand-yellow/30 flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-brand-yellow" />
                </div>
                <div className="leading-tight">
                  <div className="font-semibold tracking-tight">
                    <span className="text-brand-yellow">Mobile</span> Autoworks
                  </div>
                  <div className="text-xs text-white/60">Auckland • Diagnostics • Pre-purchase inspections</div>
                </div>
              </a>
              <nav className="text-sm flex items-center gap-1">
                <a className="text-white/80 hover:text-white no-underline px-3 py-2 rounded-md hover:bg-white/5 transition-colors" href="/">
                  Home
                </a>
                <a className="text-white/80 hover:text-white no-underline px-3 py-2 rounded-md hover:bg-white/5 transition-colors" href="/#services">
                  Services
                </a>
                <a className="text-white/80 hover:text-white no-underline px-3 py-2 rounded-md hover:bg-white/5 transition-colors" href="/about">
                  About
                </a>
                <a className="text-white/80 hover:text-white no-underline px-3 py-2 rounded-md hover:bg-white/5 transition-colors" href="/contact">
                  Contact
                </a>
                {isAdmin && (
                  <a className="text-white/80 hover:text-white no-underline px-3 py-2 rounded-md hover:bg-white/5" href="/admin">
                    Admin
                  </a>
                )}
                <a
                  className="no-underline px-4 py-2 rounded-md bg-brand-yellow text-black font-semibold hover:bg-brand-yellow/90 transition-colors ml-2"
                  href="/instant-quote"
                >
                  Get Quote
                </a>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/10">
            <div className="container py-10">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <div className="font-semibold">
                    <span className="text-brand-yellow">Mobile</span> Autoworks NZ
                  </div>
                  <div className="mt-2 text-sm text-white/60 max-w-md">
                    Mobile diagnostics and premium pre-purchase inspections across Auckland. Fast, clear communication and
                    high-quality reports.
                  </div>
                </div>
                <div className="text-sm text-white/60 md:text-right">
                  <div>© {new Date().getFullYear()} Mobile Autoworks NZ</div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
