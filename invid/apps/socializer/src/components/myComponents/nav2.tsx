"use client";
import React from "react";
import { Type, FileText, Hash, Home, Youtube } from "lucide-react";
import FloatingNav from "../ui/floating-navbar";

export function SecondNav() {
  const navItems = [
    {
      name: "Dashboard",
      link: "/dashboard",
      icon: Home,
    },
    {
      name: "Title",
      link: "/dashboard/getTitle",
      icon: Type,
    },
    {
      name: "Description",
      link: "/dashboard/getDescription",
      icon: FileText,
    },
    {
      name: "Hashtags",
      link: "/dashboard/getHashtags",
      icon: Hash,
    },
    {
      name: "Youtube",
      link: "/dashboard/youtube-manager/",
      icon: Youtube,
    },
  ];

  return (
    <div className="relative">
      <FloatingNav navItems={navItems} />
    </div>
  );
}