import Image from "next/image";
import React from "react";
import { Play, Sparkles, TrendingUp } from "lucide-react";

const ValueSection = () => {
  return (
    <section className="w-full py-20 md:py-32" id="demo">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 text-sm font-medium">
            <Play className="w-4 h-4 text-green-400" />
            <span className="gradient-text">Live Demo</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              See Real Results from
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              Our Community
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Discover how content creators are transforming their social media presence 
            with our AI-powered tools and achieving remarkable growth.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            <div className="flex items-center gap-2 px-4 py-2 glass rounded-full">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">300% Average Growth</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 glass rounded-full">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">AI-Generated Content</span>
            </div>
          </div>
        </div>

        {/* Demo Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Content */}
            <div className="space-y-8 animate-slide-up">
              <div className="glass rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold gradient-text mb-4">
                  Before vs After Results
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Average Views</span>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">1.2K</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-green-400 font-bold">15.8K</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Engagement Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">2.1%</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-green-400 font-bold">8.7%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Follower Growth</span>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">+50/month</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-green-400 font-bold">+1.2K/month</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-8 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-3">
                  What Our Users Say
                </h4>
                <blockquote className="text-gray-300 italic">
                  &ldquo;invid.ai transformed my content strategy completely. My engagement 
                  increased by 400% in just 2 months!&rdquo;
                </blockquote>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 
                                flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div>
                    <div className="text-white font-medium">Sarah Johnson</div>
                    <div className="text-gray-400 text-sm">Content Creator, 50K followers</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Phone Mockups */}
            <div className="relative">
              <div className="flex gap-6 justify-center items-center">
                {["/confi_img.jpg", "/confi2_img.jpg"].map((item, index) => (
                  <div
                    key={item}
                    className={`relative shrink-0 animate-slide-up
                               ${index === 0 ? 'z-10' : 'z-0 -ml-8'} 
                               h-[500px] w-[250px] 
                               border-[8px] border-gray-800 rounded-[40px] 
                               shadow-2xl hover:shadow-purple-500/20 
                               transition-all duration-500 hover:scale-105`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    {/* Screen Bezel */}
                    <div className="absolute inset-0 rounded-[32px] overflow-hidden bg-black">
                      <Image
                        draggable={false}
                        src={item}
                        alt="App demonstration"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 250px"
                      />
                      
                      {/* Screen Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
                    </div>

                    {/* Phone Details */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 
                                  w-16 h-1 bg-gray-600 rounded-full" />
                    <div className="absolute top-2 right-4 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-8 -right-8 glass rounded-2xl p-4 border border-white/10 
                            animate-pulse">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-white font-medium">+300% Growth</span>
                </div>
              </div>

              <div className="absolute -bottom-8 -left-8 glass rounded-2xl p-4 border border-white/10 
                            animate-pulse" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-white font-medium">AI Optimized</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 animate-fade-in">
          <div className="glass rounded-2xl p-8 max-w-2xl mx-auto border border-white/10">
            <h3 className="text-2xl font-bold gradient-text mb-4">
              Ready to Transform Your Content?
            </h3>
            <p className="text-gray-300 mb-6">
              Join thousands of creators who are already growing their audience with our AI tools.
            </p>
            <button className="px-8 py-4 rounded-2xl text-white font-semibold text-lg
                             bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 
                             shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 
                             transition-all duration-300">
              Start Creating Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueSection;