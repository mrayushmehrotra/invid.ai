"use client";
import {
  ChevronDown,
  Copy,
  Download,
  Loader2,
  Sparkles,
  User,
  Volume2,
} from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useCanPerformAction, useUserData } from "@/state";
import {
  LimitExceededBanner,
  UsageWarning,
} from "@/components/ui/limit-exceeded";

// Murf.ai Voice Library - organized by category
// Voice IDs are just the name (e.g., "Marcus", "Natalie") without locale prefix
const MURF_VOICES = {
  "English (US) - Male": [
    {
      id: "Marcus",
      name: "Marcus",
      style: "Conversational",
      model: "GEN2",
      locale: "en-US",
    },
    {
      id: "Ken",
      name: "Ken",
      style: "Professional",
      model: "GEN2",
      locale: "en-US",
    },
    {
      id: "Clint",
      name: "Clint",
      style: "Narration",
      model: "GEN2",
      locale: "en-US",
    },
    {
      id: "Terrell",
      name: "Terrell",
      style: "Conversational",
      model: "GEN2",
      locale: "en-US",
    },
    {
      id: "Miles",
      name: "Miles",
      style: "Casual",
      model: "GEN2",
      locale: "en-US",
    },
    {
      id: "Cooper",
      name: "Cooper",
      style: "Professional",
      model: "GEN2",
      locale: "en-US",
    },
    {
      id: "Wayne",
      name: "Wayne",
      style: "Friendly",
      model: "GEN2",
      locale: "en-US",
    },
    {
      id: "Ryan",
      name: "Ryan",
      style: "Clear",
      model: "GEN2",
      locale: "en-US",
    },
    {
      id: "Caleb",
      name: "Caleb",
      style: "Young",
      model: "GEN2",
      locale: "en-US",
    },
    {
      id: "Daniel",
      name: "Daniel",
      style: "Warm",
      model: "GEN2",
      locale: "en-US",
    },
    {
      id: "Matthew",
      name: "Matthew",
      style: "Natural",
      model: "FALCON",
      locale: "en-US",
    },
  ],
  "English (US) - Female": [
    {
      id: "Natalie",
      name: "Natalie",
      style: "Professional",
      model: "GEN2",
      locale: "en-US",
    },
    {
      id: "Julia",
      name: "Julia",
      style: "Friendly",
      model: "GEN2",
      locale: "en-US",
    },
    {
      id: "Alicia",
      name: "Alicia",
      style: "Conversational",
      model: "GEN2",
      locale: "en-US",
    },
    {
      id: "Daisy",
      name: "Daisy",
      style: "Casual",
      model: "GEN2",
      locale: "en-US",
    },
    {
      id: "Samantha",
      name: "Samantha",
      style: "Warm",
      model: "GEN2",
      locale: "en-US",
    },
    {
      id: "Michelle",
      name: "Michelle",
      style: "Clear",
      model: "GEN2",
      locale: "en-US",
    },
    {
      id: "Claire",
      name: "Claire",
      style: "Professional",
      model: "GEN2",
      locale: "en-US",
    },
    {
      id: "Molly",
      name: "Molly",
      style: "Young",
      model: "GEN2",
      locale: "en-US",
    },
    {
      id: "Ariana",
      name: "Ariana",
      style: "Energetic",
      model: "GEN2",
      locale: "en-US",
    },
    {
      id: "Phoebe",
      name: "Phoebe",
      style: "Friendly",
      model: "GEN2",
      locale: "en-US",
    },
  ],
  "English (UK)": [
    {
      id: "Theo",
      name: "Theo",
      style: "British Male",
      model: "GEN2",
      locale: "en-GB",
    },
    {
      id: "Freddie",
      name: "Freddie",
      style: "British Male",
      model: "GEN2",
      locale: "en-GB",
    },
    {
      id: "Harrison",
      name: "Harrison",
      style: "Professional",
      model: "GEN2",
      locale: "en-GB",
    },
    { id: "Hugo", name: "Hugo", style: "Warm", model: "GEN2", locale: "en-GB" },
    {
      id: "Peter",
      name: "Peter",
      style: "Clear",
      model: "GEN2",
      locale: "en-GB",
    },
    {
      id: "Ruby",
      name: "Ruby",
      style: "British Female",
      model: "GEN2",
      locale: "en-GB",
    },
    {
      id: "Hazel",
      name: "Hazel",
      style: "British Female",
      model: "GEN2",
      locale: "en-GB",
    },
    {
      id: "Juliet",
      name: "Juliet",
      style: "Professional",
      model: "GEN2",
      locale: "en-GB",
    },
    {
      id: "Pearl",
      name: "Pearl",
      style: "Warm",
      model: "GEN2",
      locale: "en-GB",
    },
    {
      id: "Katie",
      name: "Katie",
      style: "Friendly",
      model: "GEN2",
      locale: "en-GB",
    },
  ],
  "English (India)": [
    {
      id: "Aarav",
      name: "Aarav",
      style: "Indian Male",
      model: "GEN2",
      locale: "en-IN",
    },
    {
      id: "Rohan",
      name: "Rohan",
      style: "Professional",
      model: "GEN2",
      locale: "en-IN",
    },
    {
      id: "Eashwar",
      name: "Eashwar",
      style: "Clear",
      model: "GEN2",
      locale: "en-IN",
    },
    {
      id: "Abhik",
      name: "Abhik",
      style: "Conversational",
      model: "GEN2",
      locale: "en-IN",
    },
    {
      id: "Arohi",
      name: "Arohi",
      style: "Indian Female",
      model: "GEN2",
      locale: "en-IN",
    },
    {
      id: "Alia",
      name: "Alia",
      style: "Professional",
      model: "GEN2",
      locale: "en-IN",
    },
    {
      id: "Priya",
      name: "Priya",
      style: "Warm",
      model: "GEN2",
      locale: "en-IN",
    },
    {
      id: "Isha",
      name: "Isha",
      style: "Natural",
      model: "GEN2",
      locale: "en-IN",
    },
  ],
  "English (Australia)": [
    {
      id: "Jimm",
      name: "Jimm",
      style: "Australian Male",
      model: "GEN2",
      locale: "en-AU",
    },
    {
      id: "Mitch",
      name: "Mitch",
      style: "Casual",
      model: "GEN2",
      locale: "en-AU",
    },
    {
      id: "Leyton",
      name: "Leyton",
      style: "Professional",
      model: "GEN2",
      locale: "en-AU",
    },
    {
      id: "Ashton",
      name: "Ashton",
      style: "Friendly",
      model: "GEN2",
      locale: "en-AU",
    },
    {
      id: "Kylie",
      name: "Kylie",
      style: "Australian Female",
      model: "GEN2",
      locale: "en-AU",
    },
    {
      id: "Harper",
      name: "Harper",
      style: "Natural",
      model: "GEN2",
      locale: "en-AU",
    },
    {
      id: "Evelyn",
      name: "Evelyn",
      style: "Warm",
      model: "GEN2",
      locale: "en-AU",
    },
    {
      id: "Ivy",
      name: "Ivy",
      style: "Professional",
      model: "GEN2",
      locale: "en-AU",
    },
  ],
  "Spanish (Mexico)": [
    {
      id: "Carlos",
      name: "Carlos",
      style: "Spanish Male",
      model: "GEN2",
      locale: "es-MX",
    },
    {
      id: "Alejandro",
      name: "Alejandro",
      style: "Professional",
      model: "GEN2",
      locale: "es-MX",
    },
    {
      id: "Valeria",
      name: "Valeria",
      style: "Spanish Female",
      model: "GEN2",
      locale: "es-MX",
    },
    {
      id: "Luisa",
      name: "Luisa",
      style: "Natural",
      model: "GEN2",
      locale: "es-MX",
    },
  ],
  "French (France)": [
    {
      id: "Guillaume",
      name: "Guillaume",
      style: "French Male",
      model: "GEN2",
      locale: "fr-FR",
    },
    {
      id: "Maxime",
      name: "Maxime",
      style: "Professional",
      model: "GEN2",
      locale: "fr-FR",
    },
    {
      id: "Axel",
      name: "Axel",
      style: "Casual",
      model: "GEN2",
      locale: "fr-FR",
    },
    {
      id: "Louis",
      name: "Louis",
      style: "Warm",
      model: "GEN2",
      locale: "fr-FR",
    },
    {
      id: "Adélie",
      name: "Adélie",
      style: "French Female",
      model: "GEN2",
      locale: "fr-FR",
    },
    {
      id: "Justine",
      name: "Justine",
      style: "Professional",
      model: "GEN2",
      locale: "fr-FR",
    },
    {
      id: "Louise",
      name: "Louise",
      style: "Natural",
      model: "GEN2",
      locale: "fr-FR",
    },
  ],
  German: [
    {
      id: "Matthias",
      name: "Matthias",
      style: "German Male",
      model: "GEN2",
      locale: "de-DE",
    },
    {
      id: "Björn",
      name: "Björn",
      style: "Professional",
      model: "GEN2",
      locale: "de-DE",
    },
    {
      id: "Ralf",
      name: "Ralf",
      style: "Casual",
      model: "GEN2",
      locale: "de-DE",
    },
    {
      id: "Lia",
      name: "Lia",
      style: "German Female",
      model: "GEN2",
      locale: "de-DE",
    },
    {
      id: "Erna",
      name: "Erna",
      style: "Professional",
      model: "GEN2",
      locale: "de-DE",
    },
    {
      id: "Lara",
      name: "Lara",
      style: "Natural",
      model: "GEN2",
      locale: "de-DE",
    },
    {
      id: "Josephine",
      name: "Josephine",
      style: "Warm",
      model: "GEN2",
      locale: "de-DE",
    },
  ],
  "Portuguese (Brazil)": [
    {
      id: "Benício",
      name: "Benício",
      style: "Brazilian Male",
      model: "GEN2",
      locale: "pt-BR",
    },
    {
      id: "Isadora",
      name: "Isadora",
      style: "Brazilian Female",
      model: "GEN2",
      locale: "pt-BR",
    },
  ],
  Italian: [
    {
      id: "Giorgio",
      name: "Giorgio",
      style: "Italian Male",
      model: "GEN2",
      locale: "it-IT",
    },
    {
      id: "Elvira",
      name: "Elvira",
      style: "Italian Female",
      model: "GEN2",
      locale: "it-IT",
    },
    {
      id: "Greta",
      name: "Greta",
      style: "Professional",
      model: "GEN2",
      locale: "it-IT",
    },
  ],
};

