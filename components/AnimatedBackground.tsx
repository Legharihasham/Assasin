"use client";
import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Ambient Glowing Orbs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[-5%] left-[10%] w-[300px] h-[300px] rounded-full bg-[#4F46E5]/30 blur-[80px] sm:w-[400px] sm:h-[400px]"
      />
      
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
          delay: 1,
        }}
        className="absolute top-[40%] right-[5%] w-[350px] h-[350px] rounded-full bg-[#0EA5E9]/30 blur-[100px] sm:w-[500px] sm:h-[500px]"
      />
      
      <motion.div
        animate={{
          x: [0, 50, -50, 0],
          y: [0, 100, 50, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
          delay: 2,
        }}
        className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] rounded-full bg-[#EC4899]/25 blur-[120px] sm:w-[600px] sm:h-[600px]"
      />
    </div>
  );
}
