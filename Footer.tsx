import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "wouter";
import logoUrl from "./85c92c05-d485-4a9f-a01f-2052333a0fce.png";
import { COMPANY_INFO } from "@/const";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <img
              src={logoUrl}
              alt="Mobile Autoworks NZ"
              className="h-20 w-auto mb-4"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Mobile mechanic Auckland: Mobile diagnostics, repairs & WOF remedial work across Central Auckland, West Auckland and the North Shore (no WOF inspections carried out).
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/">
                  <a className="text-muted-foreground hover:text-accent transition-colors">
                    Home
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/services">
                  <a className="text-muted-foreground hover:text-accent transition-colors">
                    Services
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-muted-foreground hover:text-accent transition-colors">
                    About Us
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <a className="text-muted-foreground hover:text-accent transition-colors">
                    Blog
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/areas">
                  <a className="text-muted-foreground hover:text-accent transition-colors">
                    Service Areas
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/book">
                  <a className="text-muted-foreground hover:text-accent transition-colors">Booking request (subject to confirmation)</a>
                </Link>
              </li>
              <li>
                <Link href="/quote">
                  <a className="text-muted-foreground hover:text-accent transition-colors">Quote request</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-accent" />
                <a href="tel:0276421824" className="text-muted-foreground hover:text-accent transition-colors">
                  {COMPANY_INFO.phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-accent" />
                <a href="mailto:chris@mobileautoworksnz.com" className="text-muted-foreground hover:text-accent transition-colors">
                  chris@mobileautoworksnz.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-accent" />
                <span className="text-muted-foreground">
                  Servicing Central Auckland, West Auckland and the North Shore
                </span>
              </li>
            </ul>

            <div className="mt-6 rounded-md border bg-background p-4 text-sm">
              <div className="font-semibold">Breakdown assistance – Auckland</div>
              <div className="mt-2 text-muted-foreground">
                For urgent breakdown assistance, call or text{' '}
                <a href="tel:0276421824" className="font-bold underline">{COMPANY_INFO.phone}</a>.
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>
            Payment is due on completion of work. Card (tap), bank transfer, or cash accepted.
          </p>
          <p>&copy; {new Date().getFullYear()} Mobile Autoworks NZ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
