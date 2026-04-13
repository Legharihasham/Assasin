"use client";
import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";

type Preset = {
  subject: string;
  type: string;
  difficulty: string;
  content: string;
};

const PRESETS: Preset[] = [
  {
    subject: "Data Structures",
    type: "Problem Set",
    difficulty: "Hard",
    content: "Q1. Implement a min-heap from scratch and write insert() and extractMin() methods. Analyze time complexity.\n\nQ2. Given an array of integers, find the k-th largest element using a heap. Write the algorithm and explain your approach.\n\nQ3. Compare the performance of quicksort and mergesort on nearly-sorted arrays."
  },
  {
    subject: "Business Management",
    type: "Case Study",
    difficulty: "Medium",
    content: "Q1. Analyze the competitive strategy of Apple Inc. using Porter's Five Forces framework.\n\nQ2. Identify two key risks in the company's supply chain and propose mitigation strategies.\n\nQ3. Write a 200-word executive summary of your findings."
  },
  {
    subject: "Classical Mechanics",
    type: "Numerical Problems",
    difficulty: "Medium",
    content: "Q1. A ball is projected at 45° with initial velocity 20 m/s. Find the range and maximum height.\n\nQ2. Derive the equation of motion for a simple pendulum using Newton's second law.\n\nQ3. Two objects collide elastically. If m₁ = 2kg and m₂ = 3kg, find post-collision velocities."
  }
];

export default function AssignmentCard() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % PRESETS.length);
        setFading(false);
      }, 400); // fade out duration
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const preset = PRESETS[index];

  return (
    <div className="bg-white rounded-xl shadow-md border border-[#EBEBEA] w-full overflow-hidden text-left">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#EBEBEA] bg-[#FAFAF9]/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#4F46E5]"></div>
          <span className="text-[13px] font-medium text-[#6B6B68]">Generated Assignment</span>
        </div>
        <button 
          onClick={handleCopy}
          className="text-[#9B9B98] hover:text-[#0C0C0B] transition-colors"
          title="Copy"
        >
          {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
        </button>
      </div>
      <div 
        className={`p-6 transition-opacity duration-[400ms] ease-in-out ${fading ? "opacity-0" : "opacity-100"}`}
      >
        <div className="mb-4">
          <h3 className="text-[16px] font-semibold text-[#0C0C0B]">{preset.subject}</h3>
          <p className="text-[13px] text-[#6B6B68]">
            Type: {preset.type} · Difficulty: {preset.difficulty}
          </p>
        </div>
        <div className="text-[14px] text-[#4A4A48] whitespace-pre-wrap leading-relaxed">
          {preset.content}
        </div>
      </div>
    </div>
  );
}
