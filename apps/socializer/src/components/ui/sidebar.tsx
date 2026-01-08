"use client";
import { useSidebar } from "@/contexts/SidebarContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  Star,
  User,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { usePricingDialog } from "@/components/pricing-dialog";
import {
  totalUsageSelector,
  userDisplaySelector,
  userLoadingAtom,
  useInitializeUser,
} from "@/state";

interface NavItem {
  name: string;
  link: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  navItems: NavItem[];
}

// Inline Usage Tracker for Sidebar - Now powered by Recoil
const SidebarUsageTracker = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const totalUsage = useRecoilValue(totalUsageSelector);
  const isLoading = useRecoilValue(userLoadingAtom);
  const [timeLeft, setTimeLeft] = useState("23:45:12");

  // Initialize user data on mount
  useInitializeUser();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get color based on usage percentage
  const getProgressColor = () => {
    if (totalUsage.percentage < 50) return "from-green-400 to-emerald-500";
    if (totalUsage.percentage < 80) return "from-yellow-400 to-orange-500";
    return "from-red-400 to-red-600";
  };

  if (isCollapsed) {
    return (
      <div
        className="p-3 mx-3 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 
                  border border-yellow-500/20 flex items-center justify-center cursor-pointer
                  hover:border-yellow-500/40 transition-all"
        title={`${totalUsage.used}/${totalUsage.limit} used • Resets in ${timeLeft}`}
      >
        <Zap className="w-5 h-5 text-yellow-400" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-3 p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 
                border border-yellow-500/20"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-white">Daily Usage</span>
        </div>
        <span className="text-xs text-gray-400 font-medium">
          {isLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            `${totalUsage.used}/${totalUsage.limit}`
          )}
        </span>
      </div>

      <div className="w-full bg-gray-700/50 rounded-full h-2 mb-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${totalUsage.percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`bg-gradient-to-r ${getProgressColor()} h-2 rounded-full`}
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Clock className="w-3 h-3" />
        <span>Resets in {timeLeft}</span>
      </div>
    </motion.div>
  );
};

