"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

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
    <div className="group w-full max-w-xs h-[280px] animate-fade-in">
      <Link href={link}>
        <div className="glass rounded-xl border border-white/10 hover:border-purple-400/50 
                        transition-all duration-300 hover:scale-[1.02] p-4 h-full flex flex-col">
          
          {/* Icon and Title */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/25 to-pink-500/25 
                            flex items-center justify-center">
              <Icon className="w-5 h-5 text-purple-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-white leading-tight">
                {CardTitle}
              </h3>
            </div>
          </div>

          {/* Description */}
          <div className="flex-1 mb-4">
            <p className="text-gray-300 text-sm leading-relaxed">
              {about}
            </p>
          </div>

          {/* Action Button */}
          <Button className="w-full h-9 bg-gradient-to-r from-purple-600 to-pink-600 
                           hover:from-purple-700 hover:to-pink-700 
                           text-white font-medium rounded-lg text-sm">
            Launch Tool
          </Button>
        </div>
      </Link>
    </div>
  );
};

export default DashboardCard;