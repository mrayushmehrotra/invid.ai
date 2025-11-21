"use client";

import React from "react";
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

const Page = () => {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center px-4 py-8">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />
      
      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2 glass px-4 py-2 rounded-xl 
                  text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      {/* Main Content */}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl 
                          flex items-center justify-center">
              <span className="text-white font-bold text-xl">I</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">invid.ai</h1>
              <p className="text-xs text-gray-400">AI Content Creator</p>
            </div>
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Join 100+ Creators</span>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">Create Your Account</h2>
          <p className="text-gray-300">Start generating viral content with AI</p>
        </div>

        {/* Clerk SignUp Component */}
        <div className="glass rounded-2xl p-8 border border-white/10">
          <SignUp
            fallbackRedirectUrl="/dashboard"
            appearance={{
              baseTheme: dark,
              variables: {
                colorBackground: "transparent",
                colorInputBackground: "rgba(255, 255, 255, 0.05)",
                colorInputText: "#ffffff",
                colorText: "#ffffff",
                colorTextSecondary: "#9ca3af",
                colorPrimary: "#8b5cf6",
                borderRadius: "12px",
              },
              elements: {
                card: "bg-transparent shadow-none",
                headerTitle: "text-white text-xl font-bold",
                headerSubtitle: "text-gray-300",
                formButtonPrimary: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300",
                footerActionLink: "text-purple-400 hover:text-purple-300",
              }
            }}
          />
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="glass p-4 rounded-xl">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-xs text-gray-300">SEO Optimized</div>
          </div>
          <div className="glass p-4 rounded-xl">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-xs text-gray-300">Instant Results</div>
          </div>
          <div className="glass p-4 rounded-xl">
            <div className="text-2xl mb-2">📈</div>
            <div className="text-xs text-gray-300">Viral Content</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;