"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

interface NavItem {
  name: string;
  link: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FloatingNavProps {
  navItems: NavItem[];
}

const FloatingNav: React.FC<FloatingNavProps> = ({ navItems }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-2 glass rounded-2xl p-2 border border-white/20">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={index}
              href={item.link}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 
                        hover:text-white hover:bg-white/10 transition-all duration-300 
                        relative group flex items-center gap-2"
            >
              {Icon && <Icon className="w-4 h-4" />}
              {item.name}
              <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 
                              w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 
                              transition-all duration-300 group-hover:w-3/4" />
            </Link>
          );
        })}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 glass rounded-2xl border border-white/20 text-white 
                    hover:bg-white/10 transition-all duration-300"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-16 right-0 bg-gray-900/95 md:glass rounded-2xl border border-white/20 
                        p-4 min-w-[200px] shadow-2xl"
            >
              <div className="space-y-2">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={index}
                      href={item.link}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-300 
                                hover:text-white hover:bg-white/10 transition-all duration-300 
                                flex items-center gap-2"
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default FloatingNav;