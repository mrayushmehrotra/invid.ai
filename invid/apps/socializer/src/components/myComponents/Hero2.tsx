"use client";
import Image from "next/image";
import React from "react";
import Tilt from "react-parallax-tilt";
import { Users, Zap, TrendingUp, Shield, Globe, Sparkles } from "lucide-react";

export function Hero2() {
  const features = [
    {
      icon: Globe,
      title: "Multi-Platform Reach",
      description: "Automatically optimize content for TikTok, Instagram, YouTube, and more from a single creation workflow.",
      tags: ["TikTok", "Instagram", "YouTube"],
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "AI-Powered Optimization",
      description: "Our AI analyzes trends and automatically enhances your content for maximum engagement across all platforms.",
      tags: ["Real-time Analytics", "Trend Analysis"],
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Trusted Community",
      description: "Join 100+ creators already boosting their views and engagement with our proven tools and strategies.",
      tags: ["100+ Creators", "Proven Results"],
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="gradient-text">Why Choose invid.ai?</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Everything You Need to
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              Dominate Social Media
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our AI-powered platform provides all the tools you need to create, optimize, 
            and scale your content across every major social media platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Tilt 
                key={index}
                tiltReverse={true} 
                tiltMaxAngleY={10} 
                tiltMaxAngleX={10}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="glass rounded-2xl p-8 h-full border border-white/10 
                              hover:border-purple-500/30 transition-all duration-500 
                              group hover:shadow-2xl hover:shadow-purple-500/10">
                  
                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} 
                                  bg-opacity-20 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-purple-100 
                                transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-300 mb-6 leading-relaxed group-hover:text-gray-200 
                              transition-colors duration-300">
                    {feature.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {feature.tags.map((tag, tagIndex) => (
                      <span 
                        key={tagIndex}
                        className="px-3 py-1 rounded-full text-xs font-medium glass 
                                  border border-white/20 text-gray-300 
                                  group-hover:border-purple-400/50 group-hover:text-purple-200 
                                  transition-all duration-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Hover Effect Line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} 
                                  transform scale-x-0 group-hover:scale-x-100 
                                  transition-transform duration-500 origin-left rounded-b-2xl`} />
                </div>
              </Tilt>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="glass rounded-3xl p-8 md:p-12 border border-white/10 animate-fade-in">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold gradient-text mb-4">
              Trusted by Content Creators Worldwide
            </h3>
            <p className="text-gray-300">
              Join thousands of creators who are already growing their audience with our AI tools
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">100+</div>
              <div className="text-gray-400 text-sm">Active Creators</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">50K+</div>
              <div className="text-gray-400 text-sm">Content Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">95%</div>
              <div className="text-gray-400 text-sm">Engagement Boost</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">24/7</div>
              <div className="text-gray-400 text-sm">AI Support</div>
            </div>
          </div>

          {/* Creator Avatars */}
          <div className="flex justify-center items-center mt-8 gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden 
                            bg-gradient-to-br from-purple-400 to-pink-400"
                >
                  <Image
                    src="/ai_with_human.jpg"
                    height={48}
                    width={48}
                    alt="Creator"
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-400 ml-4">
              <div className="font-medium text-white">Join our community</div>
              <div>of successful creators</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}