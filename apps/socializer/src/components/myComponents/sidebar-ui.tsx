"use client";
import { FileText,  Home, Music2, Youtube } from "lucide-react";
import Sidebar from "../ui/sidebar";

export function SecondNav() {
  const navItems = [
    {
      name: "Dashboard",
      link: "/dashboard",
      icon: Home,
    },
    {
      name: "Metadata",
      link: "/dashboard/get-metadata",
      icon: FileText,
    },
    {
      name: "Text to speech",
      link: "/dashboard/tts",
      icon: Music2,
    },
    {
      name: "Youtube",
      link: "/dashboard/yt",
      icon: Youtube,
    },
  ];

  return (
    <div className="relative">
      <Sidebar navItems={navItems}  />
    </div>
  );
}
