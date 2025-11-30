"use client";
import React, { useEffect, Suspense } from "react";
import { Youtube, LogIn } from "lucide-react";

import UIWrapper from "@/components/myComponents/UIWrapper";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const AuthContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processing, setProcessing] = React.useState(false);
  const exchangeAttempted = React.useRef(false);

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get("code");
    console.log("OAuth Callback Debug:", { code, processing, exchangeAttempted: exchangeAttempted.current });

    if (code && !processing && !exchangeAttempted.current) {
      console.log("Starting exchange code...");
      exchangeAttempted.current = true;
      setProcessing(true);
      const toastId = toast.loading("Connecting to YouTube...");

      const exchangeCode = async () => {
        try {
          console.log("Sending request to /api/google...");
          const response = await fetch('/api/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'exchangeCode', code })
          });
          const result = await response.json();
          console.log("Exchange result:", result);

          if (result.success && result.tokens) {
            localStorage.setItem("youtube_access_token", result.tokens.access_token);
            toast.success("Successfully connected!", { id: toastId });
            router.push("/dashboard/youtube-manager/dashboard");
          } else {
            toast.error("Failed to exchange code: " + (result.error || "Unknown error"), { id: toastId });
            setProcessing(false);
            exchangeAttempted.current = false;
          }
        } catch (error) {
          console.error("Exchange error:", error);
          toast.error("Authentication error", { id: toastId });
          setProcessing(false);
          exchangeAttempted.current = false;
        }
      };
      exchangeCode();
    }
  }, [searchParams, router, processing]);

  const authenticateWithGoogle = async () => {
    try {
      const response = await fetch('/api/google?action=auth');
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      toast.error("Authentication failed");
    }
  };

  return (
    <UIWrapper classname="flex flex-col h-screen bg-gradient-to-br from-gray-950 via-black to-black">

      <div className="flex-1 w-full max-w-6xl mx-auto px-4 pt-24 pb-8 flex items-center justify-center">
        <div className="rounded-2xl p-8 border border-red-500/20  text-center max-w-md w-full hover:border-red-500/30 transition-colors duration-300">
          <div className="p-4 rounded-2xl w-fit mx-auto mb-4">
            <Youtube className="w-16 h-16 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connect YouTube</h2>
          <p className="text-gray-200 mb-2">
            Connect your YouTube channel to manage videos, view analytics, and more.
          </p>
          <p className="text-neutral-400 mb-2">if already connected, <Link href="/dashboard/youtube-manager/dashboard" className="text-blue-400  hover:underline">click here</Link></p>
          <button
            onClick={authenticateWithGoogle}
            disabled={processing}
            className="w-full px-8 py-3 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 disabled:opacity-50"
          >
            {processing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {processing ? "Connecting..." : "Connect with Google"}
          </button>
        </div>
      </div>
    </UIWrapper>
  );
};

const Page = () => {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
};

export default Page;