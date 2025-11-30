"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? "80px" : "240px" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex flex-col bg-gradient-to-br from-gray-950 via-black to-black h-full w-full fixed left-0 top-0 h-screen border-r border-white/20 z-50"
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <Link href="/" className="font-bold text-white text-lg">invid.ai</Link>
            </motion.div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                href={item.link}
                className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-gray-300 
                          hover:text-white hover:bg-white/10 transition-all duration-300 
                          relative group"
                title={isCollapsed ? item.name : undefined}
              >
                {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.name}
                  </motion.span>
                )}
                <span className="absolute left-0 top-1/2 transform -translate-y-1/2 
                                w-0 h-8 bg-gradient-to-r from-purple-500 to-pink-500 
                                rounded-r-lg transition-all duration-300 group-hover:w-1" />
              </Link>
            );
          })}
        </nav>

        {/* User Button Footer */}
        <div className="p-4 border-t border-white/10">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <span className="text-sm font-medium text-white">Account</span>
                <span className="text-xs text-gray-400">Manage profile</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-40 ">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 glass rounded-2xl border border-white/20 text-white 
                    hover:bg-white/10 transition-all duration-300 shadow-lg  "
        >
          {isOpen ? <X size={0} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-lg z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden fixed left-0 top-0 h-screen bg-[#111111]/90 w-64  border-r border-white/20 z-50 flex flex-col"
            >
              {/* Logo/Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white text-lg">invid.ai</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={index}
                      href={item.link}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 
                                hover:text-white hover:bg-white/10 transition-all duration-300 
                                relative group"
                    >
                      {Icon && <Icon className="w-5 h-5" />}
                      {item.name}
                      <span className="absolute left-0 top-1/2 transform -translate-y-1/2 
                                      w-0 h-8 bg-gradient-to-r from-purple-500 to-pink-500 
                                      rounded-r-lg transition-all duration-300 group-hover:w-1" />
                    </Link>
                  );
                })}
              </nav>

              {/* User Button Footer */}
              <div className="p-4 border-t border-white/10">
                <div className="flex  items-center gap-3">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10"
                      }
                    }}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm mb-6 font-medium text-white">Account</span>
                    <span className="text-xs text-gray-400">Manage profile</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingNav;