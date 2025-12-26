import Footer from "@/components/myComponents/Footer";
import Hero from "@/components/myComponents/Hero";
import Navbar from "@/components/myComponents/Navbar";
import ValueSection from "@/components/myComponents/ValueSection";

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-gray-950 via-black">
      <Navbar />
      <Hero />
      <ValueSection />
      <Footer />
    </div>
  );
}
