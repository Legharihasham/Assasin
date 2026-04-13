import Link from "next/link";

export default function CTASection() {
  return (
    <section className="bg-[#0C0C0B] py-32 px-6 w-full flex flex-col items-center justify-center text-center">
      <h2 className="font-serif text-[44px] md:text-[56px] text-white leading-[1.05] mb-6">
        Stop starting from scratch.
      </h2>
      <p className="text-[#9B9B98] text-[18px] mb-12 max-w-md mx-auto">
        ASSASSIN is free, open-source, and ready to use right now.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
        <Link 
          href="/generate" 
          className="w-full sm:w-auto bg-[#4F46E5] text-white px-6 py-3 rounded-md font-medium text-[15px] transition-transform hover:scale-[1.02]"
        >
          Generate Your First Assignment
        </Link>
        <a 
          href="https://github.com/Legharihasham/Assassin" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full sm:w-auto border border-[#2D2D2B] text-white px-6 py-3 rounded-md font-medium text-[15px] transition-colors hover:bg-[#1A1A18]"
        >
          View on GitHub
        </a>
      </div>
    </section>
  );
}
