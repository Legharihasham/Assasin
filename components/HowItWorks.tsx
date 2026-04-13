"use client";
import { motion } from "framer-motion";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Fill-In Your Details",
      body: "Enter your name, SAP ID, section, subject, teacher's name, assignment title & choose word count.",
    },
    {
      num: "02",
      title: "Let ASSASSIN generate",
      body: "The AI builds a structured, original assignment — complete with questions, marks distribution, and instructions.",
    },
    {
      num: "03",
      title: "Get The MS Word File",
      body: "Assassin automatically generates and downloads the assignment file. Every assignment is unique and ready to use.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 max-w-5xl mx-auto">
      <div className="mb-14 text-center md:text-left">
        <p className="text-[11px] tracking-[0.15em] uppercase text-[#9B9B98] font-medium mb-3">HOW IT WORKS</p>
        <h2 className="font-serif text-[44px] text-[#0C0C0B] leading-[1.1]">Three steps to a complete assignment.</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <motion.div 
            key={i}
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
            className="bg-white rounded-xl border border-[#EBEBEA] p-8 shadow-sm flex flex-col"
          >
            <span className="text-[13px] text-[#9B9B98] mb-6 font-medium">{step.num}</span>
            <h3 className="font-serif text-[22px] text-[#0C0C0B] mb-3">{step.title}</h3>
            <p className="text-[15px] text-[#6B6B68] leading-relaxed">{step.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
