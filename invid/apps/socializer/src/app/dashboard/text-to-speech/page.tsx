"use client";
import React, { useState, useRef } from "react";
import { Download, Volume2, Copy, Sparkles, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const Page = () => {
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading("Generating speech with AI...");

    try {
      const response = await fetch('/api/voice-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const result = await response.json();

      if (result.audioFile) {
        setAudioUrl(result.audioFile);
        toast.success("Speech generated successfully!", { id: toastId });
      } else {
        throw new Error(result.error || "Failed to generate speech");
      }
    } catch (error: any) {
      console.error("TTS Error:", error);
      toast.error(error.message || "Failed to generate speech", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!audioUrl) return;

    try {
      // For data URLs, we can directly create a download link
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `murf-speech-${Date.now()}.wav`;
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
            Transform your written content into high-quality, natural-sounding speech powered by Murf.ai.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
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
                className="w-full h-80 bg-white/5 border border-white/20 rounded-xl p-4 
                          text-white placeholder-gray-400 resize-none font-[geist]
                          focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter or paste the text you want to convert to speech...

Your text will be converted using professional AI voices from Murf.ai"
              />

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-400">
                  {text.length} characters
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={!text.trim() || isGenerating}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 
                            hover:from-blue-700 hover:to-cyan-700 text-white font-medium 
                            rounded-xl transition-all duration-300 flex items-center gap-2
                            disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
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
                  <h3 className="text-lg font-bold text-white">Generated Audio</h3>
                </div>

                <div className="space-y-4">
                  {/* Audio Player */}
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    controls
                    className="w-full rounded-lg"
                    style={{
                      filter: 'invert(1) hue-rotate(180deg)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      padding: '8px'
                    }}
                  />

                  {/* Download Button */}
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
            {/* Voice Info */}
            <div className="glass rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <Volume2 className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Voice Settings</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="text-gray-400 mb-1">Voice Model</div>
                  <div className="text-white font-medium">Matthew (FALCON)</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="text-gray-400 mb-1">Language</div>
                  <div className="text-white font-medium">English (US)</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="text-gray-400 mb-1">Quality</div>
                  <div className="text-white font-medium">Professional AI</div>
                </div>
              </div>
            </div>

            {/* Quick Examples */}
            <div className="glass rounded-2xl p-5 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Quick Examples</h3>
              <div className="space-y-2">
                {[
                  "Welcome to our professional text-to-speech service powered by AI technology.",
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

            {/* API Info */}
            <div className="glass rounded-2xl p-5 border border-white/10">
              <div className="text-center">
                <div className="text-gray-400 text-sm mb-2">🎙️ Powered by</div>
                <div className="text-white font-semibold text-lg mb-1">Murf.ai</div>
                <div className="text-gray-500 text-xs">
                  Professional AI Voice Generation
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="glass rounded-2xl p-5 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-3">Features</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <span>High-quality AI voice synthesis</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Downloadable MP3 format</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Natural-sounding speech</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Instant preview & download</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
