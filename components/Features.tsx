"use client";
import { motion } from "framer-motion";

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 max-w-5xl mx-auto">
      <div className="mb-14 text-center md:text-left">
        <p className="text-[11px] tracking-[0.15em] uppercase text-[#9B9B98] font-medium mb-3">FEATURES</p>
        <h2 className="font-serif text-[44px] text-[#0C0C0B] leading-[1.1]">Everything you need. Nothing you don't.</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div 
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5, delay: 0.0, ease: "easeOut" }}
          className="lg:col-span-7 bg-white rounded-xl border border-[#EBEBEA] p-8 md:p-10 shadow-sm flex flex-col"
        >
          <span className="text-[13px] font-medium text-[#9B9B98] mb-4">AI Generation</span>
          <h3 className="font-serif text-[32px] text-[#0C0C0B] mb-4 leading-[1.15]">Subject-aware questions that make sense</h3>
          <p className="text-[16px] text-[#6B6B68] leading-relaxed mb-8 max-w-lg">
            ASSASSIN understands context. A Data Structures assignment won't ask you to write an essay. A Business Case Study won't ask you to code. Every question fits the subject.
          </p>
          <div className="mt-auto flex flex-wrap gap-2">
            {["Problem Set", "Essay", "Case Study", "Numerical", "MCQs"].map((tag) => (
              <span key={tag} className="px-3 py-1.5 bg-[#F0EFF8] text-[#4F46E5] text-[13px] font-medium rounded-full">
                [{tag}]
              </span>
            ))}
          </div>
        </motion.div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <motion.div 
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
            className="flex-1 bg-white rounded-xl border border-[#EBEBEA] p-8 shadow-sm flex flex-col"
          >
            <span className="text-[13px] font-medium text-[#9B9B98] mb-3">Word Count Control</span>
            <h3 className="font-serif text-[26px] text-[#0C0C0B] mb-3 leading-[1.15]">500 to 1500 words — you decide</h3>
            <p className="text-[15px] text-[#6B6B68] leading-relaxed">
              Set the cognitive load. ASSASSIN adjusts question depth, marks distribution, and complexity to match.
            </p>
          </motion.div>

          <motion.div 
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5, delay: 0.24, ease: "easeOut" }}
            className="flex-1 bg-white rounded-xl border border-[#EBEBEA] p-8 shadow-sm flex flex-col"
          >
            <span className="text-[13px] font-medium text-[#9B9B98] mb-3">Instant Output</span>
            <h3 className="font-serif text-[26px] text-[#0C0C0B] mb-3 leading-[1.15]">Zero setup. No account required.</h3>
            <p className="text-[15px] text-[#6B6B68] leading-relaxed">
              Open the tool, enter your parameters, get your assignment. That's the entire workflow.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
