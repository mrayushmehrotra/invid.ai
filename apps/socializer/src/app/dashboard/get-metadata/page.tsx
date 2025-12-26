"use client";
import axios from "axios";
import {
  Check,
  Copy,
  FileText,
  Hash,
  Loader2,
  Sparkles,
  Tag,
  Target,
  Type,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import UIWrapper from "@/components/myComponents/UIWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { useCanPerformAction, useUserData } from "@/state";
import { LimitExceededBanner, UsageWarning } from "@/components/ui/limit-exceeded";

// Content type configuration
const CONTENT_TYPES = [
  {
    id: "titles",
    label: "Titles",
    icon: Type,
    color: "purple",
    description: "5 optimized video titles"
  },
  {
    id: "description",
    label: "Description",
    icon: FileText,
    color: "cyan",
    description: "SEO-friendly description"
  },
  {
    id: "hashtags",
    label: "Hashtags",
    icon: Hash,
    color: "green",
    description: "Trending hashtags"
  },
  {
    id: "tags",
    label: "Tags",
    icon: Tag,
    color: "orange",
    description: "YouTube search tags"
  },
] as const;

type ContentType = typeof CONTENT_TYPES[number]["id"];

const Page = () => {
  // Form inputs
  const [videoTopic, setVideoTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [keywords, setKeywords] = useState("");

  // Selected content types to generate
  const [selectedTypes, setSelectedTypes] = useState<Set<ContentType>>(
    new Set(["titles", "description", "hashtags", "tags"])
  );

  // Generated content
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);

  // Loading state
  const [isGenerating, setIsGenerating] = useState(false);

  // Copied state for visual feedback
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Check metadata generation limits
  const metadataLimit = useCanPerformAction("metadataGenerations");
  const { refreshUsage } = useUserData();

  const toggleContentType = (type: ContentType) => {
    setSelectedTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedTypes(new Set(["titles", "description", "hashtags", "tags"]));
  };

  const deselectAll = () => {
    setSelectedTypes(new Set());
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(id);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy");
    }
  };

  const handleGenerate = async () => {
    if (!videoTopic.trim()) {
      toast.error("Please enter a video topic");
      return;
    }

    if (selectedTypes.size === 0) {
      toast.error("Please select at least one content type to generate");
      return;
    }

    // Check if limit is exceeded
    if (!metadataLimit.allowed && !metadataLimit.isUnlimited) {
      toast.error(`Daily limit reached (${metadataLimit.limit} generations/day). Upgrade to Pro for more.`);
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading("Generating your content...");

    try {
      // Build the structure based on selected types
      const structure: Record<string, any> = {};
      if (selectedTypes.has("titles")) structure.titles = [];
      if (selectedTypes.has("description")) structure.description = "";
      if (selectedTypes.has("hashtags")) structure.hashtags = [];
      if (selectedTypes.has("tags")) structure.tags = [];

      const response = await axios.post("/api/gemini", {
        video_topic: videoTopic,
        target_audience: targetAudience || "general audience",
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        structure,
      });

      if (response.data.success) {
        const data = response.data.data;

        // Update state for each selected type
        if (selectedTypes.has("titles") && data.titles) {
          setGeneratedTitles(data.titles);
        }
        if (selectedTypes.has("description") && data.description) {
          setGeneratedDescription(data.description);
        }
        if (selectedTypes.has("hashtags") && data.hashtags) {
          setGeneratedHashtags(data.hashtags);
        }
        if (selectedTypes.has("tags") && data.tags) {
          setGeneratedTags(data.tags);
        }

        toast.success(`Generated ${selectedTypes.size} content type${selectedTypes.size > 1 ? "s" : ""}!`, { id: toastId });
        refreshUsage();
      } else {
        throw new Error(response.data.message || "Failed to generate content");
      }
    } catch (error: any) {
      console.error("Error generating content:", error);
      toast.error(error.message || "Failed to generate content", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors: Record<string, { bg: string; border: string; text: string; hover: string }> = {
      purple: {
        bg: isSelected ? "bg-purple-500/20" : "bg-white/5",
        border: isSelected ? "border-purple-500/50" : "border-white/10",
        text: isSelected ? "text-purple-300" : "text-gray-400",
        hover: "hover:border-purple-500/30",
      },
      cyan: {
        bg: isSelected ? "bg-cyan-500/20" : "bg-white/5",
        border: isSelected ? "border-cyan-500/50" : "border-white/10",
        text: isSelected ? "text-cyan-300" : "text-gray-400",
        hover: "hover:border-cyan-500/30",
      },
      green: {
        bg: isSelected ? "bg-green-500/20" : "bg-white/5",
        border: isSelected ? "border-green-500/50" : "border-white/10",
        text: isSelected ? "text-green-300" : "text-gray-400",
        hover: "hover:border-green-500/30",
      },
      orange: {
        bg: isSelected ? "bg-orange-500/20" : "bg-white/5",
        border: isSelected ? "border-orange-500/50" : "border-white/10",
        text: isSelected ? "text-orange-300" : "text-gray-400",
        hover: "hover:border-orange-500/30",
      },
    };
    return colors[color];
  };

  const limitReached = !metadataLimit.allowed && !metadataLimit.isUnlimited;

  return (
    <UIWrapper classname="min-h-screen bg-gradient-to-br from-gray-950 via-black to-black">
      <div className="w-full max-w-5xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">AI-Powered Metadata Generator</span>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            Generate Viral Title & Description
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Select what you need, enter your topic, and generate everything in one click.
          </p>
        </div>

        {/* Limit Exceeded Banner */}
        {limitReached && !metadataLimit.isLoading && (
          <LimitExceededBanner
            actionName="metadata generations"
            used={metadataLimit.used}
            limit={metadataLimit.limit}
          />
        )}

        {/* Usage Warning (when running low) */}
        {metadataLimit.allowed && metadataLimit.remaining <= 2 && metadataLimit.remaining > 0 && (
          <div className="mb-4">
            <UsageWarning used={metadataLimit.used} limit={metadataLimit.limit} remaining={metadataLimit.remaining} />
          </div>
        )}

        {/* Input Section */}
        <div className="glass rounded-2xl p-6 border border-white/10 mb-8">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video Topic <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={videoTopic}
                onChange={(e) => setVideoTopic(e.target.value)}
                placeholder="e.g., How to learn Python programming"
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white 
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Audience
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., Beginners, Developers, Students"
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white 
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Keywords (comma separated)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., python, coding, tutorial, beginner"
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Content Type Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">
                Select what to generate
              </label>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Select All
                </button>
                <span className="text-gray-600">|</span>
                <button
                  onClick={deselectAll}
                  className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CONTENT_TYPES.map((type) => {
                const isSelected = selectedTypes.has(type.id);
                const colors = getColorClasses(type.color, isSelected);
                const Icon = type.icon;

                return (
                  <button
                    key={type.id}
                    onClick={() => toggleContentType(type.id)}
                    disabled={isGenerating}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300
                              ${colors.bg} ${colors.border} ${colors.hover}
                              disabled:opacity-50 disabled:cursor-not-allowed
                              group cursor-pointer`}
                  >
                    {/* Checkbox indicator */}
                    <div className={`absolute top-3 right-3 w-5 h-5 rounded-md border-2 
                                    flex items-center justify-center transition-all
                                    ${isSelected
                        ? `bg-${type.color}-500 border-${type.color}-500`
                        : "border-gray-500 bg-transparent"
                      }`}
                      style={{
                        backgroundColor: isSelected ? `var(--${type.color}-500, ${type.color === 'purple' ? '#a855f7' : type.color === 'cyan' ? '#06b6d4' : type.color === 'green' ? '#22c55e' : '#f97316'})` : 'transparent',
                        borderColor: isSelected ? 'transparent' : '#6b7280'
                      }}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>

                    <div className="flex flex-col items-start">
                      <Icon className={`w-6 h-6 mb-2 ${colors.text}`} />
                      <span className={`font-medium ${isSelected ? "text-white" : "text-gray-300"}`}>
                        {type.label}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {type.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !videoTopic.trim() || selectedTypes.size === 0 || limitReached}
            className={`w-full py-4 rounded-xl font-semibold text-lg
                      flex items-center justify-center gap-3
                      transition-all duration-300 shadow-lg
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${limitReached
                ? "bg-gray-600 text-gray-400"
                : "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 text-white hover:shadow-purple-500/25"
              }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating {selectedTypes.size} item{selectedTypes.size > 1 ? "s" : ""}...
              </>
            ) : limitReached ? (
              <>
                Daily Limit Reached
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate {selectedTypes.size > 0 ? `${selectedTypes.size} Selected` : "Content"}
              </>
            )}
          </button>

          {selectedTypes.size === 0 && !limitReached && (
            <p className="text-center text-gray-500 text-sm mt-3">
              Select at least one content type above
            </p>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Generated Titles */}
          {(generatedTitles.length > 0 || (isGenerating && selectedTypes.has("titles"))) && (
            <div className="glass rounded-2xl p-6 border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Generated Titles</h3>
              </div>
              {isGenerating && selectedTypes.has("titles") && generatedTitles.length === 0 ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full bg-white/10 rounded-lg" />
                  <Skeleton className="h-12 w-full bg-white/10 rounded-lg" />
                  <Skeleton className="h-12 w-3/4 bg-white/10 rounded-lg" />
                </div>
              ) : (
                <div className="space-y-2">
                  {generatedTitles.map((title, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-3 p-4 rounded-xl bg-white/5 
                                hover:bg-white/10 transition-colors group"
                    >
                      <p className="text-gray-200 flex-1">{title}</p>
                      <button
                        onClick={() => copyToClipboard(title, `title-${index}`)}
                        className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 
                                  text-purple-300 transition-all flex-shrink-0"
                      >
                        {copiedIndex === `title-${index}` ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Generated Description */}
          {(generatedDescription || (isGenerating && selectedTypes.has("description"))) && (
            <div className="glass rounded-2xl p-6 border border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Generated Description</h3>
                </div>
                {generatedDescription && (
                  <button
                    onClick={() => copyToClipboard(generatedDescription, "description")}
                    className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 
                              text-cyan-300 transition-all"
                  >
                    {copiedIndex === "description" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              {isGenerating && selectedTypes.has("description") && !generatedDescription ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-white/10 rounded" />
                  <Skeleton className="h-4 w-full bg-white/10 rounded" />
                  <Skeleton className="h-4 w-3/4 bg-white/10 rounded" />
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
                    {generatedDescription}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Generated Hashtags */}
          {(generatedHashtags.length > 0 || (isGenerating && selectedTypes.has("hashtags"))) && (
            <div className="glass rounded-2xl p-6 border border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-bold text-white">Generated Hashtags</h3>
                </div>
                {generatedHashtags.length > 0 && (
                  <button
                    onClick={() => copyToClipboard(generatedHashtags.join(" "), "hashtags")}
                    className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 
                              text-green-300 transition-all"
                  >
                    {copiedIndex === "hashtags" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              {isGenerating && selectedTypes.has("hashtags") && generatedHashtags.length === 0 ? (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-8 w-24 bg-white/10 rounded-full" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {generatedHashtags.map((hashtag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-300 
                                text-sm font-medium border border-green-500/30"
                    >
                      {hashtag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Generated Tags */}
          {(generatedTags.length > 0 || (isGenerating && selectedTypes.has("tags"))) && (
            <div className="glass rounded-2xl p-6 border border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-red-500/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-bold text-white">Generated Tags</h3>
                  {generatedTags.length > 0 && (
                    <span className="text-xs text-gray-500">
                      ({generatedTags.join(", ").length} / 500 chars)
                    </span>
                  )}
                </div>
                {generatedTags.length > 0 && (
                  <button
                    onClick={() => copyToClipboard(generatedTags.join(", "), "tags")}
                    className="p-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 
                              text-orange-300 transition-all"
                  >
                    {copiedIndex === "tags" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              {isGenerating && selectedTypes.has("tags") && generatedTags.length === 0 ? (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Skeleton key={i} className="h-7 w-20 bg-white/10 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {generatedTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-lg bg-orange-500/20 text-orange-300 
                                text-sm border border-orange-500/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Empty State */}
        {!generatedTitles.length && !generatedDescription && !generatedHashtags.length && !generatedTags.length && !isGenerating && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
              <Target className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-400 mb-2">No content generated yet</h3>
            <p className="text-gray-500">Select your content types, enter a topic, and click Generate</p>
          </div>
        )}
      </div>
    </UIWrapper>
  );
};

export default Page;
