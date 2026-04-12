"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-10 sm:px-6">
      <header className="mb-10 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-400/90">
          University of Lahore
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          UoL Assignment Generator
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Fill in your details and download a formatted DOCX with an AI-written
          body.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/40 backdrop-blur sm:p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-300">
                Student Name <span className="text-red-400">*</span>
              </span>
              <input
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-slate-100 outline-none ring-violet-500/0 transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Full name"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-300">
                SAP ID <span className="text-red-400">*</span>
              </span>
              <input
                required
                inputMode="numeric"
                pattern="[0-9]{8}"
                maxLength={8}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-slate-100 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
                value={sapId}
                onChange={(e) =>
                  setSapId(e.target.value.replace(/\D/g, "").slice(0, 8))
                }
                placeholder="8 digits"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-300">
                Section <span className="text-red-400">*</span>
              </span>
              <input
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-slate-100 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. BSCS-6K"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-300">
                Submitted To / Teacher Name <span className="text-red-400">*</span>
              </span>
              <input
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-slate-100 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
                value={submittedTo}
                onChange={(e) => setSubmittedTo(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-300">
                Subject <span className="text-red-400">*</span>
              </span>
              <input
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-slate-100 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-300">
                Assignment Number <span className="text-red-400">*</span>
              </span>
              <input
                required
                type="number"
                min={1}
                step={1}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-slate-100 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
                value={assignmentNumber}
                onChange={(e) => setAssignmentNumber(e.target.value)}
                placeholder="e.g. 1"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-300">
                Assignment Title{" "}
                <span className="font-normal text-slate-500">(optional)</span>
              </span>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-slate-100 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
                value={assignmentTitle}
                onChange={(e) => setAssignmentTitle(e.target.value)}
                placeholder="Shown as purple heading on cover"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-300">
                Word Count Target <span className="text-red-400">*</span>
              </span>
              <select
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-slate-100 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
                value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
              >
                {WORD_OPTIONS.map((w) => (
                  <option key={w} value={w}>
                    {w} words
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-slate-300">
              Assignment Instructions / Topic <span className="text-red-400">*</span>
            </span>
            <textarea
              required
              rows={5}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-slate-100 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Describe what the assignment should cover..."
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <svg
                className="h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {loading ? "Generating…" : "Generate & download DOCX"}
          </button>

          {loading && (
            <p className="text-center text-sm text-slate-400">{statusMessage}</p>
          )}
        </form>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-lg px-4 py-3 text-sm shadow-lg ${
            toast.type === "success"
              ? "border border-emerald-700/80 bg-emerald-950/95 text-emerald-100"
              : "border border-red-800/80 bg-red-950/95 text-red-100"
          }`}
          role="status"
        >
          {toast.message}
        </div>
      )}

      <footer className="mt-auto pt-12 text-center text-xs text-slate-600">
        Stateless app — no accounts or database. API keys stay on the server.
      </footer>
    </main>
  );
}
