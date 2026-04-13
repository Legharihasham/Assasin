import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0C0C0B] border-t border-[#1E1E1C] px-6 h-20 w-full flex items-center justify-between text-[13px]">
      <div className="flex-1">
        <span className="font-serif text-[16px] text-white">ASSASSIN</span>
      </div>
      <div className="flex-[2] text-center text-[#4A4A48] hidden sm:block">
        Built by Muhammad Hasham Khan
      </div>
      <div className="flex-1 text-right">
        <a 
          href="https://github.com/Legharihasham/Assassin" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-[#4A4A48] hover:text-white transition-colors"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
