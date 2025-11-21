"use client";
import React, { useState, useEffect, useRef } from "react";
import { Send, Copy, Type, Sparkles, Target, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import toast from "react-hot-toast";
import { SecondNav } from "@/components/myComponents/nav2";
import UIWrapper from "@/components/myComponents/UIWrapper";
import Link from "next/link";

const Page = () => {
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("/api/gemini", {
        prompt: `As an expert content strategist and SEO specialist, create compelling titles for the following content topic: "${input}"

Generate 5 different title variations that are:

1. **SEO-Optimized**: Include relevant keywords that people search for
2. **Click-Worthy**: Use psychological triggers and curiosity gaps
3. **Platform-Specific**: Optimized for YouTube, social media, and search engines
4. **Engaging**: Use power words, numbers, and emotional hooks
5. **Concise**: Keep under 60 characters when possible for optimal display

Title Types to Include:
- **How-To/Tutorial**: Step-by-step guidance format
- **Listicle**: Numbered list format (e.g., "5 Ways to...")  
- **Question**: Curiosity-driven question format
- **Benefit-Focused**: Clear value proposition
- **Urgency/Trending**: Time-sensitive or trending angle

For each title, briefly explain why it would perform well (keywords, psychological triggers, etc.).

Focus on titles that will:
- Maximize click-through rates
- Improve search rankings
- Increase engagement
- Appeal to the target audience
- Stand out in crowded feeds`,
      });

      const botMessage = {
        text: response.data.success
          ? response.data.data
          : "⚠️ Failed to fetch response. Try again.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [
        ...prev,
        { text: "❌ Error processing request.", sender: "bot" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard ✅");
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <UIWrapper classname="flex flex-col h-screen">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full flex items-center justify-between z-20 glass border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <ArrowLeft className="w-6 h-6 text-purple-400" />
          </div>
          </Link>
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Type className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">Title Generator</h1>
            <p className="text-sm text-gray-400">Create SEO-optimized, click-worthy titles</p>
          </div>
        </div>
        <SecondNav />
      </div>

      {/* Welcome Message */}
      {messages.length === 0 && !loading && (
        <div className="flex-1 flex items-center justify-center px-4 pt-24">
          <div className="text-center max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">AI-Powered Title Optimization</span>
            </div>
            <h2 className="text-3xl font-bold mb-4 gradient-text">
              Generate Viral Titles
            </h2>
            <p className="text-gray-300 mb-8">
              Describe your content topic and get multiple SEO-optimized title variations 
              designed to maximize clicks, engagement, and search rankings.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="glass p-4 rounded-xl">
                <Sparkles className="w-5 h-5 text-purple-400 mb-2 mx-auto" />
                <div className="font-medium text-white mb-1">SEO Optimized</div>
                <div className="text-gray-400">Keyword-rich titles</div>
              </div>
              <div className="glass p-4 rounded-xl">
                <Type className="w-5 h-5 text-blue-400 mb-2 mx-auto" />
                <div className="font-medium text-white mb-1">Click-Worthy</div>
                <div className="text-gray-400">Psychological triggers</div>
              </div>
              <div className="glass p-4 rounded-xl">
                <Target className="w-5 h-5 text-green-400 mb-2 mx-auto" />
                <div className="font-medium text-white mb-1">Multi-Format</div>
                <div className="text-gray-400">Various title styles</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 overflow-y-auto pt-6 space-y-6 pb-32">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex w-full ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`relative group max-w-[85%] ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "glass text-white"
              } p-6 rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className={`whitespace-pre-wrap text-sm leading-relaxed ${
                msg.sender === "bot" ? "font-[geist]" : ""
              }`}>
                {msg.text}
              </div>
              
              <button
                onClick={() => copyToClipboard(msg.text)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 
                          transition-opacity duration-200 p-2 rounded-lg hover:bg-white/10"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Loading animation */}
        {loading && (
          <div className="flex justify-start">
            <div className="glass p-6 rounded-2xl max-w-[70%] space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="text-sm text-gray-400">Generating titles...</span>
              </div>
              <Skeleton className="h-4 w-full bg-gray-700 rounded" />
              <Skeleton className="h-4 w-3/4 bg-gray-700 rounded" />
              <Skeleton className="h-4 w-5/6 bg-gray-700 rounded" />
            </div>
          </div>
        )}
        <div ref={chatRef}></div>
      </div>

      {/* Input Box */}
      <div className="fixed bottom-0 left-0 w-full glass border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="w-full bg-white/5 border border-white/20 text-white px-4 py-3 
                          rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 
                          focus:border-transparent resize-none min-h-[50px] max-h-32"
                placeholder="Describe your content topic (e.g., 'beginner guitar tutorial', 'healthy breakfast recipes')..."
                rows={1}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 
                        hover:from-purple-700 hover:to-pink-700 text-white shadow-lg 
                        hover:shadow-purple-500/25 transition-all duration-300 
                        disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Shift + Enter for new line
          </div>
        </div>
      </div>
    </UIWrapper>
  );
};

export default Page;