"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import AssignmentCard from "./AssignmentCard";
import AnimatedBackground from "./AnimatedBackground";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-6 overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-3xl mx-auto text-center w-full mb-10">
        <h1 className="font-serif text-[44px] sm:text-[72px] leading-[1.05] text-[#0C0C0B] mb-6 flex flex-col items-center justify-center whitespace-normal">
          <div className="overflow-hidden">
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              Create assignments
            </motion.span>
          </div>
          <div className="overflow-hidden">
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              in <em className="italic">seconds</em>.
            </motion.span>
          </div>
        </h1>
        <motion.p 
          className="text-[18px] text-[#6B6B68] max-w-[480px] mx-auto mb-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          ASSASSIN is an AI-powered assignment generator. Give it a subject, difficulty, and format — it does the rest.
        </motion.p>
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link 
            href="/generate" 
            className="w-full sm:w-auto bg-[#4F46E5] text-white px-6 py-3 rounded-md font-medium text-[15px] transition-transform hover:scale-[1.02]"
          >
            Generate Assignment
          </Link>
          <a 
            href="https://github.com/Legharihasham/Assassin" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto border border-[#E5E4E0] text-[#0C0C0B] px-6 py-3 rounded-md font-medium text-[15px] transition-colors hover:bg-[#F5F4F0] bg-white/50 backdrop-blur-sm"
          >
            View on GitHub
          </a>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[520px] pb-10"
      >
        <AssignmentCard />
      </motion.div>
    </section>
  );
}