// Account Dropdown Component - Now powered by Recoil
const AccountDropdown = ({
  isCollapsed = false,
}: {
  isCollapsed?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const userDisplay = useRecoilValue(userDisplaySelector);
  const { openPricingDialog } = usePricingDialog();
  function openPricingDialogBox() {
    // Open the dialog on mount
    openPricingDialog();
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    // Clear cookies via API or directly
    document.cookie =
      "youtube_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.clear();
    setIsOpen(false);
    // Redirect to home page
    router.push("/");
    // Force reload to clear Recoil state
    window.location.reload();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Account Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 p-3 rounded-xl 
                   bg-gradient-to-r from-white/5 to-transparent
                   border border-white/5 hover:border-purple-500/30
                   transition-all duration-300 cursor-pointer group
                   ${isCollapsed ? "justify-center" : ""}`}
      >
        {userDisplay.image ? (
          <img
            src={userDisplay.image}
            alt={userDisplay.name}
            className="w-8 h-8 rounded-lg object-cover flex-shrink-0
                      group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 
                        flex items-center justify-center text-white text-sm font-bold flex-shrink-0
                        group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300"
          >
            {userDisplay.initial}
          </div>
        )}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col min-w-0 text-left"
          >
            <span className="text-sm font-medium text-white truncate">
              {userDisplay.name}
            </span>
            <span className="text-xs text-gray-500 truncate">
              {userDisplay.plan} plan
            </span>
          </motion.div>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute bottom-full mb-2 ${isCollapsed ? "left-0" : "left-0 right-0"}
                       min-w-[220px] p-2 rounded-xl
                       bg-gradient-to-br from-gray-900/95 via-gray-950/95 to-black/95
                       backdrop-blur-xl border border-white/10
                       shadow-2xl shadow-purple-500/10
                       z-[100]`}
          >
            {/* Dropdown Header */}
            <div className="px-3 py-2 mb-2 border-b border-white/10">
              <div className="flex items-center gap-3">
                {userDisplay.image ? (
                  <img
                    src={userDisplay.image}
                    alt={userDisplay.name}
                    className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-purple-500/20"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 
                                flex items-center justify-center text-white font-bold
                                shadow-lg shadow-purple-500/20"
                  >
                    {userDisplay.initial}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-white truncate">
                    {userDisplay.name}
                  </span>
                  <span className="text-xs text-gray-400 truncate">
                    {userDisplay.email || "No email"}
                  </span>
                </div>
              </div>
              {/* Plan badge */}
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                  ${userDisplay.plan === "enterprise"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : userDisplay.plan === "pro"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                    }`}
                >
                  {userDisplay.plan.charAt(0).toUpperCase() +
                    userDisplay.plan.slice(1)}{" "}
                  Plan
                </span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-1">
              {/* Go Pro Button */}
              <button
                onClick={openPricingDialogBox}
                className="w-full flex  bg-gradient-to-r from-purple-800/90 to-pink-500/40 items-center gap-3 px-3 py-2.5 rounded-lg
                         text-gray-300 hover:text-white hover:bg-white/5
                         transition-all  duration-200 group"
              >
                <Star className="w-4 h-4 text-gray-400 group-hover:text-purple-400 animate-spin transition-colors" />
                <span className="text-sm">
                  <span className="flex">Go Pro</span>
                </span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                         text-gray-300 hover:text-white hover:bg-white/5
                         transition-all duration-200 group"
              >
                <User className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                <span className="text-sm font-medium">Profile</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                         text-gray-300 hover:text-white hover:bg-white/5
                         transition-all duration-200 group"
              >
                <Settings className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                <span className="text-sm font-medium">Settings</span>
              </button>
            </div>

            {/* Divider */}
            <div className="my-2 border-t border-white/10" />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                       text-red-400 hover:text-red-300 hover:bg-red-500/10
                       transition-all duration-200 group"
            >
              <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Log out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ navItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActiveLink = (link: string) => {
    const normalizedPathname = pathname.replace(/\/$/, "") || "/";
    const normalizedLink = link.replace(/\/$/, "") || "/";

    if (normalizedLink === "/dashboard") {
      return normalizedPathname === "/dashboard";
    }

    return (
      normalizedPathname === normalizedLink ||
      normalizedPathname.startsWith(normalizedLink + "/")
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? "80px" : "260px" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen z-50
                   bg-gradient-to-b from-gray-950/95 via-black/95 to-gray-950/95
                   backdrop-blur-xl border-r border-white/10
                   shadow-2xl shadow-purple-500/5"
      >
        {/* Logo/Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <a href="/" className="flex items-center gap-2 group">
                  <div
                    className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 
                                border border-purple-500/30 group-hover:border-purple-500/50 transition-all"
                  >
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <span
                    className="font-bold text-lg bg-gradient-to-r from-white via-purple-200 to-white 
                                 bg-clip-text text-transparent"
                  >
                    invid.ai
                  </span>
                </a>
              </motion.div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 
                        border border-white/10 hover:border-purple-500/30
                        text-gray-400 hover:text-white transition-all duration-300"
            >
              {isCollapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = isActiveLink(item.link);

            return (
              <a
                key={index}
                href={item.link}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium 
                          transition-all duration-300 relative group
                          ${isActive
                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/10 text-white border border-purple-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                  }`}
                title={isCollapsed ? item.name : undefined}
              >
                {Icon && (
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-colors duration-300
                    ${isActive ? "text-purple-400" : "group-hover:text-purple-400"}`}
                  />
                )}
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="truncate"
                  >
                    {item.name}
                  </motion.span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Usage Tracker */}
        <div className="py-3" data-tour="usage-tracker">
          <SidebarUsageTracker isCollapsed={isCollapsed} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <AccountDropdown isCollapsed={isCollapsed} />
        </div>
      </motion.div>

      {/* Mobile Menu Button */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="md:hidden fixed top-4 left-4 z-40"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 rounded-2xl bg-black/80 backdrop-blur-xl
                    border border-white/10 hover:border-purple-500/30 
                    text-white hover:text-purple-300
                    transition-all duration-300 shadow-lg shadow-purple-500/10"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-md z-40"
              onClick={() => {
                setIsOpen(false);
                setIsCollapsed(!isCollapsed);
              }}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden fixed left-0 top-0 h-screen w-72 z-50 flex flex-col
                        bg-gradient-to-b from-gray-950/98 via-black/98 to-gray-950/98
                        backdrop-blur-xl border-r border-white/10
                        shadow-2xl shadow-purple-500/10"
            >
              {/* Logo/Header */}
              <div className="p-5 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-2 group">
                    <div
                      className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 
                                  border border-purple-500/30"
                    >
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <span
                      className="font-bold text-lg bg-gradient-to-r from-white via-purple-200 to-white 
                                   bg-clip-text text-transparent"
                    >
                      invid.ai
                    </span>
                  </Link>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 
                              border border-white/10 hover:border-red-500/30
                              text-gray-400 hover:text-red-400 transition-all duration-300"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = isActiveLink(item.link);

                  return (
                    <Link
                      key={index}
                      href={item.link}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium 
                                transition-all duration-300 relative
                                ${isActive
                          ? "bg-gradient-to-r from-purple-500/20 to-pink-500/10 text-white border border-purple-500/30"
                          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                    >
                      {Icon && (
                        <Icon
                          className={`w-5 h-5 ${isActive ? "text-purple-400" : ""}`}
                        />
                      )}
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Usage Tracker - Mobile */}
              <div className="py-3 px-3">
                <SidebarUsageTracker isCollapsed={false} />
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10">
                <AccountDropdown />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
