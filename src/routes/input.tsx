import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Upload, X, ArrowRight, Plus, Network, Lock } from "lucide-react";
import { ParticleField } from "@/components/ParticleField";
import { useAnalysisStore } from "@/store/analysis";

export const Route = createFileRoute("/input")({
  component: InputScreen,
});

const PAPER_COUNTS = [150, 300, 500, 1000] as const;

function InputScreen() {
  const navigate = useNavigate();
  const setPendingRequest = useAnalysisStore((s) => s.setPendingRequest);
  const [mode, setMode] = useState<"keyword" | "upload">("keyword");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [papers, setPapers] = useState<(typeof PAPER_COUNTS)[number]>(300);

  const addKeyword = () => {
    const v = draft.trim();
    if (v && !keywords.includes(v)) setKeywords([...keywords, v]);
    setDraft("");
  };

  const canStart = mode === "keyword" && keywords.length > 0;

  const start = () => {
    if (!canStart) return;
    setPendingRequest({ topic: keywords.join(" "), papers });
    navigate({ to: "/processing" });
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 grid-bg opacity-30" />
      <ParticleField density={0.00005} />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-1/4 h-[420px] w-[520px] -translate-x-1/2 rounded-full bg-[var(--cyan)] opacity-[0.1] blur-[130px]" />
      </div>

      <header className="relative z-20 mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--cyan)]/40 bg-[var(--cyan)]/10">
            <Network className="h-5 w-5 text-[var(--cyan)]" />
          </div>
          <span className="font-mono text-sm font-semibold tracking-widest">RESEARCHGAP<span className="text-glow-cyan">AI</span></span>
        </Link>
        <span className="font-mono text-xs tracking-widest text-muted-foreground">STEP 01 · INPUT</span>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-center text-3xl font-bold md:text-4xl">Configure your analysis</h1>
          <p className="mt-3 text-center text-muted-foreground">
            Feed the engine keywords describing a research domain. It fetches live literature and finds the gaps.
          </p>

          {/* Toggle */}
          <div className="glass mx-auto mt-8 flex w-fit gap-1 rounded-full p-1">
            {(["keyword", "upload"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`relative rounded-full px-6 py-2 font-mono text-xs tracking-wider transition-colors ${
                  mode === m ? "text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode === m && (
                  <motion.span
                    layoutId="toggle"
                    className="absolute inset-0 rounded-full bg-[var(--cyan)]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  {m === "keyword" ? <Search className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
                  {m === "keyword" ? "KEYWORD SEARCH" : "UPLOAD PAPERS"}
                </span>
              </button>
            ))}
          </div>

          <div className="glass hud-corners mt-8 rounded-2xl p-6">
            <AnimatePresence mode="wait">
              {mode === "keyword" ? (
                <motion.div
                  key="kw"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <label className="font-mono text-[11px] tracking-widest text-muted-foreground">
                    KEYWORDS / DOMAIN
                  </label>
                  <div className="mt-3 flex flex-wrap gap-2 rounded-xl border border-input bg-background/40 p-3">
                    {keywords.map((k) => (
                      <span
                        key={k}
                        className="flex items-center gap-2 rounded-full bg-[var(--cyan)]/15 px-3 py-1 font-mono text-xs text-[var(--cyan)] ring-1 ring-[var(--cyan)]/30"
                      >
                        {k}
                        <button onClick={() => setKeywords(keywords.filter((x) => x !== k))}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                      placeholder="Add a keyword…"
                      className="min-w-[140px] flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <button
                      onClick={addKeyword}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--cyan)]/15 text-[var(--cyan)]"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-3 font-mono text-[11px] text-muted-foreground">
                    Press <span className="text-[var(--cyan)]">Enter</span> to add · {keywords.length} active
                  </p>

                  <label className="mt-6 block font-mono text-[11px] tracking-widest text-muted-foreground">
                    PAPERS TO FETCH
                  </label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {PAPER_COUNTS.map((n) => (
                      <button
                        key={n}
                        onClick={() => setPapers(n)}
                        className={`rounded-lg px-4 py-2 font-mono text-xs tracking-wider transition-colors ${
                          papers === n
                            ? "bg-[var(--cyan)]/15 text-[var(--cyan)] ring-1 ring-[var(--cyan)]/40"
                            : "glass glass-hover text-muted-foreground"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="up"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="relative flex cursor-not-allowed flex-col items-center justify-center rounded-xl border-2 border-dashed border-input p-10 text-center opacity-60">
                    <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-[var(--amber)]/15 px-3 py-1 font-mono text-[10px] tracking-wider text-[var(--amber)] ring-1 ring-[var(--amber)]/30">
                      <Lock className="h-3 w-3" /> COMING SOON
                    </span>
                    <Upload className="mb-3 h-8 w-8 text-[var(--cyan)] float-slow" />
                    <p className="font-medium">Drag & drop PDFs here</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      Corpus upload is not wired up yet — use keyword search for now.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 flex justify-center">
            <motion.button
              disabled={!canStart}
              onClick={start}
              whileHover={canStart ? { scale: 1.04 } : {}}
              whileTap={canStart ? { scale: 0.98 } : {}}
              className={`flex items-center gap-3 rounded-xl px-8 py-4 font-mono text-sm font-medium tracking-wide transition-all ${
                canStart
                  ? "bg-[var(--cyan)]/15 text-[var(--cyan)] shadow-[0_0_30px_-6px_var(--cyan)] ring-1 ring-[var(--cyan)]/50"
                  : "glass cursor-not-allowed text-muted-foreground opacity-50"
              }`}
            >
              Start Analysis <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
