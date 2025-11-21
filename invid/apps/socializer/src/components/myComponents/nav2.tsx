"use client";
import React from "react";
import { Type, FileText, Hash } from "lucide-react";
import FloatingNav from "../ui/floating-navbar";

export function SecondNav() {
  const navItems = [
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
  ];
  
  return (
    <div className="relative">
      <FloatingNav navItems={navItems} />
    </div>
  );
}