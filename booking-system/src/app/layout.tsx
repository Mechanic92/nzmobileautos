import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mobile Autoworks NZ | Book Your Service",
  description: "Professional mobile mechanic services in Auckland. Get an instant quote and book online.",
  keywords: ["mobile mechanic", "car service", "Auckland", "oil change", "vehicle service"],
  openGraph: {
    title: "Mobile Autoworks NZ",
    description: "Professional mobile mechanic services in Auckland",
    url: "https://www.mobileautoworksnz.com",
    siteName: "Mobile Autoworks NZ",
    locale: "en_NZ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}
