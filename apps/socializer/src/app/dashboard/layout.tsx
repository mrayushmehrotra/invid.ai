"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SecondNav } from "@/components/myComponents/sidebar-ui";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className="bg-gradient-to-br from-gray-950 h-full w-full via-black to-black transition-all duration-300 ease-in-out"
      style={{
        paddingLeft: `${isCollapsed ? 80 : 240}px`,
      }}
    >
      {/* Hide padding on mobile since sidebar is overlay */}
      <style jsx>{`
        @media (max-width: 767px) {
          div {
            padding-left: 0 !important;
          }
        }
      `}</style>
      {children}
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("youtube_access_token");
      if (!token) {
        router.push("/sign-in");
      } else {
        setIsAuthorized(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <SecondNav />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </SidebarProvider>
  );
}
