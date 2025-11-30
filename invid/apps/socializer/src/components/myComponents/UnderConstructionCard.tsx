"use client";

import React from "react";
import { LucideIcon, Construction, Clock } from "lucide-react";

interface Props {
  CardTitle: string;
  about: string;
  origin: string;
  icon: LucideIcon;
}

const UnderConstructionCard = ({ CardTitle, about, origin, icon }: Props) => {
  const Icon = icon;

  return (
    <div className="max-w-5xl max-h-4xl animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl glass border border-orange-500/20 
                      bg-gradient-to-br from-orange-500/5 to-yellow-500/5 w-full h-full
                      opacity-75 cursor-not-allowed">

        <div className="relative p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/15 rounded-full border border-orange-500/25">
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
              <span className="text-xs text-orange-300 font-medium">Development</span>
            </div>
            <div className="text-xs text-orange-300 uppercase tracking-wide font-semibold">
              {origin}
            </div>
          </div>

          {/* Icon and Title */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/25 to-yellow-500/25 
                            flex items-center justify-center">
              <Icon className="w-8 h-8 text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                {CardTitle}
              </h3>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs text-yellow-300 font-medium">In Progress</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="flex-1 mb-6">
            <p className="text-gray-300 text-sm leading-relaxed">
              {about}
            </p>
          </div>

        </div>

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r 
                        from-orange-500 to-yellow-500 opacity-50" />
      </div>
    </div>
  );
};

export default UnderConstructionCard;