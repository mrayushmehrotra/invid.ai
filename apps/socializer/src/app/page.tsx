"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import Footer from "@/components/myComponents/Footer";
import Hero from "@/components/myComponents/Hero";
import Navbar from "@/components/myComponents/Navbar";
import ValueSection from "@/components/myComponents/ValueSection";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate background orbs based on scroll
    const orbs = [orb1Ref.current, orb2Ref.current, orb3Ref.current];

    orbs.forEach((orb, i) => {
      if (!orb) return;
      gsap.to(orb, {
        y: (i + 1) * -150,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        t.kill();
      });
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black overflow-hidden">
      {/* Animated background orbs - GSAP parallax */}
      <div
        ref={orb1Ref}
        className="glow-orb w-[600px] h-[600px] bg-purple-600 top-[-200px] left-[-200px]"
      />
      <div
        ref={orb2Ref}
        className="glow-orb w-[500px] h-[500px] bg-pink-600 top-[40%] right-[-150px]"
        style={{ animationDelay: "2s" }}
      />
      <div
        ref={orb3Ref}
        className="glow-orb w-[400px] h-[400px] bg-indigo-600 bottom-[-100px] left-[30%]"
        style={{ animationDelay: "4s" }}
      />

      {/* Noise texture overlay */}
      <div className="noise-overlay fixed inset-0 pointer-events-none z-[1]" />

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <div className="section-divider" />
        <ValueSection />
        <Footer />
      </div>
    </div>
  );
}
