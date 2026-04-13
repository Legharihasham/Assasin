"use client";
import { Copy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        scrolled ? "bg-[#FAFAF9]/90 backdrop-blur-md border-b border-[#E5E4E0]" : "bg-transparent"
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-[20px] text-[#0C0C0B]">
          ASSASSIN
        </Link>
        <div className="flex items-center gap-8">
          <div className="hidden sm:flex items-center gap-6 text-[15px] text-[#6B6B68]">
            <a href="#features" className="hover:text-[#0C0C0B] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#0C0C0B] transition-colors">How it works</a>
            <a href="https://github.com/Legharihasham/Assassin" target="_blank" rel="noopener noreferrer" className="hover:text-[#0C0C0B] transition-colors">GitHub</a>
          </div>
          <Link
            href="/generate"
            className="bg-[#4F46E5] text-white px-4 py-2 rounded-md text-[14px] font-medium transition-transform hover:scale-105 active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
