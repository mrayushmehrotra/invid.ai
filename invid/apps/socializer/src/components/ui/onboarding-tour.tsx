"use client";
import { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import Image from "next/image";

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
}

const tourSteps: TourStep[] = [
  {
    target: "[data-tour='dashboard-cards']",
    title: "Choose Your Content Type",
    content:
      "Start by selecting what type of content you want to create. Each tool is optimized for different social media needs.",
    position: "bottom",
  },
  {
    target: "[data-tour='usage-tracker']",
    title: "Track Your Usage",
    content:
      "Monitor your daily usage and see when it resets. Upgrade for unlimited access.",
    position: "left",
  },
];

export const OnboardingTour = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenTour");
    if (!hasSeenTour) {
      setTimeout(() => setIsActive(true), 2000);
    }
  }, []);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    setIsActive(false);
    localStorage.setItem("hasSeenTour", "true");
  };

  if (!isActive) return null;

  const step = tourSteps[currentStep];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={completeTour} />
      TODO: improve the onboarding with images and improve the style/text
      (0.mail)
      <Image
        src={"/onboarding-image-1.png"}
        fill
        objectFit="cover"
        alt={"onboarding-image"}
      />
      <div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     glass rounded-2xl p-6 max-w-md z-50 border border-white/20"
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-white">{step.title}</h3>
          <button
            onClick={completeTour}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-300 mb-6">{step.content}</p>

        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? "bg-purple-500" : "bg-gray-600"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="px-4 py-2 glass rounded-lg text-white hover:bg-white/10 
                          transition-all duration-300 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 
                        rounded-lg text-white hover:from-purple-700 hover:to-pink-700 
                        transition-all duration-300 flex items-center gap-2"
            >
              {currentStep === tourSteps.length - 1 ? "Finish" : "Next"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

