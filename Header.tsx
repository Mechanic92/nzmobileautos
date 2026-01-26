import { Button } from "@/components/ui/button";
import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import ChatBot from "./ChatBot";
import logoUrl from "./85c92c05-d485-4a9f-a01f-2052333a0fce.png";
import { COMPANY_INFO } from "@/const";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Service Areas", href: "/areas" },
    { name: "Quote request", href: "/quote" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <img
                src={logoUrl}
                alt="Mobile Autoworks"
                className="h-14 w-auto"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            {navigation.map((item) => (
              item.href.startsWith("http") ? (
                <a
                  key={item.name}
                  className="text-sm font-medium transition-colors hover:text-accent text-foreground"
                  href={item.href}
                >
                  {item.name}
                </a>
              ) : (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`text-sm font-medium transition-colors hover:text-accent ${location === item.href ? "text-accent" : "text-foreground"
                      }`}
                  >
                    {item.name}
                  </a>
                </Link>
              )
            ))}
            <Link href="/book">
              <a>
                <Button size="sm" variant="outline">
                  Booking request (subject to confirmation)
                </Button>
              </a>
            </Link>
            <a href="tel:0276421824">
              <Button size="sm" className="gap-2">
                <Phone className="h-4 w-4" />
                <span>{COMPANY_INFO.phone}</span>
              </Button>
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-background">
            <div className="container space-y-1 py-4">
              {navigation.map((item) => (
                item.href.startsWith("http") ? (
                  <a
                    key={item.name}
                    className="block px-4 py-2 text-base font-medium rounded-md transition-colors text-foreground hover:bg-muted"
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={`block px-4 py-2 text-base font-medium rounded-md transition-colors ${location === item.href
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-muted"
                        }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  </Link>
                )
              ))}
              <div className="px-4 pt-2">
                <Link href="/book">
                  <a onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full" variant="outline">Booking request (subject to confirmation)</Button>
                  </a>
                </Link>
                <div className="mt-2 text-xs text-muted-foreground">
                  Requests are reviewed and confirmed by the technician.
                </div>
              </div>
              <div className="px-4 pt-2">
                <a href="tel:0276421824">
                  <Button className="w-full gap-2">
                    <Phone className="h-4 w-4" />
                    {COMPANY_INFO.phone}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
      <ChatBot />
    </>
  );
}
