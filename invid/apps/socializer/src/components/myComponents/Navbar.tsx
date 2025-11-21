"use client";
import React, { memo, useState } from "react";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { isSignedIn } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "#about" },
    { name: "Demo", path: "#demo" },
    { name: "Contact", path: "#footer" },
  ];
  const pathname = usePathname();


  return (
    <nav className="w-full fixed top-4 left-4 right-4 z-50 glass rounded-2xl border border-white/10 mx-auto max-w-7xl">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <Image
              src="/logo.png"
              height={40}
              width={40}
              alt="invid.ai"
              className="rounded-xl transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
          </div>
          <div>
            <span className="text-2xl font-bold gradient-text">invid.ai</span>
            <div className="text-xs text-gray-400 -mt-1">AI Content Creator</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {pathname == '/' && navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="text-gray-300 hover:text-white transition-all duration-300 
                        relative group py-2"
            >
              {item.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r 
                              from-purple-500 to-pink-500 transition-all duration-300 
                              group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Auth Section */}
        <div className="hidden md:flex items-center gap-4">
          {isSignedIn ? (
            <>
              <Link href="/dashboard" className="group">
                <Button 
                  variant="outline" 
                  className="glass border-white/20 text-white hover:bg-white/10 
                            transition-all duration-300 flex items-center gap-2 rounded-xl"
                >
                  <Sparkles className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <div className="p-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                <UserButton />
              </div>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button 
                  variant="outline"
                  className="glass border-white/20 text-white hover:bg-white/10 
                            transition-all duration-300 rounded-xl"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up" className="group">
                <button className="px-6 py-2 text-white font-medium rounded-xl
                                bg-gradient-to-r from-purple-600 to-pink-600 
                                hover:from-purple-700 hover:to-pink-700 
                                shadow-lg hover:shadow-purple-500/25 
                                transition-all duration-300 transform hover:scale-105">
                  Get Started Free
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2 rounded-lg glass hover:bg-white/10 
                    transition-all duration-300"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass border-b border-white/10 
                        animate-fade-in">
          <div className="px-6 py-6 space-y-6">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className="block text-gray-300 hover:text-white transition-colors 
                          py-2 text-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            <div className="pt-6 border-t border-white/10 space-y-4">
              {isSignedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 
                                    hover:from-purple-700 hover:to-pink-700 text-white 
                                    font-medium py-3 rounded-xl shadow-lg">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="p-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                      <UserButton />
                    </div>
                    <span className="text-gray-300">Account Settings</span>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="block text-gray-300 hover:text-white transition-colors 
                              py-2 text-lg font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="block w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <button className="w-full px-6 py-3 text-white font-medium rounded-xl
                                    bg-gradient-to-r from-purple-600 to-pink-600 
                                    hover:from-purple-700 hover:to-pink-700 
                                    shadow-lg transition-all duration-300">
                      Get Started Free
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default memo(Navbar);