"use client";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="w-full glass border-t border-white/10 text-gray-300 py-16 px-6"
      id="footer"
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">invid.ai</h1>
                <p className="text-xs text-gray-400">AI Content Creator</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              Empowering content creators with AI-powered tools to generate
              viral titles, engaging descriptions, and trending hashtags that
              maximize reach and engagement.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-purple-400" />
                <span>hello@invid.ai</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-purple-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-lg text-white mb-6">Product</h3>
            <ul className="space-y-3 text-sm">
              {[
                { name: "Title Generator", href: "/dashboard/getTitle" },
                {
                  name: "Description Generator",
                  href: "/dashboard/getDescription",
                },
                { name: "Hashtag Generator", href: "/dashboard/getHashtags" },
                { name: "Analytics", href: "#" },
                { name: "API Access", href: "#" },
                { name: "Browser Extension", href: "#" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors duration-200 hover:translate-x-1 
                              transform inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-lg text-white mb-6">Company</h3>
            <ul className="space-y-3 text-sm">
              {[
                { name: "About Us", href: "#about" },
                { name: "Blog", href: "#" },
                { name: "Careers", href: "#" },
                { name: "Contact", href: "#footer" },
                { name: "Privacy Policy", href: "#" },
                { name: "Terms of Service", href: "#" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors duration-200 hover:translate-x-1 
                              transform inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="glass rounded-2xl p-8 mb-12 border border-white/10">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold gradient-text mb-2">
              Stay Updated
            </h3>
            <p className="text-gray-300">
              Get the latest AI content creation tips and platform updates
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 font-[geist] px-4 py-3 bg-white/5 border border-white/20 rounded-xl 
                        text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                        focus:ring-purple-500 focus:border-transparent"
            />
            <button
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                              rounded-xl text-white font-medium hover:from-purple-700 
                              hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-sm text-gray-400">
              © {currentYear} invid.ai. All rights reserved. Made with ❤️ for
              content creators.
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 mr-2">Follow us:</span>
              {[
                { Icon: Youtube, href: "#", color: "hover:text-red-400" },
                { Icon: Twitter, href: "#", color: "hover:text-blue-400" },
                { Icon: Instagram, href: "#", color: "hover:text-pink-400" },
                { Icon: Facebook, href: "#", color: "hover:text-blue-500" },
                { Icon: Linkedin, href: "#", color: "hover:text-blue-600" },
              ].map(({ Icon, href, color }, idx) => (
                <a
                  key={idx}
                  href={href}
                  className={`p-2 rounded-xl glass hover:bg-white/10 transition-all duration-300 
                            transform hover:scale-110 ${color}`}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
