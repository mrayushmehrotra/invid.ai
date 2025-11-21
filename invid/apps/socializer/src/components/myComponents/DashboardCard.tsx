"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LucideIcon, ArrowRight, Sparkles, Zap } from "lucide-react";

interface Props {
  CardTitle: string;
  about: string;
  link: string;
  origin: string;
  icon: LucideIcon;
}

const DashboardCard = ({ CardTitle, about, link, origin, icon }: Props) => {
  const Icon = icon;

  return (
    <div className="group w-[380px] h-[420px] animate-fade-in">
      <Link href={link}>
        <div className="relative overflow-hidden rounded-3xl glass border border-white/10 
                        hover:border-purple-400/50 transition-all duration-500 
                        transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20
                        bg-gradient-to-br from-white/[0.05] to-white/[0.02] w-full h-full">
          
          {/* Hover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/3 to-indigo-500/5 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Sparkle effect */}
          <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          </div>

          {/* Content */}
          <div className="relative p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/15 rounded-full border border-green-500/25">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-300 font-medium">Ready</span>
              </div>
              <div className="text-xs text-purple-300 uppercase tracking-wide font-semibold">
                {origin}
              </div>
            </div>

            {/* Icon and Title */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/25 to-pink-500/25 
                              group-hover:from-purple-500/35 group-hover:to-pink-500/35 
                              transition-all duration-500 flex items-center justify-center
                              group-hover:scale-105">
                <Icon className="w-8 h-8 text-purple-300 group-hover:text-purple-200 
                                transition-colors duration-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-100 
                               transition-colors duration-500 leading-tight">
                  {CardTitle}
                </h3>
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-xs text-yellow-300 font-medium">AI-Enhanced</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex-1 mb-6">
              <p className="text-gray-300 text-sm leading-relaxed 
                            group-hover:text-gray-200 transition-colors duration-500">
                {about}
              </p>
            </div>

            {/* Action Button */}
            <div className="mt-auto">
              <Button className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 
                               hover:from-purple-700 hover:to-pink-700 
                               text-white font-semibold rounded-xl border-0 shadow-lg 
                               hover:shadow-purple-500/25 transition-all duration-300 
                               flex items-center justify-center gap-2 group/btn">
                <span>Launch Tool</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
              </Button>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r 
                          from-purple-500 to-pink-500 
                          transform scale-x-0 group-hover:scale-x-100 
                          transition-transform duration-500 origin-center" />
        </div>
      </Link>
    </div>
  );
};

export default DashboardCard;