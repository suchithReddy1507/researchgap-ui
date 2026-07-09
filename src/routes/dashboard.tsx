import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Network, FileDown, Radar } from "lucide-react";
import { KnowledgeMap } from "@/components/KnowledgeMap";
import { GapCard, GapDetail } from "@/components/GapDetail";
import { CountUp } from "@/components/CountUp";
import { useAnalysisStore } from "@/store/analysis";
import { gapKey } from "@/lib/gap";
import type { Gap } from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

const VERDICT_RANK: Record<Gap["verdict"], number> = { CONFIRMED: 0, WEAK: 1, REJECTED: 2, UNVERIFIED: 3 };

function Dashboard() {
  const navigate = useNavigate();
  const result = useAnalysisStore((s) => s.result);
  const [openGap, setOpenGap] = useState<string | null>(null);

  useEffect(() => {
    if (!result) navigate({ to: "/input" });
  }, [result, navigate]);

  if (!result) return null;

  const { topics, gaps, papers_count, confirmed_count } = result;
  const ranked = [...gaps].sort(
    (a, b) => VERDICT_RANK[a.verdict] - VERDICT_RANK[b.verdict] || b.prominence - a.prominence,
  );
  const gap = ranked.find((g) => gapKey(g) === openGap) ?? null;

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 grid-bg opacity-20" />

      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3.5">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--cyan)]/40 bg-[var(--cyan)]/10">
              <Network className="h-4 w-4 text-[var(--cyan)]" />
            </div>
            <span className="font-mono text-sm font-semibold tracking-widest">
              RESEARCHGAP<span className="text-glow-cyan">AI</span>
            </span>
          </Link>
          <div className="hidden items-center gap-6 font-mono text-xs md:flex">
            <Stat label="PAPERS" value={papers_count} />
            <Stat label="TOPICS" value={topics.length} />
            <Stat label="GAPS" value={gaps.length} />
            <Stat label="CONFIRMED" value={confirmed_count} />
          </div>
          <Link
            to="/report"
            className="flex items-center gap-2 rounded-lg bg-[var(--cyan)]/15 px-4 py-2 font-mono text-xs tracking-wider text-[var(--cyan)] ring-1 ring-[var(--cyan)]/40 transition-colors hover:bg-[var(--cyan)]/25"
          >
            <FileDown className="h-3.5 w-3.5" /> REPORT
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-4 px-4 py-4 lg:grid-cols-[1fr_400px]">
        {/* Knowledge map */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass hud-corners relative overflow-hidden rounded-2xl"
          style={{ height: "calc(100vh - 96px)" }}
        >
          <div className="absolute left-4 top-4 z-10">
            <h1 className="text-lg font-bold">Knowledge Map</h1>
            <p className="font-mono text-[11px] text-muted-foreground">
              Nodes = topic clusters · <span className="text-[var(--violet)]">dashed zones = confirmed/weak gaps</span>
            </p>
          </div>
          <div className="absolute left-4 bottom-4 z-10 flex gap-3 font-mono text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--cyan)]" /> topic
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full border border-dashed border-[var(--violet)]" /> gap zone
            </span>
            <span>drag · zoom · click a gap</span>
          </div>
          <KnowledgeMap topics={topics} gaps={gaps} onGapClick={(key) => setOpenGap(key)} activeGapId={openGap} />
        </motion.section>

        {/* Gap sidebar */}
        <aside className="flex flex-col overflow-hidden" style={{ height: "calc(100vh - 96px)" }}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Radar className="h-4 w-4 text-[var(--violet)]" /> Detected Gaps
            </h2>
            <span className="font-mono text-xs text-muted-foreground">{gaps.length} found</span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {ranked.length === 0 && (
              <p className="glass rounded-xl p-4 text-sm text-muted-foreground">
                No candidate gaps survived detection for this topic.
              </p>
            )}
            {ranked.map((g, i) => (
              <motion.div
                key={gapKey(g)}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <GapCard gap={g} onOpen={() => setOpenGap(gapKey(g))} />
              </motion.div>
            ))}
          </div>
        </aside>
      </main>

      {gap && openGap && (
        <GapDetail gap={gap} topics={topics} gaps={gaps} gapId={openGap} onClose={() => setOpenGap(null)} />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-base font-bold text-glow-cyan">
        <CountUp to={value} duration={1.2} immediate />
      </div>
      <div className="text-[9px] tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
