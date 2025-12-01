"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";

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
    <div className="group w-full animate-fade-in">
      <Link href={link}>
        <div className="relative glass rounded-2xl border border-white/10 
                        hover:border-purple-400/40 transition-all duration-300 
                        hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10
                        p-6 h-full flex flex-col overflow-hidden">
          
          {/* Animated gradient background on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-transparent 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Content container */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Header with Icon and Origin Badge */}
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 
                              border border-white/10 group-hover:border-purple-400/30
                              group-hover:scale-110 transition-all duration-300">
                <Icon className="w-6 h-6 text-purple-300 group-hover:text-purple-200 transition-colors" />
              </div>
              <div className="px-3 py-1 rounded-full glass border border-white/10 text-xs font-medium text-gray-400">
                {origin}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-white mb-3 leading-tight 
                          group-hover:text-transparent group-hover:bg-gradient-to-r 
                          group-hover:from-purple-200 group-hover:to-pink-200 
                          group-hover:bg-clip-text transition-all duration-300">
              {CardTitle}
            </h3>

            {/* Description */}
            <div className="flex-1 mb-5">
              <p className="text-gray-400 text-sm leading-relaxed 
                           group-hover:text-gray-300 transition-colors">
                {about}
              </p>
            </div>

            {/* Action Button */}
            <Button className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 
                             hover:from-purple-700 hover:to-pink-700 
                             text-white font-medium rounded-xl text-sm
                             shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40
                             transition-all duration-300 group/btn
                             flex items-center justify-center gap-2">
              <span>Launch Tool</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default DashboardCard;