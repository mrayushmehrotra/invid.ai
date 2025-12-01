"use client";

import { useState, useEffect, memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardCard from "@/components/myComponents/DashboardCard";
import UnderConstructionCard from "@/components/myComponents/UnderConstructionCard";
import { FileText, Hash, Type, Sparkles, TrendingUp, Volume2, Youtube, Construction } from "lucide-react";
import { UsageTracker } from "@/components/ui/usage-tracker";
import { OnboardingTour } from "@/components/ui/onboarding-tour";
import { SmartTooltip } from "@/components/ui/smart-tooltip";
import { QuickActions } from "@/components/ui/quick-actions";

const Page = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  const Data = [
    {
      title: {
        origin: "Generate Title",
        main: "Craft SEO-Optimized Titles",
        description:
          "Create compelling, SEO-friendly titles that capture attention and drive clicks across YouTube, social media, and other platforms.",
      },
      goto: "/dashboard/getTitle",
      icon: Type,
    },
    {
      title: {
        origin: "Generate Description",
        main: "Engaging SEO Descriptions",
        description:
          "Boost your visibility with engaging, SEO-optimized descriptions that highlight your content's value and attract more viewers.",
      },
      goto: "/dashboard/getDescription",
      icon: FileText,
    },
    {
      title: {
        origin: "Generate Hashtags",
        main: "Trending Hashtags",
        description:
          "Enhance your reach and discoverability with effective, trending hashtags that resonate with your target audience.",
      },
      goto: "/dashboard/getHashtags",
      icon: Hash,
    },
    {
      title: {
        origin: "Text to Speech",
        main: "AI Voice Generator",
        description:
          "Convert your text content into natural-sounding speech with customizable voice settings and multiple language options.",
      },
      goto: "/dashboard/text-to-speech",
      icon: Volume2,
    },
    {
      title: {
        origin: "YouTube Manager",
        main: "YouTube Analytics & Upload",
        description:
          "Connect your YouTube channel to view analytics, manage videos, and upload content directly from the platform.",
      },
      goto: "/dashboard/youtube-manager",
      icon: Youtube,
    },
    {
      title: {
        origin: "Video Captioning",
        main: "Video Subtitle Generator",
        description:
          "Automatically generate accurate and synchronized subtitles for your videos to improve accessibility and engagement.",
      },
      goto: "/dashboard/video-captioning",
      icon: Construction,
      underConstruction: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-black">
      {/* Hero Section */}
      <div className="pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-sm font-medium">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="gradient-text">AI Content Dashboard</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Create Content That
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              Converts & Engages
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Choose your content type and let our AI generate optimized titles,
            descriptions, and hashtags that maximize your reach.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 px-4 py-2 glass rounded-full border border-white/10">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">
                95% Engagement Boost
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 glass rounded-full border border-white/10">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">
                AI-Powered Optimization
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Cards Section - Takes up 3 columns on large screens */}
          <div className="lg:col-span-3">
            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Content Tools</h2>
              <p className="text-sm text-gray-400">Select a tool to start creating optimized content</p>
            </div>

            {/* Cards Grid */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
              data-tour="dashboard-cards"
            >
              {loading
                ? Data.map((_, index) => (
                  <div key={index} className="w-full">
                    <div className="glass rounded-2xl p-6 border border-white/10 animate-pulse">
                      <Skeleton className="h-4 w-28 mb-4 bg-white/10 rounded-lg" />
                      <Skeleton className="h-7 w-full mb-3 bg-white/10 rounded-lg" />
                      <Skeleton className="h-20 w-full mb-6 bg-white/10 rounded-lg" />
                      <Skeleton className="h-11 w-36 bg-white/10 rounded-xl" />
                    </div>
                  </div>
                ))
                : Data.map((item, key) => (
                  <SmartTooltip
                    key={key}
                    content={
                      item.underConstruction
                        ? "Coming soon!"
                        : `Click to start generating ${item.title.origin.toLowerCase()}`
                    }
                  >
                    {item.underConstruction ? (
                      <UnderConstructionCard
                        origin={item.title.origin}
                        about={item.title.description}
                        CardTitle={item.title.main}
                        icon={item.icon}
                      />
                    ) : (
                      <DashboardCard
                        origin={item.title.origin}
                        about={item.title.description}
                        CardTitle={item.title.main}
                        link={item.goto}
                        icon={item.icon}
                      />
                    )}
                  </SmartTooltip>
                ))}
            </div>
          </div>

          {/* Sidebar - Takes up 1 column on large screens */}
          <div className="lg:col-span-1 space-y-6">
            {/* Usage Tracker */}
            <div data-tour="usage-tracker">
              <UsageTracker />
            </div>

            {/* Pro Tips */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Pro Tips</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/5 hover:border-white/10">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300 leading-relaxed">
                    Use specific keywords for better SEO results
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/5 hover:border-white/10">
                  <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-red-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300 leading-relaxed">
                    Test multiple title variations for best results
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/5 hover:border-white/10">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300 leading-relaxed">
                    Mix trending and niche hashtags
                  </span>
                </div>
              </div>
            </div>

            {/* Trending Section */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Trending Now</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/5 hover:border-white/10 group">
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">#AIContent</span>
                  <span className="text-green-400 font-semibold text-sm">+127%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/5 hover:border-white/10 group">
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">#SocialMediaTips</span>
                  <span className="text-green-400 font-semibold text-sm">+89%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/5 hover:border-white/10 group">
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">#ContentCreator</span>
                  <span className="text-green-400 font-semibold text-sm">+65%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OnboardingTour />

      {/* Quick Actions FAB - only show on mobile */}
      <div className="lg:hidden">
        <QuickActions />
      </div>
    </div>
  );
};

export default memo(Page);

