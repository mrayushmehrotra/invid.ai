"use client";

import {
  Construction,
  FileText,
  Hash,
  Sparkles,
  TrendingUp,
  Type,
  Volume2,
  Youtube,
} from "lucide-react";
import { memo, useEffect, useState } from "react";
import DashboardCard from "@/components/myComponents/DashboardCard";
import UnderConstructionCard from "@/components/myComponents/UnderConstructionCard";
import { OnboardingTour } from "@/components/ui/onboarding-tour";
import { QuickActions } from "@/components/ui/quick-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { SmartTooltip } from "@/components/ui/smart-tooltip";
import { UsageTracker } from "@/components/ui/usage-tracker";

const Page = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  const Data = [
    {
      title: {
        origin: "Youtube Metadata",
        main: "Youtube Metadata Generator",
        description:
          "Generate optimized titles, descriptions, and hashtags for your YouTube videos to improve visibility and engagement.",
      },
      goto: "/dashboard/get-metadata",
      icon: Hash,
    },
    {
      title: {
        origin: "Text to Speech",
        main: "AI Voice Generator",
        description:
          "Convert your text content into natural-sounding speech with customizable voice settings and multiple language options.",
      },
      goto: "/dashboard/tts",
      icon: Volume2,
    },
    {
      title: {
        origin: "YouTube Manager",
        main: "YouTube Analytics & Upload",
        description:
          "Connect your YouTube channel to view analytics, manage videos, and upload content directly from the platform.",
      },
      goto: "/dashboard/yt",
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
      <header className="pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-sm font-medium"
              role="status"
              aria-label="Dashboard badge"
            >
              <Sparkles
                className="w-4 h-4 text-purple-400"
                aria-hidden="true"
              />
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
          <div
            className="flex flex-wrap justify-center gap-3 sm:gap-4"
            role="list"
            aria-label="Dashboard statistics"
          >
            <div
              className="flex items-center gap-2 px-4 py-2 glass rounded-full border border-white/10"
              role="listitem"
            >
              <TrendingUp
                className="w-4 h-4 text-green-400"
                aria-hidden="true"
              />
              <span className="text-sm text-gray-300">
                95% Engagement Boost
              </span>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 glass rounded-full border border-white/10"
              role="listitem"
            >
              <Sparkles
                className="w-4 h-4 text-purple-400"
                aria-hidden="true"
              />
              <span className="text-sm text-gray-300">
                AI-Powered Optimization
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Cards Section - Takes up 3 columns on large screens */}
          <section
            className="lg:col-span-3"
            aria-labelledby="content-tools-heading"
          >
            {/* Section Header */}
            <div className="mb-6">
              <h2
                id="content-tools-heading"
                className="text-2xl font-bold text-white mb-2"
              >
                Content Tools
              </h2>
              <p className="text-sm text-gray-400">
                Select a tool to start creating optimized content
              </p>
            </div>

            {/* Cards Grid */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
              data-tour="dashboard-cards"
              role="list"
              aria-label="Content creation tools"
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
          </section>

          {/* Sidebar - Takes up 1 column on large screens */}
          <aside
            className="lg:col-span-1 space-y-6"
            aria-label="Dashboard sidebar"
          >
            {/* Usage Tracker */}


          </aside>
        </div>
      </main>

      <OnboardingTour />

      {/* Quick Actions FAB - only show on mobile */}
      <div className="lg:hidden">
        <QuickActions />
      </div>
    </div>
  );
};

export default memo(Page);