type VoiceOption = {
  id: string;
  name: string;
  style: string;
  model: string;
  locale: string;
};

const Page = () => {
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(
    MURF_VOICES["English (US) - Male"][10], // Default to Matthew (FALCON)
  );
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Check TTS usage limits
  const ttsLimit = useCanPerformAction("ttsGenerations");
  const { refreshUsage } = useUserData();

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text");
      return;
    }

    // Check if limit is exceeded
    if (!ttsLimit.allowed && !ttsLimit.isUnlimited) {
      toast.error(
        `Daily limit reached (${ttsLimit.limit} generations/day). Upgrade to Pro for more.`,
      );
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading(
      `Generating speech with ${selectedVoice.name}...`,
    );

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voiceId: selectedVoice.id,
          model: selectedVoice.model,
          locale: selectedVoice.locale,
        }),
      });

      const result = await response.json();

      if (result.audioFile) {
        setAudioUrl(result.audioFile);
        toast.success("Speech generated successfully!", { id: toastId });
        // Refresh usage after successful generation
        refreshUsage();
      } else if (result.limitReached) {
        toast.error(result.error || "Daily limit reached", { id: toastId });
        refreshUsage();
      } else {
        throw new Error(result.error || "Failed to generate speech");
      }
    } catch (error: any) {
      console.error("TTS Error:", error);
      toast.error(error.message || "Failed to generate speech", {
        id: toastId,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!audioUrl) return;

    try {
      const a = document.createElement("a");
      a.href = audioUrl;
      a.download = `${selectedVoice.name.toLowerCase()}-speech-${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Audio downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download audio");
    }
  };

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      toast.success("Text copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-black">
      {/* Header Section */}
      <div className="pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4 text-sm font-medium">
            <Volume2 className="w-4 h-4 text-blue-400" />
            <span className="gradient-text">AI Text to Speech</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
            <span className="bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
              Convert Text to
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Professional Speech
            </span>
          </h1>

          <p className="text-lg text-gray-300 max-w-2xl mb-6">
            Transform your written content into high-quality, natural-sounding
            speech with 60+ voices in 20+ languages.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Limit Exceeded Banner */}
        {!ttsLimit.allowed && !ttsLimit.isLoading && (
          <LimitExceededBanner
            actionName="TTS generations"
            used={ttsLimit.used}
            limit={ttsLimit.limit}
          />
        )}

        {/* Usage Warning (when running low) */}
        {ttsLimit.allowed &&
          ttsLimit.remaining <= 2 &&
          ttsLimit.remaining > 0 && (
            <div className="mb-4">
              <UsageWarning
                used={ttsLimit.used}
                limit={ttsLimit.limit}
                remaining={ttsLimit.remaining}
              />
            </div>
          )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Text Input Section - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Text Input Card */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Your Text</h2>
                </div>
                <button
                  onClick={copyToClipboard}
                  disabled={!text.trim()}
                  className="p-2 glass rounded-lg hover:bg-white/10 transition-all duration-300 disabled:opacity-50"
                  title="Copy text"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-64 bg-white/5 border border-white/20 rounded-xl p-4 
                          text-white placeholder-gray-400 resize-none font-[geist]
                          focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="if you are happy and you knew it, clap your hands... etc, press Tab to fill this line"
              />

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-400">
                  {text.length} characters
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={
                    !text.trim() ||
                    isGenerating ||
                    (!ttsLimit.allowed && !ttsLimit.isUnlimited)
                  }
                  className={`px-8 py-3 text-white font-medium 
                            rounded-xl transition-all duration-300 flex items-center gap-2
                            disabled:opacity-50 disabled:cursor-not-allowed shadow-lg
                            ${
                              !ttsLimit.allowed && !ttsLimit.isUnlimited
                                ? "bg-gray-600 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 hover:shadow-blue-500/25"
                            }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : !ttsLimit.allowed && !ttsLimit.isUnlimited ? (
                    <>Limit Reached</>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Speech
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Audio Player Card */}
            {audioUrl && (
              <div className="glass rounded-2xl p-6 border border-white/10 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                    <Volume2 className="w-4 h-4 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Generated Audio
                  </h3>
                  <span className="text-sm text-gray-400">
                    Voice: {selectedVoice.name}
                  </span>
                </div>

                <div className="space-y-4">
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    controls
                    className="w-full rounded-lg"
                    style={{
                      filter: "invert(1) hue-rotate(180deg)",
                      background: "rgba(255, 255, 255, 0.05)",
                      borderRadius: "12px",
                      padding: "8px",
                    }}
                  />

                  <button
                    onClick={handleDownload}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 
                              hover:from-green-700 hover:to-emerald-700 text-white font-medium 
                              rounded-xl transition-all duration-300 flex items-center justify-center gap-2
                              shadow-lg hover:shadow-green-500/25"
                  >
                    <Download className="w-5 h-5" />
                    Download Audio
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Controls Sidebar - Takes 1 column */}
          <div className="space-y-6">
            {/* Voice Selection */}
            <div className="glass rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <User className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Select Voice</h3>
              </div>

              {/* Selected Voice Display */}
              <button
                onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 
                          border border-purple-500/30 hover:border-purple-500/50 
                          transition-all duration-300 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">
                      {selectedVoice.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {selectedVoice.style} • {selectedVoice.model}
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${isVoiceDropdownOpen ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {/* Voice Dropdown */}
              {isVoiceDropdownOpen && (
                <div
                  className="mt-3 max-h-80 overflow-y-auto rounded-xl bg-black/80 border border-white/10 
                              divide-y divide-white/5"
                >
                  {Object.entries(MURF_VOICES).map(([category, voices]) => (
                    <div key={category}>
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white/5 sticky top-0">
                        {category}
                      </div>
                      {voices.map((voice) => (
                        <button
                          key={voice.id}
                          onClick={() => {
                            setSelectedVoice(voice);
                            setIsVoiceDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 text-left hover:bg-white/10 transition-colors flex items-center justify-between
                            ${selectedVoice.id === voice.id ? "bg-purple-500/20" : ""}`}
                        >
                          <div>
                            <div className="text-sm font-medium text-white">
                              {voice.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {voice.style}
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full 
                            ${
                              voice.model === "FALCON"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-purple-500/20 text-purple-400"
                            }`}
                          >
                            {voice.model}
                          </span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Current Voice Info */}
              <div className="mt-4 space-y-2 text-sm">
                <div className="p-3 rounded-lg bg-white/5 flex justify-between">
                  <span className="text-gray-400">Model</span>
                  <span
                    className={`font-medium ${selectedVoice.model === "FALCON" ? "text-blue-400" : "text-purple-400"}`}
                  >
                    {selectedVoice.model}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white/5 flex justify-between">
                  <span className="text-gray-400">Locale</span>
                  <span className="text-white font-medium">
                    {selectedVoice.locale}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white/5 flex justify-between">
                  <span className="text-gray-400">Style</span>
                  <span className="text-white font-medium">
                    {selectedVoice.style}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Examples */}
            <div className="glass rounded-2xl p-5 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">
                Quick Examples
              </h3>
              <div className="space-y-2">
                {[
                  "If you are happy and you knew it, clap your hands... ",
                  "Hi, i'm raymond from invid.ai, i'm a voice model",
                  "Transform your content into natural, engaging speech with just one click.",
                  "Perfect for podcasts, videos, presentations, and more!",
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setText(example)}
                    className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 
                              transition-all duration-300 text-sm text-gray-300 border border-white/10"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

