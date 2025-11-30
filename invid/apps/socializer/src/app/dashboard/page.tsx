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
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="gradient-text">AI Content Dashboard</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Create Content That
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              Converts & Engages
            </span>
          </h1>

          <p className="text-lg text-gray-300 max-w-2xl mb-6">
            Choose your content type and let our AI generate optimized titles,
            descriptions, and hashtags that maximize your reach.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 glass rounded-full">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">
                95% Engagement Boost
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 glass rounded-full">
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
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">Content Tools</h2>
              <p className="text-sm text-gray-400">Select a tool to start creating optimized content</p>
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              data-tour="dashboard-cards"
            >
              {loading
                ? Data.map((_, index) => (
                  <div key={index} className="w-full">
                    <div className="glass rounded-2xl p-6 animate-pulse">
                      <Skeleton className="h-4 w-24 mb-4 bg-gray-700 rounded" />
                      <Skeleton className="h-6 w-48 mb-4 bg-gray-700 rounded" />
                      <Skeleton className="h-20 w-full mb-6 bg-gray-700 rounded" />
                      <Skeleton className="h-10 w-32 bg-gray-700 rounded" />
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
            <div className="glass rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Pro Tips</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-300">
                    Use specific keywords for better SEO results
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-300">
                    Test multiple title variations
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-300">
                    Mix trending and niche hashtags
                  </span>
                </div>
              </div>
            </div>

            {/* Trending Section */}
            <div className="glass rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Trending Now</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-gray-300">#AIContent</span>
                  <span className="text-green-400 font-medium">+127%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-gray-300">#SocialMediaTips</span>
                  <span className="text-green-400 font-medium">+89%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-gray-300">#ContentCreator</span>
                  <span className="text-green-400 font-medium">+65%</span>
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

