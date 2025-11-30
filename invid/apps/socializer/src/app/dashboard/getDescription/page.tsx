"use client";
import React, { useState, useEffect, useRef } from "react";
import { Send, Copy, FileText, Sparkles, Search, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import toast from "react-hot-toast";

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
        prompt: `As an expert content strategist and SEO specialist, create a comprehensive description for the following content topic: "${input}"

Create a detailed, SEO-optimized description that includes:

**Structure Requirements:**
1. **Hook (First 125 characters)**: Compelling opening that appears in search previews
2. **Main Content**: Detailed explanation of what viewers will learn/gain
3. **Key Benefits**: Clear value propositions and outcomes
4. **SEO Keywords**: Naturally integrated relevant keywords
5. **Call-to-Action**: Engagement prompts (like, subscribe, comment)
6. **Timestamps** (if applicable): For longer content with multiple sections
7. **Social Links**: Placeholder for social media handles
8. **Hashtags**: 3-5 relevant hashtags at the end

**Optimization Focus:**
- Include primary and secondary keywords naturally
- Write for both humans and search algorithms  
- Use emotional triggers and benefit-focused language
- Include questions to encourage engagement
- Optimize for YouTube, social media, and search engines
- Keep the hook under 125 characters for search preview optimization
- Use line breaks for better readability

**Tone**: Professional yet engaging, matching the content topic
**Length**: 150-300 words (optimal for most platforms)

The description should maximize discoverability, engagement, and conversion while providing genuine value to the audience.`,
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
    <UIWrapper classname="flex flex-col h-screen bg-gradient-to-br from-gray-950 via-black to-black">
      {/* Welcome Message */}
      {messages.length === 0 && !loading && (
        <div className="flex-1 flex items-center justify-center px-4 pt-24">
          <div className="text-center max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Search className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">AI-Powered SEO Descriptions</span>
            </div>
            <h2 className="text-3xl font-bold mb-4 gradient-text">
              Generate Compelling Descriptions
            </h2>
            <p className="text-gray-300 mb-8">
              Describe your content topic and get a comprehensive, SEO-optimized description
              designed to maximize visibility, engagement, and conversions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="glass p-4 rounded-xl">
                <Search className="w-5 h-5 text-green-400 mb-2 mx-auto" />
                <div className="font-medium text-white mb-1">SEO Optimized</div>
                <div className="text-gray-400">Keyword-rich content</div>
              </div>
              <div className="glass p-4 rounded-xl">
                <FileText className="w-5 h-5 text-blue-400 mb-2 mx-auto" />
                <div className="font-medium text-white mb-1">Structured</div>
                <div className="text-gray-400">Professional format</div>
              </div>
              <div className="glass p-4 rounded-xl">
                <Sparkles className="w-5 h-5 text-purple-400 mb-2 mx-auto" />
                <div className="font-medium text-white mb-1">Engaging</div>
                <div className="text-gray-400">Conversion focused</div>
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
            className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
          >
            <div
              className={`relative group max-w-[85%] ${msg.sender === "user"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "glass text-white"
                } p-6 rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className={`whitespace-pre-wrap text-sm leading-relaxed ${msg.sender === "bot" ? "font-[geist]" : ""
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
                <FileText className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="text-sm text-gray-400">Generating description...</span>
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
                placeholder="Describe your content topic (e.g., 'productivity tips for remote workers', 'beginner photography tutorial')..."
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