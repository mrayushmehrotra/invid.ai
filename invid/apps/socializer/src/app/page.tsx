import Hero from "@/components/myComponents/Hero";
import Footer from "@/components/myComponents/Footer";
import ValueSection from "@/components/myComponents/ValueSection";
import Navbar from "@/components/myComponents/Navbar";

export default function Home() {
  return (
    <div className="">
      <Navbar />
      <Hero />
      <ValueSection />
      <Footer />
    </div>
  );
}
