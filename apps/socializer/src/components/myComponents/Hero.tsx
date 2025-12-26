"use client";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { ProgressIndicator } from "@/components/ui/progress-indicator";

const Hero = () => {
  return (
    <main>
      <BackgroundBeamsDemo />
      <Hero2 />
    </main>
  );
};

export default Hero;

import { BackgroundBeams } from "@/components/ui/background-beams";
import { Hero2 } from "./Hero2";

export function BackgroundBeamsDemo() {
  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center antialiased px-4 pt-24 pb-8">
      <div className="max-w-4xl mx-auto text-center animate-fade-in">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm font-medium">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="gradient-text">AI-Powered Content Creation</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            Boost Your Reach Across
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Social Media
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
          Transform your content strategy with AI-powered insights that maximize
          visibility, engagement, and growth across all platforms.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link className="z-[99] group" href="/sign-in">
            <button
              className="px-8 py-4 rounded-2xl text-white font-semibold text-lg
                     bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 
                     shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 
                     transition-all duration-300 flex items-center gap-2 min-w-[200px]"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>

          <button
            onClick={() => {
              document.getElementById("demo")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
            className="px-8 py-4 rounded-2xl font-semibold text-lg z-[99] group
                     glass hover:bg-white/10 transition-all duration-300 
                     flex items-center gap-2 min-w-[200px] text-white"
          >
            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Watch Demo
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">100+</div>
            <div className="text-gray-400">Active Creators</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">50K+</div>
            <div className="text-gray-400">Content Generated</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">95%</div>
            <div className="text-gray-400">Engagement Boost</div>
          </div>
        </div>
      </div>
      <BackgroundBeams />
      <ProgressIndicator />
    </div>
  );
}
