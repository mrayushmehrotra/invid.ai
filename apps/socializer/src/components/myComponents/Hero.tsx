"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProgressIndicator } from "@/components/ui/progress-indicator";
import { useGsapScrollAnimation } from "@/hooks/use-gsap";
import { Hero2 } from "./Hero2";

const Hero = () => {
  return (
    <main>
      <HeroSection />
      <Hero2 />
    </main>
  );
};

export default Hero;

function HeroSection() {
  const badgeRef = useGsapScrollAnimation<HTMLDivElement>({ start: "top 90%" });
  const headingRef = useGsapScrollAnimation<HTMLHeadingElement>({
    start: "top 90%",
  });
  const subtitleRef = useGsapScrollAnimation<HTMLParagraphElement>({
    start: "top 90%",
  });
  const ctaRef = useGsapScrollAnimation<HTMLDivElement>({ start: "top 90%" });
  const statsRef = useGsapScrollAnimation<HTMLDivElement>({ start: "top 90%" });

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center antialiased px-4 pt-24 pb-8 overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-[-200px] left-[10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[10%] w-[400px] h-[400px] bg-pink-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8 text-sm font-medium"
        >
          <span className="huly-badge-dot" />
          <span className="text-gray-300">AI-Powered Content Creation</span>
        </div>

        {/* Main Heading — Huly-style gradient text */}
        <h1
          ref={headingRef}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.05] tracking-tight"
        >
          <span className="huly-gradient-text">Engage audience </span>
          <br />
          <span className="huly-gradient-text-secondary">
            with stunning videos
          </span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Transform your content strategy with AI-powered insights that maximize
          visibility, engagement, and growth across all platforms.
        </p>

        {/* CTA Buttons — Huly-style */}
        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16"
        >
          {/* Huly-style animated border button */}
          <div className="relative inline-flex items-center z-10 border-button-group">
            <div
              className="border-button-light-blur absolute left-1/2 top-1/2 h-[calc(100%+9px)] w-[calc(100%+9px)] -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform"
              style={{ opacity: 1 }}
            >
              <div className="border-button-light relative h-full w-full rounded-full" />
            </div>
            <div
              className="border-button-light-blur absolute left-1/2 top-1/2 h-[calc(100%+9px)] w-[calc(100%+9px)] -translate-x-1/2 -translate-y-1/2 scale-x-[-1] transform rounded-full will-change-transform"
              style={{ opacity: 0 }}
            >
              <div className="border-button-light relative h-full w-full rounded-full" />
            </div>
            <Link
              className="transition-colors duration-200 uppercase font-bold flex items-center justify-center h-10 px-16 text-xs text-black -tracking-[0.015em] relative z-10 overflow-hidden rounded-full border border-white/60 bg-[#d1d1d1] sm:pl-[59px] sm:pr-[52px] group"
              href="/sign-in"
            >
              <div
                className="absolute -z-10 flex w-[204px] items-center justify-center border-button-group-orb"
                style={{ transform: "translateX(105.703px) translateZ(0px)" }}
              >
                <div className="absolute top-1/2 h-[121px] w-[121px] -translate-y-1/2 bg-[radial-gradient(50%_50%_at_50%_50%,#FFFFF5_3.5%,_#FFAA81_26.5%,#FFDA9F_37.5%,rgba(255,170,129,0.50)_49%,rgba(210,106,58,0.00)_92.5%)]" />
                <div className="absolute top-1/2 h-[103px] w-[204px] -translate-y-1/2 bg-[radial-gradient(43.3%_44.23%_at_50%_49.51%,_#FFFFF7_29%,_#FFFACD_48.5%,_#F4D2BF_60.71%,rgba(214,211,210,0.00)_100%)] blur-[5px]" />
              </div>
              <span className="text-[#5A250A]">See in Action</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 9"
                className="h-[9px] w-[17px] text-[#5A250A]"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="m12.495 0 4.495 4.495-4.495 4.495-.99-.99 2.805-2.805H0v-1.4h14.31L11.505.99z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Stats — minimal, clean */}
        <div ref={statsRef} className="flex justify-center gap-12 md:gap-20">
          {[
            { value: "100+", label: "Active Creators" },
            { value: "50K+", label: "Content Generated" },
            { value: "95%", label: "Engagement Boost" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-gray-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Showcase gallery — overlapping image row with mask */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 md:h-2/5 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] overflow-hidden">
        <div className="flex gap-4 showcase-scroll" style={{ transform: "translateX(-28.52%)" }}>
          {[
            "https://images.unsplash.com/photo-1756312148347-611b60723c7a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzN3x8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1757865579201-693dd2080c73?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw2MXx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1756786605218-28f7dd95a493?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMzh8fHxlbnwwfHx8fHw%3D",
            "https://images.unsplash.com/photo-1757519740947-eef07a74c4ab?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxNDh8fHxlbnwwfHx8fHw%3D",
            "https://images.unsplash.com/photo-1757263005786-43d955f07fb1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxNzB8fHxlbnwwfHx8fHw%3D",
            "https://images.unsplash.com/photo-1757207445614-d1e12b8f753e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxODZ8fHxlbnwwfHx8fHw%3D",
            "https://images.unsplash.com/photo-1757269746970-dc477517268f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyMjN8fHxlbnwwfHx8fHw%3D",
            "https://images.unsplash.com/photo-1755119902709-a53513bcbedc?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyNDF8fHxlbnwwfHx8fHw%3D",
          ].map((src, i) => (
            <div
              key={i}
              className="relative aspect-[3/4] h-48 md:h-64 flex-shrink-0"
              style={{ rotate: i % 2 === 0 ? "-2deg" : "5deg" }}
            >
              <img
                alt={`Showcase image ${i + 1}`}
                className="w-full h-full object-cover rounded-2xl shadow-md"
                src={src}
              />
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {[
            "https://images.unsplash.com/photo-1756312148347-611b60723c7a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzN3x8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1757865579201-693dd2080c73?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw2MXx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1756786605218-28f7dd95a493?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMzh8fHxlbnwwfHx8fHw%3D",
            "https://images.unsplash.com/photo-1757519740947-eef07a74c4ab?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxNDh8fHxlbnwwfHx8fHw%3D",
            "https://images.unsplash.com/photo-1757263005786-43d955f07fb1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxNzB8fHxlbnwwfHx8fHw%3D",
            "https://images.unsplash.com/photo-1757207445614-d1e12b8f753e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxODZ8fHxlbnwwfHx8fHw%3D",
            "https://images.unsplash.com/photo-1757269746970-dc477517268f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyMjN8fHxlbnwwfHx8fHw%3D",
            "https://images.unsplash.com/photo-1755119902709-a53513bcbedc?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyNDF8fHxlbnwwfHx8fHw%3D",
          ].map((src, i) => (
            <div
              key={`dup-${i}`}
              className="relative aspect-[3/4] h-48 md:h-64 flex-shrink-0"
              style={{ rotate: i % 2 === 0 ? "-2deg" : "5deg" }}
            >
              <img
                alt={`Showcase image ${i + 9}`}
                className="w-full h-full object-cover rounded-2xl shadow-md"
                src={src}
              />
            </div>
          ))}
        </div>
      </div>

      <ProgressIndicator />
    </section>
  );
}
