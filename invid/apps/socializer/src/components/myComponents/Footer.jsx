"use client";
import React from "react";
import { Youtube, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-zinc-950 text-gray-300 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-gray-800 pb-10">
        {/* Brand Info */}
        <div>
          <h1 className="text-3xl font-bold text-white">
            Socializer<span className="text-indigo-400">.ai</span>
          </h1>
          <p className="mt-4 text-sm leading-6 text-gray-400">
            Empowering every video creator with insights <br /> and inspiration
            they need to grow.
          </p>
          <p className="mt-6 text-xs text-gray-500">
            &copy; 2024 Socializer.ai. All Rights Reserved.
          </p>
        </div>

        {/* Product Links */}
        <div>
          <h2 className="font-semibold text-lg text-white">Product</h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {[
              "Affiliates",
              "YouTube Stats",
              "Brand Solutions",
              "Agency Solutions",
              "MCN Solutions",
              "Browser Extension",
              "vidIQ Academy",
            ].map((link, idx) => (
              <li key={idx}>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Other Links */}
        <div>
          <h2 className="font-semibold text-lg text-white">Other</h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {[
              "Contact",
              "Terms",
              "Privacy",
              "Support",
              "Get More YouTube Views",
            ].map((link, idx) => (
              <li key={idx}>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-8 flex flex-col items-center text-center space-y-4">
        <h2 className="text-lg font-semibold text-white">Connect with us</h2>
        <p className="text-sm text-gray-400">
          Call Sales:{" "}
          <span className="text-white">888-998-SOCIALIZER.AI (8434)</span>
        </p>

        {/* Social Icons */}
        <div className="flex space-x-6 mt-4">
          {[Youtube, Facebook, Instagram, Twitter, Linkedin].map(
            (Icon, idx) => (
              <a
                key={idx}
                href="#"
                className="p-2 rounded-full bg-zinc-800 hover:bg-blue-500 transition-all duration-300"
              >
                <Icon size={20} className="text-white" />
              </a>
            ),
          )}
        </div>

        {/* Language Selector */}
        <div className="mt-6 text-xs text-gray-500 flex flex-wrap justify-center gap-3">
          English • Français • Español • Русский • Português • Türkçe • Tiếng
          Việt
        </div>
      </div>
    </footer>
  );
};

export default Footer;
