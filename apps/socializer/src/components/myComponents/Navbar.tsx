"use client";
import { Menu, Sparkles, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useEffect, useState } from "react";
import { Button } from "../ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "#about" },
    { name: "Demo", path: "#demo" },
    { name: "Contact", path: "#footer" },
  ];
  const pathname = usePathname();

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Main Navbar */}
      <nav
        className="w-full fixed top-4 left-4 right-4 z-[9998] glass rounded-2xl border border-white/10 mx-auto max-w-7xl"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 py-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 group"
            aria-label="invid.ai homepage"
          >
            <div className="relative">
              <Image
                src="/logo.png"
                height={32}
                width={32}
                alt="invid.ai logo"
                className="sm:h-10 sm:w-10 rounded-xl transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold gradient-text">
                invid.ai
              </span>
              <div className="text-[10px] sm:text-xs text-gray-400 -mt-1 hidden sm:block">
                AI Content Creator
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8" role="menubar">
            {pathname === "/" &&
              navLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className="text-gray-300 hover:text-white transition-all duration-300 
                          relative group py-2 focus-ring rounded px-2"
                  role="menuitem"
                  aria-label={`Navigate to ${item.name}`}
                >
                  {item.name}
                  <span
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r 
                                from-purple-500 to-pink-500 transition-all duration-300 
                                group-hover:w-full"
                  />
                </Link>
              ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/sign-in">
              <Button
                variant="outline"
                className="glass border-white/20 text-white hover:bg-white/10 
                          transition-all duration-300 rounded-xl"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/sign-in" className="group">
              <button
                className="px-6 py-2 text-white font-medium rounded-xl
                              bg-gradient-to-r from-purple-600 to-pink-600 
                              hover:from-purple-700 hover:to-pink-700 
                              shadow-lg hover:shadow-purple-500/25 
                              transition-all duration-300 transform hover:scale-105"
              >
                Get Started Free
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 
                      transition-all duration-300 z-[10000] focus-ring"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Full Screen */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] md:hidden animate-fade-in"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Mobile Menu Content */}
          <div
            id="mobile-menu"
            className="fixed inset-0 z-[10000] md:hidden flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
          >
            <div className="w-full h-full bg-gradient-to-br from-gray-950 via-black to-gray-900 overflow-y-auto">
              {/* Close Button - Top Right */}
              <div className="absolute top-6 right-6">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-3 rounded-full glass border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Menu Content - Centered */}
              <div className="flex flex-col items-center justify-center min-h-full px-8 py-20">
                {/* Logo */}
                <Link
                  href="/"
                  className="flex items-center gap-3 mb-12 group"
                  onClick={() => setIsOpen(false)}
                  aria-label="invid.ai homepage"
                >
                  <div className="relative">
                    <Image
                      src="/logo.png"
                      height={48}
                      width={48}
                      alt="invid.ai logo"
                      className="rounded-xl transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <span className="text-3xl font-bold gradient-text">
                      invid.ai
                    </span>
                    <div className="text-xs text-gray-400 -mt-1">
                      AI Content Creator
                    </div>
                  </div>
                </Link>

                {/* Navigation Links */}
                {pathname === "/" && (
                  <div className="w-full max-w-sm space-y-2 mb-8" role="menu">
                    {navLinks.map((item, index) => (
                      <Link
                        key={item.name}
                        href={item.path}
                        className="block w-full text-center glass rounded-xl border border-white/10 px-8 py-4 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 text-lg font-medium transform hover:scale-105 focus-ring"
                        onClick={() => setIsOpen(false)}
                        role="menuitem"
                        aria-label={`Navigate to ${item.name}`}
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animation: "fade-in 0.3s ease-out forwards",
                        }}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Auth Buttons */}
                <div className="w-full max-w-sm space-y-4 mt-8">
                  <Link
                    href="/sign-in"
                    className="block w-full"
                    onClick={() => setIsOpen(false)}
                    aria-label="Sign in to your account"
                  >
                    <Button
                      variant="outline"
                      className="w-full glass border-white/20 text-white hover:bg-white/10 
                                py-6 text-lg rounded-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    href="/sign-in"
                    className="block w-full"
                    onClick={() => setIsOpen(false)}
                    aria-label="Get started with invid.ai"
                  >
                    <button
                      className="w-full px-8 py-6 text-white font-medium rounded-xl text-lg
                                    bg-gradient-to-r from-purple-600 to-pink-600 
                                    hover:from-purple-700 hover:to-pink-700 
                                    shadow-lg hover:shadow-purple-500/50 
                                    transition-all duration-300 transform hover:scale-105"
                    >
                      Get Started Free
                    </button>
                  </Link>
                </div>

                {/* Additional Info */}
                <div className="mt-12 text-center">
                  <p className="text-gray-500 text-sm">
                    © 2024 invid.ai. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default memo(Navbar);
