import Hero from "@/components/myComponents/Hero";
import Footer from "@/components/myComponents/Footer";
import ValueSection from "@/components/myComponents/ValueSection";
import Navbar from "@/components/myComponents/Navbar";

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
