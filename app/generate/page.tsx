"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const LOADING_MESSAGES = [
  "Generating your assignment with AI...",
  "Structuring content...",
  "Building your DOCX file...",
  "Almost ready...",
] as const;

const WORD_OPTIONS = [500, 800, 1000, 1500] as const;

type ToastState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

function parseFilenameFromDisposition(header: string | null): string | null {
  if (!header) {
    return null;
  }
  const m = /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(header);
  if (m?.[1]) {
    try {
      return decodeURIComponent(m[1].replace(/\+/g, " "));
    } catch {
      return m[1];
    }
  }
  return null;
}

export default function HomePage() {
  const [studentName, setStudentName] = useState("");
  const [sapId, setSapId] = useState("");
  const [section, setSection] = useState("");
  const [submittedTo, setSubmittedTo] = useState("");
  const [subject, setSubject] = useState("");
  const [assignmentNumber, setAssignmentNumber] = useState("");
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [wordCount, setWordCount] = useState<number>(800);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [toast, setToast] = useState<ToastState>(null);
  const msgIndexRef = useRef(0);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loading) {
      return;
    }
    msgIndexRef.current = 0;
    setStatusMessage(LOADING_MESSAGES[0]);
    const id = setInterval(() => {
      msgIndexRef.current =
        (msgIndexRef.current + 1) % LOADING_MESSAGES.length;
      setStatusMessage(LOADING_MESSAGES[msgIndexRef.current]);
    }, 1800);
    return () => clearInterval(id);
  }, [loading]);

  const showToast = useCallback((t: ToastState, durationMs = 5000) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast(t);
    if (t) {
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
        toastTimerRef.current = null;
      }, durationMs);
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    const an = Number(assignmentNumber);
    if (!Number.isFinite(an) || an < 1) {
      showToast({ type: "error", message: "Enter a valid assignment number." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          sapId,
          section,
          submittedTo,
          subject,
          assignmentNumber: an,
          assignmentTitle: assignmentTitle.trim() || undefined,
          instructions,
          wordCount,
        }),
      });

      if (res.status === 429) {
        showToast({
          type: "error",
          message: "You've hit the rate limit. Try again in an hour.",
        });
        return;
      }

      if (!res.ok) {
        let errText = "Something went wrong. Please try again.";
        try {
          const j = (await res.json()) as { error?: string };
          if (j.error) {
            errText = j.error;
          }
        } catch {
          /* ignore */
        }
        showToast({ type: "error", message: errText });
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        parseFilenameFromDisposition(
          res.headers.get("Content-Disposition"),
        ) ?? "Assignment.docx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      showToast({
        type: "success",
        message: "Your assignment downloaded successfully.",
      });
    } catch {
      showToast({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
      setStatusMessage("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] overflow-x-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col w-full items-center pt-24 pb-12 px-6 mt-16 sm:mt-8">
        <div className="max-w-2xl w-full mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10 text-center"
          >
            <h1 className="font-serif text-[40px] sm:text-[48px] leading-[1.1] text-[#0C0C0B] mb-4">
              Generate Assignment
            </h1>
            <p className="text-[16px] text-[#6B6B68] max-w-[480px] mx-auto">
              Fill in your details and let AI write and format your DOCX file perfectly in seconds.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-[#E5E4E0] rounded-xl p-6 sm:p-8 shadow-sm"
          >
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-[#6B6B68]">
                    Student Name <span className="text-[#E03131]">*</span>
                  </span>
                  <input
                    required
                    className="w-full rounded-md border border-[#E5E4E0] bg-white px-3 py-2.5 text-[15px] text-[#0C0C0B] outline-none transition-all placeholder:text-[#A1A19A] focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Full name"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-[#6B6B68]">
                    SAP ID <span className="text-[#E03131]">*</span>
                  </span>
                  <input
                    required
                    inputMode="numeric"
                    pattern="[0-9]{8}"
                    maxLength={8}
                    className="w-full rounded-md border border-[#E5E4E0] bg-white px-3 py-2.5 text-[15px] text-[#0C0C0B] outline-none transition-all placeholder:text-[#A1A19A] focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
                    value={sapId}
                    onChange={(e) =>
                      setSapId(e.target.value.replace(/\D/g, "").slice(0, 8))
                    }
                    placeholder="8 digits"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-[#6B6B68]">
                    Section <span className="text-[#E03131]">*</span>
                  </span>
                  <input
                    required
                    className="w-full rounded-md border border-[#E5E4E0] bg-white px-3 py-2.5 text-[15px] text-[#0C0C0B] outline-none transition-all placeholder:text-[#A1A19A] focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="e.g. BSCS-6K"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-[#6B6B68]">
                    Submitted To / Teacher Name <span className="text-[#E03131]">*</span>
                  </span>
                  <input
                    required
                    className="w-full rounded-md border border-[#E5E4E0] bg-white px-3 py-2.5 text-[15px] text-[#0C0C0B] outline-none transition-all placeholder:text-[#A1A19A] focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
                    value={submittedTo}
                    onChange={(e) => setSubmittedTo(e.target.value)}
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block text-[13px] font-medium text-[#6B6B68]">
                    Subject <span className="text-[#E03131]">*</span>
                  </span>
                  <input
                    required
                    className="w-full rounded-md border border-[#E5E4E0] bg-white px-3 py-2.5 text-[15px] text-[#0C0C0B] outline-none transition-all placeholder:text-[#A1A19A] focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-[#6B6B68]">
                    Assignment Number <span className="text-[#E03131]">*</span>
                  </span>
                  <input
                    required
                    type="number"
                    min={1}
                    step={1}
                    className="w-full rounded-md border border-[#E5E4E0] bg-white px-3 py-2.5 text-[15px] text-[#0C0C0B] outline-none transition-all placeholder:text-[#A1A19A] focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
                    value={assignmentNumber}
                    onChange={(e) => setAssignmentNumber(e.target.value)}
                    placeholder="e.g. 1"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-[#6B6B68]">
                    Word Count Target <span className="text-[#E03131]">*</span>
                  </span>
                  <div className="relative">
                    <select
                      required
                      className="w-full rounded-md border border-[#E5E4E0] bg-white px-3 py-2.5 text-[15px] text-[#0C0C0B] outline-none transition-all focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 appearance-none"
                      value={wordCount}
                      onChange={(e) => setWordCount(Number(e.target.value))}
                    >
                      {WORD_OPTIONS.map((w) => (
                        <option key={w} value={w}>
                          {w} words
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#6B6B68]">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block text-[13px] font-medium text-[#6B6B68]">
                    Assignment Title <span className="font-normal text-[#A1A19A]">(optional)</span>
                  </span>
                  <input
                    className="w-full rounded-md border border-[#E5E4E0] bg-white px-3 py-2.5 text-[15px] text-[#0C0C0B] outline-none transition-all placeholder:text-[#A1A19A] focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    placeholder="Shown at the top of cover page"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-[#6B6B68]">
                  Assignment Instructions / Topic <span className="text-[#E03131]">*</span>
                </span>
                <textarea
                  required
                  rows={5}
                  className="w-full rounded-md border border-[#E5E4E0] bg-white px-3 py-2.5 text-[15px] text-[#0C0C0B] outline-none transition-all placeholder:text-[#A1A19A] focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 resize-y"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Describe what the assignment should cover..."
                />
              </label>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#4F46E5] text-white px-6 py-3.5 rounded-md font-medium text-[15px] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {statusMessage || "Generating…"}
                    </>
                  ) : (
                    "Generate & download DOCX"
                  )}
                </button>
              </div>
              <p className="text-center text-[13px] text-[#A1A19A] mt-4">
                AI can make mistakes. Please review the content before submitting.
              </p>
            </form>
          </motion.div>
        </div>
      </main>

      <Footer />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
              toast.type === "success"
                ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"
                : "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <p className="text-[14px] font-medium">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
