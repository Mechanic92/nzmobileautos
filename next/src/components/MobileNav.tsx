"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

interface MobileNavProps {
  isAdmin: boolean;
}

export default function MobileNav({ isAdmin }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex text-sm items-center gap-3">
        {isAdmin && (
          <a
            className="text-white/80 hover:text-white no-underline px-3 py-2 rounded-md hover:bg-white/5"
            href="/admin"
          >
            Admin
          </a>
        )}
        <a
          className="no-underline px-3 py-2 rounded-md bg-brand-yellow text-black font-semibold hover:bg-brand-yellow/90"
          href="/instant-quote"
        >
          Instant quote
        </a>
      </nav>

      {/* Mobile Navigation Toggle */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-md hover:bg-white/5 text-white"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <div className="fixed top-[73px] right-0 w-full max-w-sm bg-surface border-l border-white/10 shadow-2xl z-50 md:hidden">
            <nav className="flex flex-col p-6 gap-3">
              <a
                className="text-white/80 hover:text-white no-underline px-4 py-3 rounded-md hover:bg-white/5 text-lg font-medium"
                href="/"
                onClick={closeMenu}
              >
                Home
              </a>
              <a
                className="text-white/80 hover:text-white no-underline px-4 py-3 rounded-md hover:bg-white/5 text-lg font-medium"
                href="/#services"
                onClick={closeMenu}
              >
                Services
              </a>
              {isAdmin && (
                <a
                  className="text-white/80 hover:text-white no-underline px-4 py-3 rounded-md hover:bg-white/5 text-lg font-medium"
                  href="/admin"
                  onClick={closeMenu}
                >
                  Admin
                </a>
              )}
              <a
                className="no-underline px-4 py-3 rounded-md bg-brand-yellow text-black font-semibold hover:bg-brand-yellow/90 text-lg text-center mt-2 group"
                href="/instant-quote"
                onClick={closeMenu}
              >
                Instant quote
              </a>
              <a
                className="no-underline px-4 py-3 rounded-md border border-white/10 text-white font-semibold hover:bg-white/5 text-lg text-center mt-2 flex items-center justify-center gap-2"
                href="tel:0276421824"
              >
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Call 027 642 1824
              </a>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
