"use client";

import { useState, useEffect, memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardCard from "@/components/myComponents/DashboardCard";
import UnderConstructionCard from "@/components/myComponents/UnderConstructionCard";
import Navbar from "@/components/myComponents/Navbar";
import { FileText, Hash, Type, Sparkles, TrendingUp } from "lucide-react";
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
        origin: "Video Captioning Tool",
        main: "Video Subtitle Generator",
        description:
          "Automatically generate accurate and synchronized subtitles for your videos to improve accessibility and engagement.",
      },
      goto: "/dashboard/video-captioning",
      icon: Sparkles,
      underConstruction: true,
    },
  ];

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <div className="pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full glass mb-4 sm:mb-6 text-xs sm:text-sm font-medium">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
            <span className="gradient-text">AI Content Dashboard</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Create Content That
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              Converts & Engages
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-xl lg:max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            Choose your content type and let our AI generate optimized titles,
            descriptions, and hashtags that maximize your reach.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 glass rounded-full">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              <span className="text-xs sm:text-sm text-gray-300">
                95% Engagement Boost
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 glass rounded-full">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
              <span className="text-xs sm:text-sm text-gray-300">
                AI-Powered Optimization
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Cards Section */}
          <div className="xl:col-span-3">
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center"
              data-tour="dashboard-cards"
            >
              {loading
                ? Data.map((_, index) => (
                    <div key={index} className="w-full max-w-sm mx-auto">
                      <div className="glass rounded-2xl p-4 sm:p-6 animate-pulse">
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

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-4 sm:space-y-6 mt-6 xl:mt-0">
            <div data-tour="usage-tracker">
              <UsageTracker />
            </div>

            {/* Quick Tips */}
            <div className="glass rounded-2xl p-3 sm:p-4 border border-white/10">
              <h3 className="text-base sm:text-lg font-bold gradient-text mb-2 sm:mb-3">
                💡 Pro Tips
              </h3>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
                  <span className="text-gray-300">
                    Use specific keywords for better SEO results
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
                  <span className="text-gray-300">
                    Test multiple title variations
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
                  <span className="text-gray-300">
                    Mix trending and niche hashtags
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass rounded-2xl p-3 sm:p-4 border border-white/10">
              <h3 className="text-base sm:text-lg font-bold gradient-text mb-2 sm:mb-3">
                🔥 Trending
              </h3>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="text-gray-300">#AIContent +127%</div>
                <div className="text-gray-300">#SocialMediaTips +89%</div>
                <div className="text-gray-300">#ContentCreator +65%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OnboardingTour />

      {/* Quick Actions FAB - only show on mobile */}
      <div className="xl:hidden">
        <QuickActions />
      </div>
    </>
  );
};

export default memo(Page);

